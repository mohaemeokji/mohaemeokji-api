import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

/**
 * User Entity
 * 
 * 순수 비즈니스 엔티티입니다. DTO에 의존하지 않습니다.
 * 도메인 규칙과 비즈니스 로직만 포함합니다.
 */
@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({
    unique: true,
    nullable: true,
  })
  email: string;

  @Column({
    unique: true,
    nullable: true,
  })
  phone: string;

  @Column({ length: 200 })
  password: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: ['direct', 'kakao', 'naver', 'google', 'apple'],
    default: 'direct',
  })
  register_path: string;

  @Column({ nullable: true })
  birthday: string;

  @Column({ default: false })
  marketing_agreed: boolean;

  @Column({ default: 1 })
  profileImageNo: number;

  @Column({
    name: 'pre_question_processed',
    type: 'bool',
    default: false,
    nullable: false,
    comment: '사전질문 처리 여부',
  })
  preQuestionProcessed: boolean;

  @Column({
    name: 'post_question_processed',
    type: 'bool',
    default: false,
    nullable: false,
    comment: '사후질문 처리 여부',
  })
  postQuestionProcessed: boolean;

  @Column({ nullable: false, default: false })
  isWithdrawal: boolean;

  @Column({ nullable: true })
  withdrawalDate: Date;

  @Column({ nullable: true })
  withdrawalReason: string;

  @Column({ nullable: true })
  withdrawalReasonType: string;

  // 비즈니스 로직 메서드
  isActive(): boolean {
    return !this.isWithdrawal;
  }

  hasCompletedPreQuestion(): boolean {
    return this.preQuestionProcessed;
  }

  hasCompletedPostQuestion(): boolean {
    return this.postQuestionProcessed;
  }

  withdraw(reason: string, reasonType: string): void {
    this.isWithdrawal = true;
    this.withdrawalDate = new Date();
    this.withdrawalReason = reason;
    this.withdrawalReasonType = reasonType;
    // 개인정보 마스킹
    this.name = null;
    this.email = null;
    this.phone = null;
    this.birthday = null;
  }
}

