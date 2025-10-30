import { Injectable, Inject } from '@nestjs/common';
import { RecipeRepository } from '../../core/repositories/recipe/recipe.repository';
import { RECIPE_REPOSITORY } from '../../core/repositories/recipe/recipe.repository.interface';
import { YoutubeRawRepository } from '../../core/repositories/youtube-raw/youtube-raw.repository';
import { YOUTUBE_RAW_REPOSITORY_TOKEN } from '../../core/repositories/youtube-raw/youtube-raw.repository.interface';
import { RecipeSearchQueryDto } from './dto/recipe-search-query.dto';
import { RecipeSearchResponseDto, PaginationMetaDto } from './dto/recipe-search-response.dto';
import { RecipeListItemDto } from './dto/recipe-list-item.dto';
import { SuggestedKeywordsResponseDto, KeywordItemDto } from './dto/suggested-keywords-response.dto';
import { Recipe, RecipeStatus } from '../../core/entities/recipe/recipe.entity';
import { Like } from 'typeorm';

@Injectable()
export class RecipeSearchService {
  constructor(
    @Inject(RECIPE_REPOSITORY)
    private readonly recipeRepository: RecipeRepository,
    @Inject(YOUTUBE_RAW_REPOSITORY_TOKEN)
    private readonly youtubeRawRepository: YoutubeRawRepository,
  ) {}

  /**
   * 레시피 검색 및 목록 조회 (페이지네이션)
   */
  async searchRecipes(query: RecipeSearchQueryDto): Promise<RecipeSearchResponseDto> {
    const { keyword, category, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const whereConditions: any = {
      status: RecipeStatus.COMPLETED, // 완료된 레시피만
    };

    if (keyword) {
      // 제목 또는 설명에 키워드 포함
      whereConditions.title = Like(`%${keyword}%`);
    }

    if (category) {
      // 카테고리 배열에 포함되는지 확인 (JSON 컬럼 검색)
      // TypeORM에서는 JSON 배열 검색이 제한적이므로 추가 필터링 필요
    }

    // 레시피 조회
    const [recipes, totalItems] = await this.recipeRepository.findAndCount({
      where: whereConditions,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // 카테고리 필터링 (TypeORM JSON 배열 검색 제약으로 인한 추가 필터링)
    let filteredRecipes = recipes;
    if (category) {
      filteredRecipes = recipes.filter(recipe => 
        recipe.categories && recipe.categories.includes(category)
      );
    }

    // 유튜브 데이터 매핑
    const items = await Promise.all(
      filteredRecipes.map(async (recipe) => this.mapToListItem(recipe))
    );

    // 페이지네이션 메타 정보
    const totalPages = Math.ceil(totalItems / limit);
    const meta: PaginationMetaDto = {
      currentPage: page,
      itemsPerPage: limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return { items, meta };
  }

  /**
   * 인기 키워드 조회
   */
  async getPopularKeywords(limit: number = 10): Promise<SuggestedKeywordsResponseDto> {
    const recipes = await this.recipeRepository.find({
      where: { status: RecipeStatus.COMPLETED },
    });

    const categoryCount = new Map<string, number>();
    
    recipes.forEach(recipe => {
      if (recipe.categories && recipe.categories.length > 0) {
        recipe.categories.forEach(category => {
          categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
        });
      }
    });

    const sortedKeywords = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([keyword, count]) => ({ keyword, count }));

    return { keywords: sortedKeywords };
  }

  /**
   * 검색어 자동완성
   */
  async getSuggestedKeywords(input: string, limit: number = 10): Promise<SuggestedKeywordsResponseDto> {
    if (!input || input.trim().length === 0) {
      return { keywords: [] };
    }

    const recipes = await this.recipeRepository.find({
      where: { status: RecipeStatus.COMPLETED },
    });

    const keywordCount = new Map<string, number>();

    // 레시피 제목, 카테고리, 태그에서 입력값과 매칭되는 키워드 찾기
    recipes.forEach(recipe => {
      // 제목에서 검색
      if (recipe.title && recipe.title.toLowerCase().includes(input.toLowerCase())) {
        keywordCount.set(recipe.title, (keywordCount.get(recipe.title) || 0) + 1);
      }

      // 카테고리에서 검색
      if (recipe.categories) {
        recipe.categories.forEach(category => {
          if (category.toLowerCase().includes(input.toLowerCase())) {
            keywordCount.set(category, (keywordCount.get(category) || 0) + 1);
          }
        });
      }

      // 태그에서 검색
      if (recipe.tags) {
        recipe.tags.forEach(tag => {
          if (tag.toLowerCase().includes(input.toLowerCase())) {
            keywordCount.set(tag, (keywordCount.get(tag) || 0) + 1);
          }
        });
      }
    });

    const sortedKeywords = Array.from(keywordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([keyword, count]) => ({ keyword, count }));

    return { keywords: sortedKeywords };
  }

  /**
   * 레시피를 목록 아이템 DTO로 변환
   */
  private async mapToListItem(recipe: Recipe): Promise<RecipeListItemDto> {
    // 유튜브 데이터 조회
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

