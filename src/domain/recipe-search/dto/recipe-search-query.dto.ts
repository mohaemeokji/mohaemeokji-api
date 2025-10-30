import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class RecipeSearchQueryDto {
  @ApiProperty({ 
    description: '검색 키워드', 
    required: false,
    example: '김치찌개'
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ 
    description: '카테고리 필터', 
    required: false,
    example: '한식'
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ 
    description: '페이지 번호 (1부터 시작)', 
    required: false, 
    default: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ 
    description: '페이지당 항목 수', 
    required: false, 
    default: 20,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

