import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from './domain/iam/decorators/auth-guard.decorator';
import { AuthType } from './domain/iam/enums/auth-type.enum';

/**
 * AppController
 * 
 * 모든 헬스체크 경로를 처리합니다.
 * - / (루트)
 * - /health
 * - /_health
 */
@ApiTags('Health')
@AuthGuard(AuthType.None)
@Controller()
export class AppController {
  private getHealthResponse() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Mohaemeokji API is running',
    };
  }

  @Get()
  @ApiOperation({ summary: '루트 헬스 체크 (/)' })
  checkRoot() {
    return this.getHealthResponse();
  }

  @Get('health')
  @ApiOperation({ summary: '헬스 체크 (/health)' })
  checkHealth() {
    return this.getHealthResponse();
  }

  @Get('_health')
  @ApiOperation({ summary: '헬스 체크 (/_health)' })
  checkUnderscoreHealth() {
    return this.getHealthResponse();
  }
}

/**
 * ApiHealthController
 * 
 * /api prefix가 붙은 헬스체크 경로를 처리합니다.
 * - /api/health
 * - /api/_health
 */
@ApiTags('Health')
@AuthGuard(AuthType.None)
@Controller()
export class ApiHealthController {
  private getHealthResponse() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Mohaemeokji API is running',
    };
  }

  @Get('api/health')
  @ApiOperation({ summary: '헬스 체크 (/api/health)' })
  checkApiHealth() {
    return this.getHealthResponse();
  }

  @Get('api/_health')
  @ApiOperation({ summary: '헬스 체크 (/api/_health)' })
  checkApiUnderscoreHealth() {
    return this.getHealthResponse();
  }
}

