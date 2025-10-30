import { Recipe, RecipeStatus } from '../../entities/recipe/recipe.entity';
import { FindManyOptions } from 'typeorm';

export interface IRecipeRepository {
  findByYoutubeId(youtubeId: string): Promise<Recipe | null>;
  findById(id: string): Promise<Recipe | null>;
  findAll(limit?: number, offset?: number): Promise<Recipe[]>;
  findByStatus(status: RecipeStatus): Promise<Recipe[]>;
  find(options?: FindManyOptions<Recipe>): Promise<Recipe[]>;
  findAndCount(options?: FindManyOptions<Recipe>): Promise<[Recipe[], number]>;
  save(recipe: Recipe): Promise<Recipe>;
  update(id: string, data: Partial<Recipe>): Promise<Recipe>;
  delete(id: string): Promise<void>;
}

export const RECIPE_REPOSITORY = Symbol('RECIPE_REPOSITORY');

