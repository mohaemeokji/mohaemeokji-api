import { ApiProperty } from '@nestjs/swagger';

export class CommentAuthorDto {
  @ApiProperty({ description: '작성자 이름' })
  name: string;

  @ApiProperty({ description: '채널 ID' })
  channelId: string;

  @ApiProperty({ description: '프로필 이미지 URL' })
  thumbnail: string;
}

export class CommentDto {
  @ApiProperty({ description: '댓글 ID' })
  id: string;

  @ApiProperty({ description: '작성자 정보' })
  author: CommentAuthorDto;

  @ApiProperty({ description: '댓글 내용' })
  content: string;

  @ApiProperty({ description: '작성 시간' })
  publishedTime: string;

  @ApiProperty({ description: '좋아요 수' })
  likeCount: number;

  @ApiProperty({ description: '답글 수' })
  replyCount: number;

  @ApiProperty({ description: '고정 여부' })
  isPinned: boolean;

  @ApiProperty({ description: '크리에이터 하트 여부' })
  isHeartedByCreator: boolean;
}

export class YoutubeCommentsResponseDto {
  @ApiProperty({ description: '비디오 ID' })
  videoId: string;

  @ApiProperty({ description: '총 댓글 수' })
  totalComments: number;

  @ApiProperty({ description: '댓글 목록', type: [CommentDto] })
  comments: CommentDto[];

  @ApiProperty({ description: '메시지', required: false })
  message?: string;
}

