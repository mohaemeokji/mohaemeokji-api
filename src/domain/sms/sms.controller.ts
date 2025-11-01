import { SendSmsRequestDto } from './dto/send-sms.request.dto';
import { SmsService } from '../../core/components/sms/sms.service';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('SMS [전화번호로 인증번호 발송 하는 기능인데 API KEY 등록하지 않아 현재는 Mock 처리]')
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('/sms')
  async sendSms(@Body() smsInfo: SendSmsRequestDto): Promise<boolean> {
    return await this.smsService.sendSms(smsInfo.phone, smsInfo.name);
  }
}
