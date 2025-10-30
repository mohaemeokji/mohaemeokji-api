import { Recipe, RecipeStatus } from '../../entities/recipe/recipe.entity';

export interface IRecipeRepository {
  findByYoutubeId(youtubeId: string): Promise<Recipe | null>;
  findById(id: string): Promise<Recipe | null>;
  findAll(limit?: number, offset?: number): Promise<Recipe[]>;
  findByStatus(status: RecipeStatus): Promise<Recipe[]>;
  save(recipe: Recipe): Promise<Recipe>;
  update(id: string, data: Partial<Recipe>): Promise<Recipe>;
  delete(id: string): Promise<void>;
}

export const RECIPE_REPOSITORY = Symbol('RECIPE_REPOSITORY');

