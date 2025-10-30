import { ApiProperty } from '@nestjs/swagger';
import { RecipeListItemDto } from '../../recipe-search/dto/recipe-list-item.dto';

export class RecipeExplorerResponseDto {
  @ApiProperty({ 
    description: '추천 레시피 목록', 
    type: [RecipeListItemDto] 
  })
  recommendedRecipes: RecipeListItemDto[];

  @ApiProperty({ 
    description: '유저가 이전에 요청했던 레시피 목록', 
    type: [RecipeListItemDto] 
  })
  requestedRecipes: RecipeListItemDto[];

  @ApiProperty({ 
    description: '최근 인기 레시피 목록', 
    type: [RecipeListItemDto] 
  })
  trendingRecipes: RecipeListItemDto[];
}

