import { Controller, Post, Get, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { RecipeGeneratorService } from './recipe-generator.service';
import { GenerateRecipeRequestDto } from './dto/generate-recipe-request.dto';
import { RecipeResponseDto } from './dto/recipe-response.dto';
import { AuthGuard } from '../iam/decorators/auth-guard.decorator';
import { AuthType } from '../iam/enums/auth-type.enum';
import { GetUser } from '../users/decorators/get-user.decorator';
import { JwtUser } from '../iam/interfaces/jwt-user.interface';

@ApiTags('Recipe Generator [레시피 만드는 API DB 연동된 상태]')
@Controller('recipe-generator')
@ApiBearerAuth()
@AuthGuard(AuthType.Bearer)
export class RecipeGeneratorController {
  constructor(private readonly recipeGeneratorService: RecipeGeneratorService) {}

  @Post('generate')
  @ApiOperation({ 
    summary: '레시피 생성 요청',
    description: '유튜브 비디오로부터 레시피를 생성합니다. 이미 생성중이거나 완료된 경우 기존 데이터를 반환합니다. 요청 내역이 자동으로 기록됩니다.'
  })
  @ApiResponse({ status: 200, description: '레시피 생성 요청 성공', type: RecipeResponseDto })
  async generateRecipe(
    @GetUser() user: JwtUser,
    @Body() dto: GenerateRecipeRequestDto
  ): Promise<RecipeResponseDto> {
    const recipe = await this.recipeGeneratorService.generateRecipe(dto.videoIdOrUrl, user.sub);
    return this.mapToDto(recipe);
  }

  @Get('recipe/:videoIdOrUrl')
  @ApiOperation({ 
    summary: '레시피 조회 (비디오 ID/URL로)',
    description: '유튜브 비디오 ID 또는 URL로 레시피를 조회합니다.'
  })
  @ApiParam({ name: 'videoIdOrUrl', description: '유튜브 비디오 ID 또는 URL' })
  @ApiResponse({ status: 200, description: '레시피 조회 성공', type: RecipeResponseDto })
  @ApiResponse({ status: 404, description: '레시피를 찾을 수 없습니다' })
  async getRecipe(@Param('videoIdOrUrl') videoIdOrUrl: string): Promise<RecipeResponseDto> {
    const recipe = await this.recipeGeneratorService.getRecipe(videoIdOrUrl);
    return this.mapToDto(recipe);
  }

  @Get('recipe/id/:id')
  @ApiOperation({ 
    summary: '레시피 조회 (레시피 ID로)',
    description: '레시피 ID로 레시피를 조회합니다.'
  })
  @ApiParam({ name: 'id', description: '레시피 ID (UUID)' })
  @ApiResponse({ status: 200, description: '레시피 조회 성공', type: RecipeResponseDto })
  @ApiResponse({ status: 404, description: '레시피를 찾을 수 없습니다' })
  async getRecipeById(@Param('id') id: string): Promise<RecipeResponseDto> {
    const recipe = await this.recipeGeneratorService.getRecipeById(id);
    return this.mapToDto(recipe);
  }

  @Delete('recipe/:id')
  @ApiOperation({ 
    summary: '레시피 삭제',
    description: '레시피 ID로 레시피를 삭제합니다.'
  })
  @ApiParam({ name: 'id', description: '레시피 ID (UUID)' })
  @ApiResponse({ status: 200, description: '레시피 삭제 성공' })
  async deleteRecipe(@Param('id') id: string): Promise<{ message: string }> {
    await this.recipeGeneratorService.deleteRecipe(id);
    return { message: '레시피가 삭제되었습니다.' };
  }

  private mapToDto(recipe: any): RecipeResponseDto {
    return {
      id: recipe.id,
      youtubeId: recipe.youtubeId,
      status: recipe.status,
      title: recipe.title,
      description: recipe.description,
      steps: recipe.steps,
      ingredients: recipe.ingredients,
      nutrition: recipe.nutrition,
      categories: recipe.categories,
      tags: recipe.tags,
      difficulty: recipe.difficulty,
      estimatedTime: recipe.estimatedTime,
      servings: recipe.servings,
      errorMessage: recipe.errorMessage,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
    };
  }
}

