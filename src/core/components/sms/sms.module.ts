import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { ConfigModule } from '@nestjs/config';

/**
 * Core SMS Module
 * 
 * SOLAPI를 사용한 SMS 전송 서비스를 제공합니다.
 * 다른 도메인 모듈에서 재사용 가능합니다.
 */
@Module({
  imports: [ConfigModule],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
