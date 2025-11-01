import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RecipeSearchService } from './recipe-search.service';
import { RecipeSearchQueryDto } from './dto/recipe-search-query.dto';
import { RecipeSearchResponseDto } from './dto/recipe-search-response.dto';
import { SuggestedKeywordsResponseDto } from './dto/suggested-keywords-response.dto';
import { RecipeListItemDto } from './dto/recipe-list-item.dto';
import { AuthGuard } from '../iam/decorators/auth-guard.decorator';
import { AuthType } from '../iam/enums/auth-type.enum';

@ApiTags('Recipe Search [임시 구축된 버전 데이터는 DB와는 연동 된 상태]')
@Controller('recipe-search')
@ApiBearerAuth()
@AuthGuard(AuthType.Bearer)
export class RecipeSearchController {
  constructor(private readonly recipeSearchService: RecipeSearchService) {}

  @Get('search')
  @ApiOperation({ 
    summary: '레시피 검색', 
    description: '키워드로 레시피를 검색하고 페이지네이션된 결과를 반환합니다.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '검색 결과 반환', 
    type: RecipeSearchResponseDto 
  })
  async searchRecipes(
    @Query() query: RecipeSearchQueryDto
  ): Promise<RecipeSearchResponseDto> {
    return await this.recipeSearchService.searchRecipes(query);
  }

  @Get('popular-keywords')
  @ApiOperation({ 
    summary: '인기 키워드 조회', 
    description: '카테고리별 레시피 수가 많은 인기 키워드 목록을 반환합니다.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '인기 키워드 목록', 
    type: SuggestedKeywordsResponseDto 
  })
  async getPopularKeywords(): Promise<SuggestedKeywordsResponseDto> {
    return await this.recipeSearchService.getPopularKeywords();
  }

  @Get('suggested-keywords')
  @ApiOperation({ 
    summary: '검색어 자동완성', 
    description: '유저가 입력한 글자를 기반으로 검색어를 자동완성해줍니다.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '자동완성 검색어 목록', 
    type: SuggestedKeywordsResponseDto 
  })
  async getSuggestedKeywords(
    @Query('input') input: string
  ): Promise<SuggestedKeywordsResponseDto> {
    return await this.recipeSearchService.getSuggestedKeywords(input);
  }
}

