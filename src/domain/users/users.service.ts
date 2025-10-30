import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../core/entities/user/user.entity';
import { IUserRepository, USER_REPOSITORY_TOKEN } from '../../core/repositories/user/user.repository.interface';
import { UserDto } from './dto/user.dto';
import { UserProfileDto } from './dto/user-profile.dto';

/**
 * Users Service (Domain Layer)
 * 
 * 애플리케이션 비즈니스 로직을 담당합니다.
 * Core 레이어의 Repository를 사용하여 데이터에 접근합니다.
 * DTO를 Entity로 변환하고, Entity를 DTO로 변환하는 책임을 가집니다.
 */
@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,

    @InjectRepository(User)
    private readonly userRealRepository: Repository<User>,
  ) {}

  public async getWithdrawnUsers(): Promise<any[]> {
    return await this.userRealRepository
      .createQueryBuilder('user')
      .leftJoin('payment', 'payment', '"user".id = payment.user_id')
      .select([
        '"user".*',
        'CASE WHEN COUNT(payment.id) > 0 THEN true ELSE false END as "hasPaymentHistory"',
      ])
      .where('"user".is_withdrawal = :isWithdrawal', { isWithdrawal: true })
      .groupBy('"user".id')
      .getRawMany();
  }

  public async findAll(): Promise<any[]> {
    return await this.userRealRepository
      .createQueryBuilder('user')
      .leftJoin(
        'family_member',
        'familyMember',
        'user.id = familyMember.userId',
      )
      .leftJoin(
        (subQuery) => {
          return subQuery
            .select('p.*')
            .addSelect(
              'ROW_NUMBER() OVER (PARTITION BY p."user_id" ORDER BY p."created_at" DESC)',
              'rn',
            )
            .from('payment', 'p');
        },
        'latest_payment',
        'latest_payment."user_id" = user.id AND latest_payment.rn = 1',
      )
      .addSelect([
        'familyMember.name',
        'familyMember.relationship',
        'latest_payment."expiry_date"',
      ])
      .where('familyMember.isPrimary = :isPrimary', { isPrimary: true })
      .getRawMany();
  }

  public async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  public async findBySub(sub: number): Promise<User> {
    const user = await this.userRepository.findById(sub);

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  public async findById(userId: string): Promise<User> {
    const user = await this.userRepository.findById(+userId);

    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }

    return user;
  }

  public async findUserIdByPhone(phone: string): Promise<number> {
    const user = await this.userRepository.findByPhone(phone);

    if (!user) {
      throw new NotFoundException(`User #${phone} not found`);
    }

    return user.id;
  }

  public async create(userDto: UserDto): Promise<User> {
    try {
      // DTO를 Entity로 변환
      const userData: Partial<User> = {
        ...userDto,
      };
      
      return await this.userRepository.create(userData);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async updateByEmail(email: string, newPassword: string): Promise<User> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return await this.userRepository.update(user.id, { password: newPassword });
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async updateByPassword(
    phone: string,
    password: string,
  ): Promise<User> {
    try {
      return await this.userRepository.updatePassword(phone, password);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async updateUserProfile(
    id: string,
    userProfileDto: UserProfileDto,
  ): Promise<User> {
    try {
      return await this.userRepository.update(+id, {
        name: userProfileDto.name,
        email: userProfileDto.email,
      });
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async updateUser(
    id: string,
    phone: string,
    email: string,
  ): Promise<User> {
    try {
      return await this.userRepository.update(+id, { phone, email });
    } catch (err) {
      throw new BadRequestException('User not updated');
    }
  }

  async completePreQuestion(userId: number) {
    return await this.userRepository.updatePreQuestionProcessed(userId);
  }

  async completePostQuestion(userId: number) {
    return await this.userRepository.updatePostQuestionProcessed(userId);
  }

  async withdrawUser(
    userId: number,
    withdrawalReason: string,
    withdrawalReasonType: string,
  ) {
    return await this.userRepository.softDelete(
      userId,
      withdrawalReason,
      withdrawalReasonType,
    );
  }
}
