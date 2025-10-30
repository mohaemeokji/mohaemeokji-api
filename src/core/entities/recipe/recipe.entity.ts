import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum RecipeStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, comment: '유튜브 비디오 ID' })
  @Index()
  youtubeId: string;

  @Column({ type: 'enum', enum: RecipeStatus, default: RecipeStatus.PENDING })
  status: RecipeStatus;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true, comment: '레시피 단계 목록' })
  steps: RecipeStep[];

  @Column({ type: 'json', nullable: true, comment: '재료 목록' })
  ingredients: RecipeIngredient[];

  @Column({ type: 'json', nullable: true, comment: '영양 정보' })
  nutrition: NutritionInfo;

  @Column({ type: 'simple-array', nullable: true, comment: '카테고리' })
  categories: string[];

  @Column({ type: 'simple-array', nullable: true, comment: '태그' })
  tags: string[];

  @Column({ nullable: true, comment: '난이도' })
  difficulty: string;

  @Column({ type: 'int', nullable: true, comment: '예상 조리 시간(분)' })
  estimatedTime: number;

  @Column({ type: 'int', nullable: true, comment: '예상 인분' })
  servings: number;

  @Column({ type: 'text', nullable: true, comment: '에러 메시지' })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  isProcessing(): boolean {
    return this.status === RecipeStatus.PROCESSING;
  }

  isCompleted(): boolean {
    return this.status === RecipeStatus.COMPLETED;
  }

  isFailed(): boolean {
    return this.status === RecipeStatus.FAILED;
  }
}

export interface RecipeStep {
  stepNumber: number;
  summary: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
  techniques?: string[];
  tools?: string[];
}

export interface RecipeIngredient {
  name: string;
  amount?: string;
  unit?: string;
  notes?: string;
}

export interface NutritionInfo {
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sodium?: number;
}

