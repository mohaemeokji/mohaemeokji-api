import { ApiProperty } from '@nestjs/swagger';
import { RecipeListItemDto } from './recipe-list-item.dto';

export class PaginationMetaDto {
  @ApiProperty({ description: '현재 페이지' })
  currentPage: number;

  @ApiProperty({ description: '페이지당 항목 수' })
  itemsPerPage: number;

  @ApiProperty({ description: '총 항목 수' })
  totalItems: number;

  @ApiProperty({ description: '총 페이지 수' })
  totalPages: number;

  @ApiProperty({ description: '다음 페이지 존재 여부' })
  hasNextPage: boolean;

  @ApiProperty({ description: '이전 페이지 존재 여부' })
  hasPreviousPage: boolean;
}

export class RecipeSearchResponseDto {
  @ApiProperty({ description: '레시피 목록', type: [RecipeListItemDto] })
  items: RecipeListItemDto[];

  @ApiProperty({ description: '페이지네이션 정보', type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

