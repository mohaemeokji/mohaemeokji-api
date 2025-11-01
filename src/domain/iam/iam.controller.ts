import {
  Controller,
  Post,
  Body,
  HttpStatus,
  BadRequestException,
  HttpCode,
  ValidationPipe,
  Get,
  Res,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiResponse,
  ApiExcludeEndpoint,
  ApiQuery,
} from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { AuthGuard } from './decorators/auth-guard.decorator';
import { AuthType } from './enums/auth-type.enum';

// Services
import { LoginService } from './services/login.service';
import { RegisterService } from './services/register.service';
import { ChangePasswordService } from './services/change-password.service';
import { ForgotPasswordService } from './services/forgot-password.service';
import { OAuthLoginService } from './services/oauth-login.service';
import { SmsService } from '../../core/components/sms/sms.service';

// DTOs
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { SendVerificationCodeRequestDto } from './dto/send-verification-code.request.dto';
import { SendVerificationCodeResponseDto } from './dto/send-verification-code.response.dto';

/**
 * IAM Controller (Identity and Access Management)
 * 
 * 인증 및 인가 관련 모든 엔드포인트를 관리합니다.
 * - 로그인 / 토큰 재발급
 * - 회원가입 / 휴대폰 인증
 * - 비밀번호 변경 / 비밀번호 찾기
 * - OAuth (카카오, 애플) 소셜 로그인
 */
@ApiTags('Auth [자체 로그인은 구현된 상태, 카카오 애플은 구현되지 않은 상태]')
@AuthGuard(AuthType.None)
@Controller('auth')
export class IamController {
  constructor(
    private readonly loginService: LoginService,
    private readonly registerService: RegisterService,
    private readonly changePasswordService: ChangePasswordService,
    private readonly forgotPasswordService: ForgotPasswordService,
    private readonly oauthLoginService: OAuthLoginService,
    private readonly smsService: SmsService,
  ) {}

  // ===== 로그인 =====

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: '유저 로그인' })
  @ApiOkResponse({
    status: 200,
    description: 'Authentication a user with email and password credentials and return token',
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Forbidden' })
  async login(@Body() loginDto: LoginDto): Promise<any> {
    return await this.loginService.login(loginDto);
  }

  @Post('refresh-tokens')
  @HttpCode(200)
  @ApiOperation({ summary: '토큰 재발급' })
  @ApiBearerAuth()
  @ApiOkResponse({
    status: 200,
    description: 'Refresh tokens and return new tokens',
  })
  @ApiUnauthorizedResponse({ status: 401, description: 'Forbidden' })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.loginService.refreshTokens(refreshTokenDto);
  }

  // ===== 회원가입 =====

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: '유저 회원가입' })
  @ApiResponse({
    status: 201,
    description: '새로운 사용자를 등록',
    schema: {
      type: 'object',
      properties: {
        user_id: { type: 'string', example: 13 },
      },
    },
  })
  @ApiBadRequestResponse({ status: 400, description: '잘못된 요청입니다' })
  async register(@Body(ValidationPipe) registerUserDto: RegisterUserDto): Promise<any> {
    try {
      await this.registerService.register(registerUserDto);

      return {
        message: '사용자 등록이 성공적으로 완료되었습니다!',
        status: HttpStatus.CREATED,
      };
    } catch (err) {
      throw new BadRequestException(err, '오류: 사용자 등록에 실패했습니다!');
    }
  }

  @Post('register/phone/verify')
  @HttpCode(200)
  @ApiOperation({ summary: '휴대폰 인증번호 발송' })
  @ApiResponse({
    status: 200,
    description: '인증번호가 발송되었습니다',
    type: SendVerificationCodeResponseDto,
  })
  @ApiBadRequestResponse({ status: 400, description: '잘못된 요청입니다' })
  async sendVerificationCode(
    @Body(ValidationPipe) sendVerificationCodeRequestDto: SendVerificationCodeRequestDto,
  ): Promise<SendVerificationCodeResponseDto> {
    const { verificationCode, createdAt } = await this.smsService.sendVerificationCode(
      sendVerificationCodeRequestDto.phone,
    );
    return { verificationCode, createdAt };
  }

  // ===== 비밀번호 변경 =====

  @Post('change-password')
  @HttpCode(200)
  @ApiOperation({ summary: '유저 비밀번호 변경' })
  @ApiOkResponse({
    status: 200,
    description: 'Request Change Password and send a confirmation email to the user',
  })
  @ApiBadRequestResponse({ status: 400, description: 'Bad request' })
  async changePassword(@Body() changePasswordDto: ChangePasswordDto): Promise<any> {
    try {
      await this.changePasswordService.changePassword(changePasswordDto);

      return {
        message: 'Request Change Password Successfully!',
        status: HttpStatus.OK,
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: Change password failed!');
    }
  }

  // ===== 비밀번호 찾기 =====

  @Post('forgot-password')
  @HttpCode(200)
  @ApiExcludeEndpoint()
  @ApiOkResponse({
    status: 200,
    description: 'Request Reset Password and send a confirmation email to the user',
  })
  @ApiBadRequestResponse({ status: 400, description: 'Bad request' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<any> {
    try {
      await this.forgotPasswordService.forgotPassword(forgotPasswordDto);

      return {
        message: 'Request Reset Password Successfully!',
        status: HttpStatus.OK,
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: Forgot password failed!');
    }
  }

  // ===== 카카오 OAuth =====

  @Get('oauth/kakao/login')
  @ApiOperation({
    summary: '카카오 로그인 시작',
    description: '카카오 OAuth 로그인 페이지로 리다이렉션합니다.',
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

  @Get('oauth/kakao/callback')
  @ApiOperation({
    summary: '카카오 로그인 콜백',
    description: '카카오 OAuth 콜백을 처리합니다.',
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
      
      const frontendUrl = process.env.FRONTEND_OAUTH_SUCCESS_URL || 'http://localhost:3001/oauth/callback';
      const redirectUrl = `${frontendUrl}?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
      
      return res.redirect(redirectUrl);
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const errorMessage = error instanceof Error ? error.message : '카카오 로그인에 실패했습니다.';
      const errorUrl = `${frontendUrl}/oauth/error?message=${encodeURIComponent(errorMessage)}`;
      return res.redirect(errorUrl);
    }
  }

  // ===== 애플 OAuth =====

  @Get('oauth/apple/login')
  @ApiOperation({
    summary: '애플 로그인 시작',
    description: '애플 OAuth 로그인 페이지로 리다이렉션합니다.',
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

  @Post('oauth/apple/callback')
  @HttpCode(200)
  @ApiOperation({
    summary: '애플 로그인 콜백',
    description: '애플 OAuth 콜백을 처리합니다. (애플은 POST로 받습니다)',
  })
  async appleCallback(
    @Body('code') code: string,
    @Body('state') state: string,
    @Body('user') user: string,
    @Res() res: FastifyReply,
  ) {
    try {
      const userData = user ? JSON.parse(user) : undefined;
      const result = await this.oauthLoginService.appleCallback(code, userData);
      
      const frontendUrl = process.env.FRONTEND_OAUTH_SUCCESS_URL || 'http://localhost:3001/oauth/callback';
      const redirectUrl = `${frontendUrl}?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
      
      return res.redirect(redirectUrl);
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const errorMessage = error instanceof Error ? error.message : '애플 로그인에 실패했습니다.';
      const errorUrl = `${frontendUrl}/oauth/error?message=${encodeURIComponent(errorMessage)}`;
      return res.redirect(errorUrl);
    }
  }
}

