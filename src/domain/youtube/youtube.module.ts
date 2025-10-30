import { Module } from '@nestjs/common';
import { YoutubeController } from './youtube.controller';
import { YoutubeService } from './youtube.service';
import { YoutubeModule as CoreYoutubeModule } from '../../core/components/youtube/youtube.module';

/**
 * YoutubeModule (Domain Layer)
 * 
 * 유튜브 도메인의 애플리케이션 로직을 담당합니다.
 * Core Module을 통해 유튜브 데이터 수집 서비스에 접근합니다.
 * 
 * 계층 구조:
 * - Controller: HTTP 요청/응답 처리 (DTO 사용)
 * - Service: 비즈니스 로직 (Entity ↔ DTO 변환)
 * - Core Youtube Service: 유튜브 데이터 수집 및 DB 캐싱
 * 
 * 제공 엔드포인트:
 * - GET /youtube/info/:videoIdOrUrl - 비디오 기본 정보
 * - GET /youtube/transcript/:videoIdOrUrl - 자막
 * - GET /youtube/comments/:videoIdOrUrl - 댓글
 * - GET /youtube/data/:videoIdOrUrl - 전체 데이터 (DB 캐싱)
 */
@Module({
  imports: [CoreYoutubeModule],
  controllers: [YoutubeController],
  providers: [YoutubeService],
  exports: [YoutubeService],
})
export class YoutubeModule {}

