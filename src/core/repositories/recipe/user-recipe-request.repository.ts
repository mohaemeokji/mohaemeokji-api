import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { UserRecipeRequest } from '../../entities/recipe/user-recipe-request.entity';
import { IUserRecipeRequestRepository } from './user-recipe-request.repository.interface';

@Injectable()
export class UserRecipeRequestRepository implements IUserRecipeRequestRepository {
  constructor(
    @InjectRepository(UserRecipeRequest)
    private readonly repository: Repository<UserRecipeRequest>,
  ) {}

  async createOrUpdate(userId: number, recipeId: string): Promise<UserRecipeRequest> {
    const existing = await this.findByUserIdAndRecipeId(userId, recipeId);

    if (existing) {
      return await this.repository.save(existing);
    }

    const request = this.repository.create({
      userId,
      recipeId,
    });

    return await this.repository.save(request);
  }

  async findByUserId(userId: number, limit: number = 100): Promise<UserRecipeRequest[]> {
    return await this.repository.find({
      where: { userId },
      relations: ['recipe'],
      order: { updatedAt: 'DESC' },
      take: limit,
    });
  }

  async findByUserIdAndRecipeId(userId: number, recipeId: string): Promise<UserRecipeRequest | null> {
    return await this.repository.findOne({
      where: { userId, recipeId },
    });
  }

  async findRecentByUserId(userId: number, days: number, limit: number = 50): Promise<UserRecipeRequest[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    return await this.repository.find({
      where: {
        userId,
        updatedAt: MoreThanOrEqual(dateThreshold),
      },
      relations: ['recipe'],
      order: { updatedAt: 'DESC' },
      take: limit,
    });
  }
}

