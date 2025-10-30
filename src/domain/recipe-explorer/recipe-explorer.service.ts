import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { RecipeRepository } from '../../core/repositories/recipe/recipe.repository';
import { RECIPE_REPOSITORY } from '../../core/repositories/recipe/recipe.repository.interface';
import { UserRecipeRequestRepository } from '../../core/repositories/recipe/user-recipe-request.repository';
import { USER_RECIPE_REQUEST_REPOSITORY } from '../../core/repositories/repositories.module';
import { YoutubeRawRepository } from '../../core/repositories/youtube-raw/youtube-raw.repository';
import { YOUTUBE_RAW_REPOSITORY_TOKEN } from '../../core/repositories/youtube-raw/youtube-raw.repository.interface';
import { RecipeExplorerResponseDto } from './dto/recipe-explorer-response.dto';
import { RecipeListItemDto } from '../recipe-search/dto/recipe-list-item.dto';
import { Recipe, RecipeStatus } from '../../core/entities/recipe/recipe.entity';

@Injectable()
export class RecipeExplorerService {
  constructor(
    @Inject(RECIPE_REPOSITORY)
    private readonly recipeRepository: RecipeRepository,
    @Inject(USER_RECIPE_REQUEST_REPOSITORY)
    private readonly userRecipeRequestRepository: UserRecipeRequestRepository,
    @Inject(YOUTUBE_RAW_REPOSITORY_TOKEN)
    private readonly youtubeRawRepository: YoutubeRawRepository,
  ) {}

  /**
   * 유저에게 추천할 레시피 탐색 데이터 조회
   */
  async exploreRecipes(userId: number): Promise<RecipeExplorerResponseDto> {
    // 유저가 이전에 요청했던 레시피 목록
    const requestedRecipes = await this.getUserRequestedRecipes(userId);

    // 추천 레시피 (유저가 요청한 레시피와 유사한 카테고리)
    const recommendedRecipes = await this.getRecommendedRecipes(userId, requestedRecipes);

    // 최근 인기 레시피 (조회수 기준)
    const trendingRecipes = await this.getTrendingRecipes(10);

    return {
      recommendedRecipes,
      requestedRecipes,
      trendingRecipes,
    };
  }

  /**
   * 유저가 요청한 레시피 목록 조회
   */
  async getUserRequestHistory(userId: number, limit: number = 50): Promise<RecipeListItemDto[]> {
    const requests = await this.userRecipeRequestRepository.findByUserId(userId, limit);
    
    // recipe가 null인 경우 필터링 (레시피가 삭제된 경우)
    const validRequests = requests.filter(request => request.recipe !== null);
    
    return await Promise.all(
      validRequests.map(async (request) => this.mapToListItem(request.recipe))
    );
  }

  /**
   * 유저가 이전에 요청했던 레시피 목록 (최근 20개)
   */
  private async getUserRequestedRecipes(userId: number): Promise<RecipeListItemDto[]> {
    const requests = await this.userRecipeRequestRepository.findByUserId(userId, 20);
    
    // recipe가 null인 경우 필터링 (레시피가 삭제된 경우)
    const validRequests = requests.filter(request => request.recipe !== null);
    
    return await Promise.all(
      validRequests.map(async (request) => this.mapToListItem(request.recipe))
    );
  }

  /**
   * 유저에게 추천할 레시피 목록
   */
  private async getRecommendedRecipes(userId: number, requestedRecipes: RecipeListItemDto[]): Promise<RecipeListItemDto[]> {
    // 유저가 요청한 레시피의 카테고리 분석
    const categories = new Set<string>();
    requestedRecipes.forEach(recipe => {
      if (recipe.categories) {
        recipe.categories.forEach(cat => categories.add(cat));
      }
    });

    if (categories.size === 0) {
      // 카테고리 정보가 없으면 최신 레시피 반환
      const recipes = await this.recipeRepository.find({
        where: { status: RecipeStatus.COMPLETED },
        order: { createdAt: 'DESC' },
        take: 10,
      });
      return await Promise.all(recipes.map(recipe => this.mapToListItem(recipe)));
    }

    // 유사한 카테고리의 레시피 찾기
    const allRecipes = await this.recipeRepository.find({
      where: { status: RecipeStatus.COMPLETED },
      order: { createdAt: 'DESC' },
      take: 100,
    });

    // 카테고리 매칭 점수 계산
    const recipesWithScore = allRecipes
      .filter(recipe => 
        // 이미 요청한 레시피는 제외
        !requestedRecipes.some(requested => requested.id === recipe.id)
      )
      .map(recipe => {
        let score = 0;
        if (recipe.categories) {
          recipe.categories.forEach(cat => {
            if (categories.has(cat)) score++;
          });
        }
        return { recipe, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return await Promise.all(
      recipesWithScore.map(item => this.mapToListItem(item.recipe))
    );
  }

  /**
   * 인기 레시피 조회 (public API)
   */
  async getPopularRecipes(limit: number = 10): Promise<RecipeListItemDto[]> {
    return await this.getTrendingRecipes(limit);
  }

  /**
   * 최근 인기 레시피 목록 (조회수 기준)
   */
  private async getTrendingRecipes(limit: number = 10): Promise<RecipeListItemDto[]> {
    const recipes = await this.recipeRepository.find({
      where: { status: RecipeStatus.COMPLETED },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    // 유튜브 조회수 기준으로 정렬
    const recipesWithViews = await Promise.all(
      recipes.map(async (recipe) => {
        const youtubeData = await this.youtubeRawRepository.findByVideoId(recipe.youtubeId);
        return {
          recipe,
          viewCount: youtubeData?.viewCount || 0,
        };
      })
    );

    recipesWithViews.sort((a, b) => Number(b.viewCount) - Number(a.viewCount));

    const topRecipes = recipesWithViews.slice(0, limit).map(item => item.recipe);

    return await Promise.all(topRecipes.map(recipe => this.mapToListItem(recipe)));
  }

  /**
   * 레시피를 목록 아이템 DTO로 변환
   */
  private async mapToListItem(recipe: Recipe): Promise<RecipeListItemDto> {
    const youtubeData = await this.youtubeRawRepository.findByVideoId(recipe.youtubeId);

    return {
      id: recipe.id,
      youtubeId: recipe.youtubeId,
      title: recipe.title,
      description: recipe.description,
      thumbnailUrl: youtubeData?.thumbnails?.high?.url || youtubeData?.thumbnails?.default?.url,
      channelName: youtubeData?.channelName,
      viewCount: youtubeData?.viewCount ? Number(youtubeData.viewCount) : undefined,
      categories: recipe.categories,
      tags: recipe.tags,
      difficulty: recipe.difficulty,
      estimatedTime: recipe.estimatedTime,
      servings: recipe.servings,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
    };
  }
}

