import { ApiProperty } from '@nestjs/swagger';
import { RecipeStatus } from '../../../core/entities/recipe/recipe.entity';

export class RecipeStepDto {
  @ApiProperty({ description: '단계 번호' })
  stepNumber: number;

  @ApiProperty({ description: '단계 상세 설명' })
  summary: string;

  @ApiProperty({ description: '시작 시간(초)' })
  startTimeSeconds: number;

  @ApiProperty({ description: '종료 시간(초)' })
  endTimeSeconds: number;

  @ApiProperty({ description: '조리 기법', required: false })
  techniques?: string[];

  @ApiProperty({ description: '사용 도구', required: false })
  tools?: string[];
}

export class RecipeIngredientDto {
  @ApiProperty({ description: '재료명' })
  name: string;

  @ApiProperty({ description: '수량', required: false })
  amount?: string;

  @ApiProperty({ description: '단위', required: false })
  unit?: string;

  @ApiProperty({ description: '추가 설명', required: false })
  notes?: string;
}

export class NutritionInfoDto {
  @ApiProperty({ description: '칼로리', required: false })
  calories?: number;

  @ApiProperty({ description: '단백질(g)', required: false })
  protein?: number;

  @ApiProperty({ description: '탄수화물(g)', required: false })
  carbohydrates?: number;

  @ApiProperty({ description: '지방(g)', required: false })
  fat?: number;

  @ApiProperty({ description: '식이섬유(g)', required: false })
  fiber?: number;

  @ApiProperty({ description: '나트륨(mg)', required: false })
  sodium?: number;
}

export class RecipeResponseDto {
  @ApiProperty({ description: '레시피 ID' })
  id: string;

  @ApiProperty({ description: '유튜브 비디오 ID' })
  youtubeId: string;

  @ApiProperty({ description: '레시피 상태', enum: RecipeStatus })
  status: RecipeStatus;

  @ApiProperty({ description: '레시피 제목', required: false })
  title?: string;

  @ApiProperty({ description: '레시피 설명', required: false })
  description?: string;

  @ApiProperty({ description: '레시피 단계', type: [RecipeStepDto], required: false })
  steps?: RecipeStepDto[];

  @ApiProperty({ description: '재료 목록', type: [RecipeIngredientDto], required: false })
  ingredients?: RecipeIngredientDto[];

  @ApiProperty({ description: '영양 정보', type: NutritionInfoDto, required: false })
  nutrition?: NutritionInfoDto;

  @ApiProperty({ description: '카테고리', type: [String], required: false })
  categories?: string[];

  @ApiProperty({ description: '태그', type: [String], required: false })
  tags?: string[];

  @ApiProperty({ description: '난이도', required: false })
  difficulty?: string;

  @ApiProperty({ description: '예상 조리 시간(분)', required: false })
  estimatedTime?: number;

  @ApiProperty({ description: '예상 인분', required: false })
  servings?: number;

  @ApiProperty({ description: '에러 메시지', required: false })
  errorMessage?: string;

  @ApiProperty({ description: '생성 시간' })
  createdAt: Date;

  @ApiProperty({ description: '업데이트 시간' })
  updatedAt: Date;
}

