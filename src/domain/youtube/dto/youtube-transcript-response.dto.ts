import { ApiProperty } from '@nestjs/swagger';

export class TranscriptSegmentDto {
  @ApiProperty({ description: '자막 텍스트' })
  text: string;

  @ApiProperty({ description: '시작 시간(ms)' })
  startMs: string;

  @ApiProperty({ description: '종료 시간(ms)' })
  endMs: string;

  @ApiProperty({ description: '지속 시간' })
  duration: string;
}

export class YoutubeTranscriptResponseDto {
  @ApiProperty({ description: '비디오 ID' })
  videoId: string;

  @ApiProperty({ description: '자막 언어' })
  language: string;

  @ApiProperty({ description: '자막 세그먼트 (text, startMs, endMs, duration)', type: [TranscriptSegmentDto] })
  segments: TranscriptSegmentDto[];

  @ApiProperty({ description: '전체 자막 텍스트', required: false })
  fullText?: string;
}

