import { User } from '../../entities/user/user.entity';

/**
 * User Repository Interface
 * 
 * 순수한 데이터 접근 인터페이스입니다.
 * DTO가 아닌 Entity를 다룹니다.
 */
export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  create(user: Partial<User>): Promise<User>;
  update(id: number, data: Partial<User>): Promise<User>;
  delete(id: number): Promise<void>;
  updatePassword(phone: string, hashedPassword: string): Promise<User>;
  updatePreQuestionProcessed(userId: number): Promise<void>;
  updatePostQuestionProcessed(userId: number): Promise<void>;
  softDelete(userId: number, reason: string, reasonType: string): Promise<void>;
}

export const USER_REPOSITORY_TOKEN = 'USER_REPOSITORY';

