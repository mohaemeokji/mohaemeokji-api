import { ApiProperty } from '@nestjs/swagger';

export class YoutubeFullDataResponseDto {
  @ApiProperty({ description: '비디오 ID' })
  videoId: string;

  @ApiProperty({ description: '비디오 URL' })
  videoUrl: string;

  // 비디오 기본 정보
  @ApiProperty({ description: '제목' })
  title: string;

  @ApiProperty({ description: '설명' })
  description: string;

  @ApiProperty({ description: '길이(초)' })
  duration: number;

  @ApiProperty({ description: '조회수' })
  viewCount: number;

  @ApiProperty({ description: '좋아요 수' })
  likeCount: number;

  @ApiProperty({ description: '업로드 날짜' })
  uploadDate: string;

  @ApiProperty({ description: '카테고리' })
  category: string;

  @ApiProperty({ description: '태그' })
  tags: string[];

  @ApiProperty({ description: '라이브 콘텐츠 여부' })
  isLiveContent: boolean;

  @ApiProperty({ description: 'YouTube Shorts 여부' })
  isShorts: boolean;

  // 채널 정보
  @ApiProperty({ description: '채널 ID' })
  channelId: string;

  @ApiProperty({ description: '채널 이름' })
  channelName: string;

  @ApiProperty({ description: '채널 URL' })
  channelUrl: string;

  @ApiProperty({ description: '채널 설명', required: false })
  channelDescription?: string;

  @ApiProperty({ description: '채널 구독자 수', required: false })
  channelSubscriberCount?: string;

  @ApiProperty({ description: '채널 비디오 수', required: false })
  channelVideoCount?: string;

  // 댓글 정보
  @ApiProperty({ description: '댓글 수' })
  totalComments: number;

  @ApiProperty({ description: '댓글 목록' })
  comments: any[];

  // 자막 정보
  @ApiProperty({ description: '자막 언어', required: false })
  transcriptLanguage?: string;

  @ApiProperty({ description: '자막 세그먼트 (text, startMs, endMs, duration)', required: false })
  transcriptSegments?: any[];

  @ApiProperty({ description: '전체 자막 텍스트', required: false })
  transcriptFullText?: string;

  // 메타 정보
  @ApiProperty({ description: '수집 시간' })
  collectedAt: Date;

  @ApiProperty({ description: '업데이트 시간' })
  updatedAt: Date;

  @ApiProperty({ description: '상태' })
  status: string;
}

