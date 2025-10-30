import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user/user.entity';
import { IUserRepository } from './user.repository.interface';
import { HashingService } from '../../utils/hashing/hashing.service';

/**
 * User Repository Implementation
 * 
 * Infrastructure(TypeORM)를 사용하여 Entity를 다룹니다.
 * DTO에 의존하지 않고, 순수 Entity만 반환합니다.
 */
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.repository.find();
  }

  async findById(id: number): Promise<User | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({ where: { email } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return await this.repository.findOne({ where: { phone } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return await this.repository.save(user);
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async updatePassword(phone: string, password: string): Promise<User> {
    const user = await this.findByPhone(phone);
    if (!user) {
      throw new Error('User not found');
    }
    user.password = await this.hashingService.hash(password);
    return await this.repository.save(user);
  }

  async updatePreQuestionProcessed(userId: number): Promise<void> {
    await this.repository.update(userId, {
      preQuestionProcessed: true,
    });
  }

  async updatePostQuestionProcessed(userId: number): Promise<void> {
    await this.repository.update(userId, {
      postQuestionProcessed: true,
    });
  }

  async softDelete(
    userId: number,
    reason: string,
    reasonType: string,
  ): Promise<void> {
    const user = await this.findById(userId);
    if (user) {
      user.withdraw(reason, reasonType);
      await this.repository.save(user);
    }
  }
}

