import { Module } from '@nestjs/common';
import { SmsController } from './sms.controller';
import { SmsModule as CoreSmsModule } from '../../core/components/sms/sms.module';

/**
 * SMS Domain Module
 * 
 * SMS API 엔드포인트를 제공합니다.
 * Core의 SmsModule을 import하여 SmsService를 사용합니다.
 */
@Module({
  imports: [CoreSmsModule],
  controllers: [SmsController],
})
export class SmsModule {}

