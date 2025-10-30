import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RecipeExplorerService } from './recipe-explorer.service';
import { RecipeExplorerResponseDto } from './dto/recipe-explorer-response.dto';
import { CreateRecipeRequestDto } from './dto/create-recipe-request.dto';
import { UserRecipeRequestResponseDto } from './dto/user-recipe-request-response.dto';
import { RecipeListItemDto } from '../recipe-search/dto/recipe-list-item.dto';
import { AuthGuard } from '../iam/decorators/auth-guard.decorator';
import { AuthType } from '../iam/enums/auth-type.enum';
import { GetUser } from '../users/decorators/get-user.decorator';
import { JwtUser } from '../iam/interfaces/jwt-user.interface';

@ApiTags('Recipe Explorer')
@Controller('recipe-explorer')
@ApiBearerAuth()
@AuthGuard(AuthType.Bearer)
export class RecipeExplorerController {
  constructor(private readonly recipeExplorerService: RecipeExplorerService) {}

  @Get('explore')
  @ApiOperation({ 
    summary: '레시피 탐색', 
    description: '유저에게 추천할 레시피와 요청 이력을 반환합니다.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '레시피 탐색 결과', 
    type: RecipeExplorerResponseDto 
  })
  async exploreRecipes(
    @GetUser() user: JwtUser
  ): Promise<RecipeExplorerResponseDto> {
    return await this.recipeExplorerService.exploreRecipes(user.sub);
  }

  @Get('popular')
  @ApiOperation({ 
    summary: '인기 레시피 조회', 
    description: '조회수 기준 인기 레시피 목록을 반환합니다.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '인기 레시피 목록', 
    type: [RecipeListItemDto] 
  })
  async getPopularRecipes(): Promise<RecipeListItemDto[]> {
    return await this.recipeExplorerService.getPopularRecipes();
  }

  @Get('my-requests')
  @ApiOperation({ 
    summary: '내 레시피 요청 이력', 
    description: '유저가 요청한 레시피 목록을 조회합니다.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '요청 이력 목록', 
    type: [RecipeListItemDto] 
  })
  async getUserRequestHistory(
    @GetUser() user: JwtUser
  ): Promise<RecipeListItemDto[]> {
    return await this.recipeExplorerService.getUserRequestHistory(user.sub);
  }
}

