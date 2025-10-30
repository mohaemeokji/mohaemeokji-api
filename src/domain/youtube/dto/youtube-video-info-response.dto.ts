import { ApiProperty } from '@nestjs/swagger';

export class YoutubeVideoInfoResponseDto {
  @ApiProperty({ description: '비디오 ID' })
  id: string;

  @ApiProperty({ description: '비디오 제목' })
  title: string;

  @ApiProperty({ description: '비디오 설명' })
  description: string;

  @ApiProperty({ description: '비디오 길이(초)' })
  duration: number;

  @ApiProperty({ description: '조회수' })
  viewCount: number;

  @ApiProperty({ description: '좋아요 수' })
  likeCount: number;

  @ApiProperty({ description: '업로드 날짜' })
  uploadDate: string;

  @ApiProperty({ description: '카테고리' })
  category: string;

  @ApiProperty({ description: '태그 목록' })
  tags: string[];

  @ApiProperty({ description: '라이브 콘텐츠 여부' })
  isLiveContent: boolean;

  @ApiProperty({ description: 'YouTube Shorts 여부' })
  isShorts: boolean;

  @ApiProperty({ description: '채널 정보' })
  channel: {
    id: string;
    name: string;
    url: string;
  };
}

