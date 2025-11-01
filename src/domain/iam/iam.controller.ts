import {
  Controller,
  Post,
  Body,
  HttpStatus,
  BadRequestException,
  HttpCode,
  ValidationPipe,
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
} from '@nestjs/swagger';
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
import { KakaoLoginDto } from './dto/kakao-login.dto';
import { AppleLoginDto } from './dto/apple-login.dto';

/**
 * IAM Controller (Identity and Access Management)
 * 
 * 인증 및 인가 관련 모든 엔드포인트를 관리합니다.
 * - 로그인 / 토큰 재발급
 * - 회원가입 / 휴대폰 인증
 * - 비밀번호 변경 / 비밀번호 찾기
 * - OAuth (카카오, 애플) 소셜 로그인
 */
@ApiTags('Auth')
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

  // ===== OAuth - Client-Side Flow (네이티브 앱용) =====

  @Post('oauth/kakao')
  @HttpCode(200)
  @ApiOperation({
    summary: '카카오 로그인 (네이티브 앱용)',
    description: `
      카카오 SDK에서 받은 액세스 토큰으로 로그인합니다.
      
      **사용 방법:**
      1. 네이티브 앱에서 카카오 SDK로 로그인합니다.
      2. 카카오 SDK에서 받은 액세스 토큰을 이 엔드포인트로 전송합니다.
      3. 백엔드가 토큰을 검증하고 JWT 토큰을 반환합니다.
      
      **권장:** 네이티브 앱(iOS, Android)에서는 이 방식을 사용하세요.
    `,
  })
  @ApiOkResponse({
    status: 200,
    description: 'JWT 토큰 반환',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
      },
    },
  })
  @ApiBadRequestResponse({ status: 400, description: '잘못된 요청입니다' })
  async kakaoLogin(@Body() kakaoLoginDto: KakaoLoginDto): Promise<any> {
    return await this.oauthLoginService.kakaoLoginWithToken(kakaoLoginDto.accessToken);
  }

  @Post('oauth/apple')
  @HttpCode(200)
  @ApiOperation({
    summary: '애플 로그인 (네이티브 앱용)',
    description: `
      애플 SDK에서 받은 Identity Token으로 로그인합니다.
      
      **사용 방법:**
      1. 네이티브 앱에서 애플 SDK로 로그인합니다.
      2. 애플 SDK에서 받은 Identity Token을 이 엔드포인트로 전송합니다.
      3. 백엔드가 토큰을 검증하고 JWT 토큰을 반환합니다.
      
      **참고:** name은 최초 로그인 시에만 애플에서 제공됩니다.
      
      **권장:** 네이티브 앱(iOS, Android)에서는 이 방식을 사용하세요.
    `,
  })
  @ApiOkResponse({
    status: 200,
    description: 'JWT 토큰 반환',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
      },
    },
  })
  @ApiBadRequestResponse({ status: 400, description: '잘못된 요청입니다' })
  async appleLogin(@Body() appleLoginDto: AppleLoginDto): Promise<any> {
    return await this.oauthLoginService.appleLoginWithToken(
      appleLoginDto.identityToken,
      appleLoginDto.name,
    );
  }

}

