import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { YoutubeService as CoreYoutubeService } from '../../core/components/youtube/youtube.service';
import { YoutubeVideoInfoResponseDto } from './dto/youtube-video-info-response.dto';
import { YoutubeTranscriptResponseDto } from './dto/youtube-transcript-response.dto';
import { YoutubeCommentsResponseDto } from './dto/youtube-comments-response.dto';
import { YoutubeFullDataResponseDto } from './dto/youtube-full-data-response.dto';

/**
 * Youtube Service (Domain Layer)
 * 
 * 유튜브 도메인의 비즈니스 로직을 담당합니다.
 * Core 레이어의 YoutubeService를 사용하여 데이터를 수집합니다.
 * Entity를 DTO로 변환하는 책임을 가집니다.
 */
@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name);

  constructor(
    private readonly coreYoutubeService: CoreYoutubeService,
  ) {}

  /**
   * 비디오 기본 정보 조회
   */
  async getVideoInfo(videoIdOrUrl: string): Promise<YoutubeVideoInfoResponseDto> {
    try {
      this.logger.log(`비디오 정보 조회: ${videoIdOrUrl}`);
      const info = await this.coreYoutubeService.getVideoInfo(videoIdOrUrl);
      
      return {
        id: info.id,
        title: info.title,
        description: info.description,
        duration: info.duration,
        viewCount: info.viewCount,
        likeCount: info.likeCount,
        uploadDate: info.uploadDate,
        category: info.category,
        tags: info.tags,
        isLiveContent: info.isLiveContent,
        isShorts: info.isShorts,
        channel: info.channel,
      };
    } catch (error: any) {
      this.logger.error(`비디오 정보 조회 실패: ${videoIdOrUrl}`, error);
      throw new NotFoundException('비디오 정보를 찾을 수 없습니다.');
    }
  }

  /**
   * 자막 조회
   */
  async getTranscript(
    videoIdOrUrl: string,
    language: string = 'ko',
  ): Promise<YoutubeTranscriptResponseDto> {
    try {
      this.logger.log(`자막 조회: ${videoIdOrUrl}, 언어: ${language}`);
      const transcript = await this.coreYoutubeService.getTranscript(videoIdOrUrl, language);
      
      return {
        videoId: transcript.videoId,
        language: transcript.language,
        segments: transcript.segments,
        fullText: transcript.fullText,
      };
    } catch (error: any) {
      this.logger.error(`자막 조회 실패: ${videoIdOrUrl}`, error);
      throw new NotFoundException('자막 정보를 찾을 수 없습니다.');
    }
  }

  /**
   * 댓글 조회
   */
  async getComments(
    videoIdOrUrl: string,
    maxComments: number = 100,
  ): Promise<YoutubeCommentsResponseDto> {
    try {
      this.logger.log(`댓글 조회: ${videoIdOrUrl}, 최대: ${maxComments}개`);
      const comments = await this.coreYoutubeService.getComments(videoIdOrUrl, maxComments);
      
      return {
        videoId: comments.videoId,
        totalComments: comments.totalComments,
        comments: comments.comments,
        message: comments.message,
      };
    } catch (error: any) {
      this.logger.error(`댓글 조회 실패: ${videoIdOrUrl}`, error);
      throw new NotFoundException('댓글 정보를 찾을 수 없습니다.');
    }
  }

  /**
   * 전체 데이터 조회 (DB 캐싱 포함)
   */
  async getComprehensiveData(
    videoIdOrUrl: string,
    maxComments: number = 100,
    language: string = 'ko',
  ): Promise<YoutubeFullDataResponseDto> {
    try {
      this.logger.log(`전체 데이터 조회: ${videoIdOrUrl}`);
      const data = await this.coreYoutubeService.getComprehensiveVideoData(
        videoIdOrUrl,
        maxComments,
        language,
      );

      return {
        videoId: data.videoId,
        videoUrl: data.videoUrl,
        title: data.title,
        description: data.description,
        duration: data.duration,
        viewCount: data.viewCount,
        likeCount: data.likeCount,
        uploadDate: data.uploadDate,
        category: data.category,
        tags: data.tags,
        isLiveContent: data.isLiveContent,
        isShorts: data.isShorts,
        channelId: data.channelId,
        channelName: data.channelName,
        channelUrl: data.channelUrl,
        channelDescription: data.channelDescription,
        channelSubscriberCount: data.channelSubscriberCount,
        channelVideoCount: data.channelVideoCount,
        totalComments: data.totalComments,
        comments: data.comments,
        transcriptLanguage: data.transcriptLanguage,
        transcriptSegments: data.transcriptSegments,
        transcriptFullText: data.transcriptFullText,
        collectedAt: data.collectedAt,
        updatedAt: data.updatedAt,
        status: data.status,
      };
    } catch (error: any) {
      this.logger.error(`전체 데이터 조회 실패: ${videoIdOrUrl}`, error);
      throw new NotFoundException('비디오 데이터를 찾을 수 없습니다.');
    }
  }
}

