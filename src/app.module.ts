import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';

import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { throttlerConfig } from './config/throttler.config';

import { IamModule } from './domain/iam/iam.module';
import { UsersModule } from './domain/users/users.module';
import { SmsModule } from './domain/sms/sms.module';
import { YoutubeModule } from './domain/youtube/youtube.module';
import { RecipeGeneratorModule } from './domain/recipe-generator/recipe-generator.module';
import { RecipeSearchModule } from './domain/recipe-search/recipe-search.module';
import { RecipeExplorerModule } from './domain/recipe-explorer/recipe-explorer.module';
import { HealthModule } from './domain/health/health.module';

/**
 * App Module
 * 
 * 애플리케이션의 루트 모듈입니다.
 * - 인프라 설정 (Database, Config, Throttler)
 * - 도메인 모듈 통합 (IAM, Users, SMS, Youtube, Recipe)
 */
@Module({
  imports: [
    // Infrastructure
    ConfigModule.forRoot(appConfig),
    TypeOrmModule.forRootAsync(databaseConfig),
    ThrottlerModule.forRootAsync(throttlerConfig),

    // Domain Modules
    HealthModule,
    IamModule,
    UsersModule,
    SmsModule,
    YoutubeModule,
    RecipeGeneratorModule,
    RecipeSearchModule,
    RecipeExplorerModule,
  ],
})
export class AppModule {}
