import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Recipe, RecipeStatus } from '../../core/entities/recipe/recipe.entity';
import { RecipeRepository } from '../../core/repositories/recipe/recipe.repository';
import { YoutubeService } from '../../core/components/youtube/youtube.service';
import { GeminiService } from '../../core/components/gemini/gemini.service';
import { YoutubeIdExtractorService } from '../../core/utils/youtube/youtube-id-extractor.service';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface PromptConfig {
  system_instruction: string;
  response_schema: any;
  generation_config: any;
}

@Injectable()
export class RecipeGeneratorService {
  private readonly logger = new Logger(RecipeGeneratorService.name);
  private promptConfig: PromptConfig;

  constructor(
    private readonly recipeRepository: RecipeRepository,
    private readonly youtubeService: YoutubeService,
    private readonly geminiService: GeminiService,
    private readonly youtubeIdExtractor: YoutubeIdExtractorService,
  ) {
    this.loadPromptConfig();
  }

  private loadPromptConfig() {
    const distPath = path.join(__dirname, 'prompts', 'recipe-extraction.yaml');
    const srcPath = path.join(process.cwd(), 'src', 'domain', 'recipe-generator', 'prompts', 'recipe-extraction.yaml');
    
    let promptPath = distPath;
    if (!fs.existsSync(distPath) && fs.existsSync(srcPath)) {
      promptPath = srcPath;
    }
    
    const fileContents = fs.readFileSync(promptPath, 'utf8');
    this.promptConfig = yaml.load(fileContents) as PromptConfig;
  }

  async generateRecipe(videoIdOrUrl: string): Promise<Recipe> {
    const videoId = this.youtubeIdExtractor.extractVideoId(videoIdOrUrl);

    const existingRecipe = await this.recipeRepository.findByYoutubeId(videoId);

    if (existingRecipe) {
      if (existingRecipe.isProcessing()) {
        return existingRecipe;
      }

      if (existingRecipe.isCompleted()) {
        return existingRecipe;
      }

      if (existingRecipe.isFailed()) {
        await this.recipeRepository.update(existingRecipe.id, {
          status: RecipeStatus.PROCESSING,
          errorMessage: null,
        });
      }
    }

    const recipe = existingRecipe || new Recipe();
    recipe.youtubeId = videoId;
    recipe.status = RecipeStatus.PROCESSING;

    const savedRecipe = await this.recipeRepository.save(recipe);

    this.processRecipeInBackground(savedRecipe.id, videoId);

    return savedRecipe;
  }

  private async processRecipeInBackground(recipeId: string, videoId: string) {
    try {
      const youtubeData = await this.youtubeService.getComprehensiveVideoData(videoId);

      if (!youtubeData.transcriptFullText) {
        throw new Error('자막 데이터를 찾을 수 없습니다.');
      }

      const transcriptText = youtubeData.transcriptSegments
        .map((seg: any) => `[${(seg.startMs / 1000).toFixed(2)}s] ${seg.text}`)
        .join('\n');

      const geminiRequest = {
        contents: [{ role: 'user', parts: [{ text: transcriptText }] }],
        systemInstruction: {
          role: 'system',
          parts: [{ text: this.promptConfig.system_instruction }],
        },
        generationConfig: {
          ...this.promptConfig.generation_config,
          responseMimeType: 'application/json',
          responseSchema: this.promptConfig.response_schema,
        },
      };

      const result = await this.geminiService.generate(geminiRequest);
      const recipeData = JSON.parse(result.response.text());

      await this.recipeRepository.update(recipeId, {
        status: RecipeStatus.COMPLETED,
        title: recipeData.basic_info.title,
        description: recipeData.basic_info.description,
        difficulty: recipeData.basic_info.difficulty,
        estimatedTime: recipeData.basic_info.estimated_time,
        servings: recipeData.basic_info.servings,
        categories: recipeData.metadata.categories,
        tags: recipeData.metadata.tags,
        ingredients: recipeData.ingredients,
        steps: recipeData.steps,
        nutrition: recipeData.nutrition,
      });

      this.logger.log(`✅ 레시피 생성 완료: ${videoId}`);
    } catch (error: any) {
      this.logger.error(`❌ 레시피 생성 실패: ${videoId}`, error.stack);
      await this.recipeRepository.update(recipeId, {
        status: RecipeStatus.FAILED,
        errorMessage: error.message,
      });
    }
  }

  async getRecipe(videoIdOrUrl: string): Promise<Recipe> {
    const videoId = this.youtubeIdExtractor.extractVideoId(videoIdOrUrl);
    const recipe = await this.recipeRepository.findByYoutubeId(videoId);

    if (!recipe) {
      throw new NotFoundException(`레시피를 찾을 수 없습니다: ${videoId}`);
    }

    return recipe;
  }

  async getRecipeById(id: string): Promise<Recipe> {
    const recipe = await this.recipeRepository.findById(id);

    if (!recipe) {
      throw new NotFoundException(`레시피를 찾을 수 없습니다: ${id}`);
    }

    return recipe;
  }


  async deleteRecipe(id: string): Promise<void> {
    await this.recipeRepository.delete(id);
  }
}

