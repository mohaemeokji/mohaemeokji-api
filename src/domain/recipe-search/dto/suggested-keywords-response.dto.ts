import { ApiProperty } from '@nestjs/swagger';

export class KeywordItemDto {
  @ApiProperty({ description: '키워드' })
  keyword: string;

  @ApiProperty({ description: '해당 키워드의 레시피 수' })
  count: number;
}

export class SuggestedKeywordsResponseDto {
  @ApiProperty({ description: '추천 검색어 목록', type: [KeywordItemDto] })
  keywords: KeywordItemDto[];
}

