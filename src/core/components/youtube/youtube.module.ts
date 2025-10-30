import { Module } from '@nestjs/common';
import { YoutubeService } from './youtube.service';
import { RepositoriesModule } from '../../repositories/repositories.module';

/**
 * Core YouTube Module
 * 
 * youtubei.js를 사용하여 유튜브 데이터를 수집하는 서비스를 제공합니다.
 * 다른 도메인 모듈에서 재사용 가능합니다.
 * 
 * 제공 기능:
 * - 비디오 정보 조회 (DB 캐싱 지원)
 * - 댓글 수집
 * - 자막/트랜스크립트 조회
 * - 비디오 검색
 * - 채널 정보 및 비디오 목록 조회
 */
@Module({
  imports: [RepositoriesModule],
  providers: [YoutubeService],
  exports: [YoutubeService],
})
export class YoutubeModule {}

