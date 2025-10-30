import { YoutubeRaw } from '../../entities/video/youtube-raw.entity';

/**
 * YoutubeRaw Repository Interface
 * 
 * 유튜브 원본 데이터 접근 인터페이스입니다.
 * DTO가 아닌 Entity를 다룹니다.
 */
export interface IYoutubeRawRepository {
  /**
   * 비디오 ID로 데이터 조회
   */
  findByVideoId(videoId: string): Promise<YoutubeRaw | null>;

  /**
   * 전체 데이터 조회
   */
  findAll(): Promise<YoutubeRaw[]>;

  /**
   * ID로 데이터 조회
   */
  findById(id: number): Promise<YoutubeRaw | null>;

  /**
   * 새로운 데이터 생성
   */
  create(data: Partial<YoutubeRaw>): Promise<YoutubeRaw>;

  /**
   * 기존 데이터 업데이트
   */
  update(id: number, data: Partial<YoutubeRaw>): Promise<YoutubeRaw>;

  /**
   * 데이터 저장 (생성 또는 업데이트)
   */
  save(data: YoutubeRaw): Promise<YoutubeRaw>;

  /**
   * 데이터 삭제
   */
  delete(id: number): Promise<void>;

  /**
   * 상태별 데이터 조회
   */
  findByStatus(status: string): Promise<YoutubeRaw[]>;

  /**
   * 채널별 데이터 조회
   */
  findByChannelId(channelId: string): Promise<YoutubeRaw[]>;

  /**
   * 데이터 존재 여부 확인
   */
  existsByVideoId(videoId: string): Promise<boolean>;
}

export const YOUTUBE_RAW_REPOSITORY_TOKEN = 'YOUTUBE_RAW_REPOSITORY';

