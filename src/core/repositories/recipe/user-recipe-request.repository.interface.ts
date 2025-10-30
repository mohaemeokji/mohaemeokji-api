import { UserRecipeRequest } from '../../entities/recipe/user-recipe-request.entity';

export interface IUserRecipeRequestRepository {
  /**
   * 유저-레시피 요청 생성 또는 업데이트
   */
  createOrUpdate(userId: number, recipeId: string): Promise<UserRecipeRequest>;

  /**
   * 유저의 모든 레시피 요청 조회
   */
  findByUserId(userId: number, limit?: number): Promise<UserRecipeRequest[]>;

  /**
   * 특정 유저-레시피 조합 조회
   */
  findByUserIdAndRecipeId(userId: number, recipeId: string): Promise<UserRecipeRequest | null>;

  /**
   * 유저의 최근 레시피 요청 조회
   */
  findRecentByUserId(userId: number, days: number, limit?: number): Promise<UserRecipeRequest[]>;
}

