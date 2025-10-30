import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  Res,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { OAuthLoginService } from '../services/oauth-login.service';
import { AuthType } from '../enums/auth-type.enum';
import { AuthGuard } from '../decorators/auth-guard.decorator';

/**
 * OAuth Login Controller (Server-Side Flow)
 * 
 * 카카오, 애플 등 소셜 로그인을 Server-Side Flow 방식으로 처리합니다.
 * 백엔드에서 OAuth 리다이렉션을 관리하고, 이메일을 기준으로 계정을 통합 관리합니다.
 */
@ApiTags('auth')
@AuthGuard(AuthType.None)
@Controller('auth/oauth')
export class OAuthLoginController {
  constructor(private readonly oauthLoginService: OAuthLoginService) {}

  /**
   * ===== Server-Side Flow (백엔드 리다이렉션) =====
   */

  @Get('kakao/login')
  @ApiOperation({
    summary: '카카오 로그인 시작 (Server-Side Flow)',
    description: `
      카카오 OAuth 로그인 페이지로 리다이렉션합니다.
      
      **사용 방법:**
      1. 프론트엔드에서 이 엔드포인트로 사용자를 리다이렉션시킵니다.
      2. 사용자가 카카오 로그인을 완료합니다.
      3. 카카오가 백엔드의 콜백 URL로 리다이렉션합니다.
      4. 백엔드가 JWT 토큰을 생성하고 프론트엔드로 리다이렉션합니다.
    `,
  })
  @ApiQuery({
    name: 'state',
    required: false,
    description: 'CSRF 방지를 위한 상태 값',
  })
  kakaoLoginRedirect(@Query('state') state?: string, @Res() res?: FastifyReply) {
    const authUrl = this.oauthLoginService.getKakaoAuthorizationUrl(state);
    return res.redirect(authUrl);
  }

  @Get('kakao/callback')
  @ApiOperation({
    summary: '카카오 로그인 콜백 (Server-Side Flow)',
    description: `
      카카오 OAuth 콜백을 처리합니다.
      
      **동작:**
      1. 카카오로부터 인증 코드를 받습니다.
      2. 인증 코드를 액세스 토큰으로 교환합니다.
      3. 사용자 정보를 조회하고 로그인 처리합니다.
      4. JWT 토큰과 함께 프론트엔드로 리다이렉션합니다.
    `,
  })
  @ApiQuery({ name: 'code', description: '카카오 인증 코드' })
  @ApiQuery({ name: 'state', required: false, description: 'CSRF 상태 값' })
  async kakaoCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: FastifyReply,
  ) {
    try {
      const result = await this.oauthLoginService.kakaoCallback(code);
      
      // 프론트엔드로 리다이렉션 (JWT 토큰을 쿼리 파라미터로 전달)
      const frontendUrl = process.env.FRONTEND_OAUTH_SUCCESS_URL || 'http://localhost:3001/oauth/callback';
      const redirectUrl = `${frontendUrl}?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
      
      return res.redirect(redirectUrl);
    } catch (error) {
      // 에러 발생 시 프론트엔드 에러 페이지로 리다이렉션
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const errorMessage = error instanceof Error ? error.message : '카카오 로그인에 실패했습니다.';
      const errorUrl = `${frontendUrl}/oauth/error?message=${encodeURIComponent(errorMessage)}`;
      return res.redirect(errorUrl);
    }
  }

  @Get('apple/login')
  @ApiOperation({
    summary: '애플 로그인 시작 (Server-Side Flow)',
    description: `
      애플 OAuth 로그인 페이지로 리다이렉션합니다.
      
      **사용 방법:**
      1. 프론트엔드에서 이 엔드포인트로 사용자를 리다이렉션시킵니다.
      2. 사용자가 애플 로그인을 완료합니다.
      3. 애플이 백엔드의 콜백 URL로 POST 요청을 보냅니다.
      4. 백엔드가 JWT 토큰을 생성하고 프론트엔드로 리다이렉션합니다.
    `,
  })
  @ApiQuery({
    name: 'state',
    required: false,
    description: 'CSRF 방지를 위한 상태 값',
  })
  appleLoginRedirect(@Query('state') state?: string, @Res() res?: FastifyReply) {
    const authUrl = this.oauthLoginService.getAppleAuthorizationUrl(state);
    return res.redirect(authUrl);
  }

  @Post('apple/callback')
  @HttpCode(200)
  @ApiOperation({
    summary: '애플 로그인 콜백 (Server-Side Flow)',
    description: `
      애플 OAuth 콜백을 처리합니다.
      
      **참고:** 애플은 response_mode=form_post를 사용하므로 POST로 받습니다.
      
      **동작:**
      1. 애플로부터 인증 코드를 받습니다.
      2. 인증 코드를 ID 토큰으로 교환합니다.
      3. 사용자 정보를 검증하고 로그인 처리합니다.
      4. JWT 토큰과 함께 프론트엔드로 리다이렉션합니다.
    `,
  })
  async appleCallback(
    @Body('code') code: string,
    @Body('state') state: string,
    @Body('user') user: string, // 최초 로그인 시에만 제공됨 (JSON 문자열)
    @Res() res: FastifyReply,
  ) {
    try {
      // user는 JSON 문자열로 제공되므로 파싱
      const userData = user ? JSON.parse(user) : undefined;
      
      const result = await this.oauthLoginService.appleCallback(code, userData);
      
      // 프론트엔드로 리다이렉션 (JWT 토큰을 쿼리 파라미터로 전달)
      const frontendUrl = process.env.FRONTEND_OAUTH_SUCCESS_URL || 'http://localhost:3001/oauth/callback';
      const redirectUrl = `${frontendUrl}?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
      
      return res.redirect(redirectUrl);
    } catch (error) {
      // 에러 발생 시 프론트엔드 에러 페이지로 리다이렉션
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const errorMessage = error instanceof Error ? error.message : '애플 로그인에 실패했습니다.';
      const errorUrl = `${frontendUrl}/oauth/error?message=${encodeURIComponent(errorMessage)}`;
      return res.redirect(errorUrl);
    }
  }

}

