import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe, RecipeStatus } from '../../entities/recipe/recipe.entity';
import { IRecipeRepository } from './recipe.repository.interface';

@Injectable()
export class RecipeRepository implements IRecipeRepository {
  constructor(
    @InjectRepository(Recipe)
    private readonly repository: Repository<Recipe>,
  ) {}

  async findByYoutubeId(youtubeId: string): Promise<Recipe | null> {
    return await this.repository.findOne({ where: { youtubeId } });
  }

  async findById(id: string): Promise<Recipe | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<Recipe[]> {
    return await this.repository.find({
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: RecipeStatus): Promise<Recipe[]> {
    return await this.repository.find({ where: { status } });
  }

  async save(recipe: Recipe): Promise<Recipe> {
    return await this.repository.save(recipe);
  }

  async update(id: string, data: Partial<Recipe>): Promise<Recipe> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

