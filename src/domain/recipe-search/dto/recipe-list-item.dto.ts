import { ApiProperty } from '@nestjs/swagger';

export class RecipeListItemDto {
  @ApiProperty({ description: '레시피 ID' })
  id: string;

  @ApiProperty({ description: '유튜브 비디오 ID' })
  youtubeId: string;

  @ApiProperty({ description: '레시피 제목' })
  title: string;

  @ApiProperty({ description: '레시피 간단 설명', required: false })
  description?: string;

  @ApiProperty({ description: '썸네일 URL', required: false })
  thumbnailUrl?: string;

  @ApiProperty({ description: '채널 이름', required: false })
  channelName?: string;

  @ApiProperty({ description: '조회수', required: false })
  viewCount?: number;

  @ApiProperty({ description: '카테고리 목록', type: [String], required: false })
  categories?: string[];

  @ApiProperty({ description: '태그 목록', type: [String], required: false })
  tags?: string[];

  @ApiProperty({ description: '난이도', required: false })
  difficulty?: string;

  @ApiProperty({ description: '예상 조리 시간(분)', required: false })
  estimatedTime?: number;

  @ApiProperty({ description: '예상 인분', required: false })
  servings?: number;

  @ApiProperty({ description: '생성 시간' })
  createdAt: Date;

  @ApiProperty({ description: '업데이트 시간' })
  updatedAt: Date;
}

