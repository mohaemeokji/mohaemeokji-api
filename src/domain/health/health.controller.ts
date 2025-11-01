import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../iam/decorators/auth-guard.decorator';
import { AuthType } from '../iam/enums/auth-type.enum';

@ApiTags('Health')
@AuthGuard(AuthType.None)
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: '헬스 체크 엔드포인트' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}

