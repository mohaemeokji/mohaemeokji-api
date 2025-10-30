import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MailerModule } from '../../core/components/mailer/mailer.module';
import { RepositoriesModule } from '../../core/repositories/repositories.module';
import { SmsModule as CoreSmsModule } from '../../core/components/sms/sms.module';

/**
 * UsersModule (Domain Layer)
 * 
 * 사용자 도메인의 애플리케이션 로직을 담당합니다.
 * Core Module을 통해 엔티티와 리포지토리에 접근합니다.
 * 
 * 계층 구조:
 * - Controller: HTTP 요청/응답 처리 (DTO 사용)
 * - Service: 비즈니스 로직 (DTO ↔ Entity 변환)
 * - Repository (from Core): 데이터 접근 (Entity만 사용)
 */
@Module({
  imports: [RepositoriesModule, MailerModule, CoreSmsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
