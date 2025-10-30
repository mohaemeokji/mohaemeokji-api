import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user/user.entity';
import { YoutubeRaw } from '../entities/video/youtube-raw.entity';
import { UserRepository } from './user/user.repository';
import { USER_REPOSITORY_TOKEN } from './user/user.repository.interface';
import { YoutubeRawRepository } from './youtube-raw/youtube-raw.repository';
import { YOUTUBE_RAW_REPOSITORY_TOKEN } from './youtube-raw/youtube-raw.repository.interface';
import { UtilsModule } from '../utils/utils.module';

/**
 * Repositories Module
 * 
 * 모든 리포지토리를 통합 관리하는 모듈입니다.
 * 새로운 엔티티의 리포지토리가 추가되면 이 모듈에 등록합니다.
 * 
 * 현재 제공하는 리포지토리:
 * - UserRepository: 사용자 데이터 접근
 * - YoutubeRawRepository: 유튜브 원본 데이터 접근
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User, YoutubeRaw]),
    UtilsModule,
  ],
  providers: [
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepository,
    },
    UserRepository,
    {
      provide: YOUTUBE_RAW_REPOSITORY_TOKEN,
      useClass: YoutubeRawRepository,
    },
    YoutubeRawRepository,
  ],
  exports: [
    TypeOrmModule,
    USER_REPOSITORY_TOKEN,
    UserRepository,
    YOUTUBE_RAW_REPOSITORY_TOKEN,
    YoutubeRawRepository,
  ],
})
export class RepositoriesModule {}

