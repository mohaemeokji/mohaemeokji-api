import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

/**
 * YouTube Raw Data Entity
 * 
 * 유튜브에서 수집한 원본 데이터를 저장하는 엔티티입니다.
 * 비디오 정보, 채널 정보, 댓글, 자막 등의 종합 정보를 포함합니다.
 */
@Entity('youtube_raw')
export class YoutubeRaw extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, comment: '유튜브 비디오 ID' })
  videoId: string;

  @Column({ nullable: true, comment: '비디오 URL' })
  videoUrl: string;

  // ===== 비디오 기본 정보 =====
  @Column({ type: 'varchar', length: 500, nullable: true, comment: '비디오 제목' })
  title: string;

  @Column({ type: 'text', nullable: true, comment: '비디오 설명' })
  description: string;

  @Column({ type: 'int', nullable: true, comment: '비디오 길이(초)' })
  duration: number;

  @Column({ type: 'bigint', nullable: true, comment: '조회수' })
  viewCount: number;

  @Column({ type: 'int', nullable: true, comment: '좋아요 수' })
  likeCount: number;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '업로드 날짜' })
  uploadDate: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '카테고리' })
  category: string;

  @Column({ type: 'json', nullable: true, comment: '태그 목록' })
  tags: string[];

  @Column({ type: 'json', nullable: true, comment: '썸네일 정보' })
  thumbnails: any;

  @Column({ type: 'boolean', default: false, comment: '라이브 콘텐츠 여부' })
  isLiveContent: boolean;

  @Column({ type: 'boolean', default: false, comment: 'YouTube Shorts 여부' })
  isShorts: boolean;

  // ===== 채널 정보 =====
  @Column({ nullable: true, comment: '채널 ID' })
  channelId: string;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '채널 이름' })
  channelName: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '채널 URL' })
  channelUrl: string;

  @Column({ type: 'text', nullable: true, comment: '채널 설명' })
  channelDescription: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '채널 구독자 수' })
  channelSubscriberCount: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '채널 비디오 수' })
  channelVideoCount: string;

  @Column({ type: 'json', nullable: true, comment: '채널 썸네일' })
  channelThumbnails: any;

  @Column({ type: 'json', nullable: true, comment: '채널 아바타' })
  channelAvatar: any;

  @Column({ type: 'json', nullable: true, comment: '채널 키워드' })
  channelKeywords: string[];

  // ===== 댓글 정보 =====
  @Column({ type: 'int', default: 0, comment: '수집된 댓글 수' })
  totalComments: number;

  @Column({ type: 'json', nullable: true, comment: '댓글 목록' })
  comments: any[];

  // ===== 자막 정보 =====
  @Column({ type: 'varchar', length: 10, nullable: true, comment: '자막 언어' })
  transcriptLanguage: string;

  @Column({ type: 'json', nullable: true, comment: '자막 세그먼트 (text, startMs, endMs, duration 포함)' })
  transcriptSegments: any[];

  @Column({ type: 'text', nullable: true, comment: '전체 자막 텍스트' })
  transcriptFullText: string;

  // ===== 메타 정보 =====
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', comment: '데이터 수집 시간' })
  collectedAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', comment: '마지막 업데이트 시간' })
  updatedAt: Date;

  @Column({ type: 'varchar', length: 50, default: 'active', comment: '데이터 상태 (active, deleted, error)' })
  status: string;

  @Column({ type: 'text', nullable: true, comment: '오류 메시지' })
  errorMessage: string;

  // ===== 비즈니스 로직 메서드 =====
  
  /**
   * 데이터가 유효한지 확인
   */
  isValid(): boolean {
    return this.status === 'active' && this.videoId !== null;
  }

  /**
   * 댓글이 수집되었는지 확인
   */
  hasComments(): boolean {
    return this.totalComments > 0 && this.comments && this.comments.length > 0;
  }

  /**
   * 자막이 있는지 확인
   */
  hasTranscript(): boolean {
    return this.transcriptSegments !== null && this.transcriptSegments.length > 0;
  }

  /**
   * 에러 상태로 변경
   */
  markAsError(errorMessage: string): void {
    this.status = 'error';
    this.errorMessage = errorMessage;
    this.updatedAt = new Date();
  }

  /**
   * 데이터 요약 정보 반환
   */
  getSummary(): {
    videoId: string;
    title: string;
    channelName: string;
    viewCount: number;
    commentCount: number;
    hasTranscript: boolean;
  } {
    return {
      videoId: this.videoId,
      title: this.title,
      channelName: this.channelName,
      viewCount: this.viewCount,
      commentCount: this.totalComments,
      hasTranscript: this.hasTranscript(),
    };
  }
}

