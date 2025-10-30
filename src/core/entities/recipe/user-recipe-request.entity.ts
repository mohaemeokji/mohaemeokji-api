import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';
import { User } from '../user/user.entity';
import { Recipe } from './recipe.entity';

/**
 * User Recipe Request Entity
 * 
 * 유저가 레시피 생성을 요청한 이력을 관리하는 엔티티입니다.
 * 유저와 레시피의 조합은 unique하며, 재요청 시 updatedAt이 업데이트됩니다.
 */
@Entity('user_recipe_requests')
@Unique(['userId', 'recipeId'])
@Index(['userId'])
@Index(['recipeId'])
export class UserRecipeRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', name: 'userId' })
  userId: number;

  @Column({ type: 'uuid', name: 'recipeId' })
  recipeId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => Recipe, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'recipeId', referencedColumnName: 'id' })
  recipe: Recipe;

  @CreateDateColumn({ comment: '최초 요청 시간' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '마지막 요청 시간' })
  updatedAt: Date;

  // 비즈니스 로직 메서드
  
  /**
   * 최근에 요청된 항목인지 확인 (24시간 이내)
   */
  isRecentRequest(): boolean {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return this.updatedAt > oneDayAgo;
  }

  /**
   * 요청 기간 계산 (일 단위)
   */
  getDaysSinceFirstRequest(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}

