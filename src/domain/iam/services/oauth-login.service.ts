import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { LoginService } from './login.service';
import { User } from '../../../core/entities/user/user.entity';
import { OAuthProvider } from '../enums/oauth-provider.enum';
import jwtConfig from '../config/jwt.config';
import oauthConfig from '../../../config/oauth.config';

/**
 * OAuth Login Service (Server-Side Flow)
 * 
 * 카카오, 애플 등 소셜 로그인을 Server-Side Flow 방식으로 처리합니다.
 * 백엔드에서 OAuth 인증 흐름을 관리하고, 이메일을 기준으로 계정을 통합 관리합니다.
 */
@Injectable()
export class OAuthLoginService {
  private readonly logger = new Logger(OAuthLoginService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly loginService: LoginService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    @Inject(oauthConfig.KEY)
    private readonly oauthConfiguration: ConfigType<typeof oauthConfig>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 카카오 OAuth 인증 URL 생성
   * Server-Side Flow의 첫 단계
   */
  getKakaoAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.oauthConfiguration.kakao.clientId,
      redirect_uri: this.oauthConfiguration.kakao.redirectUri,
      response_type: 'code',
      ...(state && { state }),
    });

    return `${this.oauthConfiguration.kakao.authorizationUrl}?${params.toString()}`;
  }

  /**
   * 애플 OAuth 인증 URL 생성
   * Server-Side Flow의 첫 단계
   */
  getAppleAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.oauthConfiguration.apple.clientId,
      redirect_uri: this.oauthConfiguration.apple.redirectUri,
      response_type: 'code',
      response_mode: 'form_post',
      scope: 'name email',
      ...(state && { state }),
    });

    return `${this.oauthConfiguration.apple.authorizationUrl}?${params.toString()}`;
  }

  /**
   * 카카오 콜백 처리 (Server-Side Flow)
   * 
   * 1. 인증 코드를 액세스 토큰으로 교환
   * 2. 액세스 토큰으로 사용자 정보 조회
   * 3. 이메일로 기존 사용자 검색
   * 4. 기존 사용자가 있으면 로그인, 없으면 회원가입 후 로그인
   */
  async kakaoCallback(code: string): Promise<any> {
    try {
      // 1. 인증 코드를 액세스 토큰으로 교환
      const accessToken = await this.getKakaoAccessToken(code);

      // 2. 액세스 토큰으로 사용자 정보 조회
      const kakaoUserInfo = await this.getKakaoUserInfo(accessToken);

      if (!kakaoUserInfo || !kakaoUserInfo.email) {
        throw new BadRequestException(
          '카카오로부터 이메일 정보를 가져올 수 없습니다.',
        );
      }

      // 3. 이메일로 기존 사용자 검색 및 로그인 처리
      const user = await this.findOrCreateUser(
        kakaoUserInfo.email,
        kakaoUserInfo.name,
        OAuthProvider.KAKAO,
      );

      // 4. JWT 토큰 생성 및 반환
      return await this.loginService.generateTokens(user);
    } catch (error) {
      this.logger.error('Kakao callback failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : '카카오 로그인에 실패했습니다.';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 애플 콜백 처리 (Server-Side Flow)
   * 
   * 1. 인증 코드를 ID 토큰으로 교환
   * 2. ID 토큰을 검증하고 사용자 정보 추출
   * 3. 이메일로 기존 사용자 검색
   * 4. 기존 사용자가 있으면 로그인, 없으면 회원가입 후 로그인
   */
  async appleCallback(code: string, user?: any): Promise<any> {
    try {
      // 1. 인증 코드를 ID 토큰으로 교환
      const idToken = await this.getAppleIdToken(code);

      // 2. ID 토큰 검증 및 사용자 정보 추출
      const appleUserInfo = await this.verifyAppleToken(idToken);

      if (!appleUserInfo || !appleUserInfo.email) {
        throw new BadRequestException(
          '애플로부터 이메일 정보를 가져올 수 없습니다.',
        );
      }

      // 3. 이메일로 기존 사용자 검색 및 로그인 처리
      // user 객체는 최초 로그인 시에만 애플에서 제공됩니다.
      const userName = user?.name?.firstName
        ? `${user.name.firstName}${user.name.lastName || ''}`
        : '사용자';

      const userEntity = await this.findOrCreateUser(
        appleUserInfo.email,
        userName,
        OAuthProvider.APPLE,
      );

      // 4. JWT 토큰 생성 및 반환
      return await this.loginService.generateTokens(userEntity);
    } catch (error) {
      this.logger.error('Apple callback failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : '애플 로그인에 실패했습니다.';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 카카오 인증 코드를 액세스 토큰으로 교환
   */
  private async getKakaoAccessToken(code: string): Promise<string> {
    try {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.oauthConfiguration.kakao.clientId,
        client_secret: this.oauthConfiguration.kakao.clientSecret,
        redirect_uri: this.oauthConfiguration.kakao.redirectUri,
        code,
      });

      const response = await fetch(this.oauthConfiguration.kakao.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error('Failed to get Kakao access token:', errorData);
        throw new UnauthorizedException('카카오 액세스 토큰 획득에 실패했습니다.');
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      this.logger.error('Failed to exchange Kakao code for token:', error);
      throw new UnauthorizedException('카카오 인증 코드 교환에 실패했습니다.');
    }
  }

  /**
   * 애플 인증 코드를 ID 토큰으로 교환
   */
  private async getAppleIdToken(code: string): Promise<string> {
    try {
      // TODO: 애플 토큰 교환은 client_secret 생성이 복잡합니다.
      // 프로덕션에서는 Apple Private Key로 서명된 JWT를 생성해야 합니다.
      // 지금은 간단히 코드를 ID 토큰으로 간주합니다.
      
      // 실제 구현 시:
      // 1. Apple Private Key로 client_secret JWT 생성
      // 2. 토큰 엔드포인트로 POST 요청
      // 3. id_token 추출 및 반환
      
      this.logger.warn('Apple token exchange is not fully implemented. Using code as ID token for development.');
      return code; // 개발 모드: 코드를 그대로 사용
    } catch (error) {
      this.logger.error('Failed to exchange Apple code for token:', error);
      throw new UnauthorizedException('애플 인증 코드 교환에 실패했습니다.');
    }
  }

  /**
   * 이메일로 사용자를 찾거나 새로 생성
   */
  private async findOrCreateUser(
    email: string,
    name: string,
    provider: OAuthProvider,
  ): Promise<User> {
    try {
      // 이메일로 기존 사용자 검색
      const existingUser = await this.usersService.findByEmail(email);
      
      this.logger.log(
        `Existing user found with email ${email}. Provider: ${existingUser.register_path}`,
      );
      
      return existingUser;
    } catch (error) {
      // 사용자가 없는 경우 - 새로 생성
      this.logger.log(
        `No existing user found with email ${email}. Creating new user with provider: ${provider}`,
      );
      return await this.createOAuthUser(email, name, provider);
    }
  }

  /**
   * 카카오 사용자 정보 조회
   */
  private async getKakaoUserInfo(
    accessToken: string,
  ): Promise<{ email: string; name: string }> {
    try {
      const response = await fetch('https://kapi.kakao.com/v2/user/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      });

      if (!response.ok) {
        throw new UnauthorizedException(
          '카카오 사용자 정보를 가져올 수 없습니다.',
        );
      }

      const data = await response.json();

      const email = data.kakao_account?.email;
      const name = data.kakao_account?.profile?.nickname || '카카오 사용자';

      if (!email) {
        throw new BadRequestException(
          '카카오 계정에서 이메일 정보를 찾을 수 없습니다.',
        );
      }

      return { email, name };
    } catch (error) {
      this.logger.error('Failed to get Kakao user info:', error);
      throw new UnauthorizedException('카카오 사용자 정보 조회에 실패했습니다.');
    }
  }

  /**
   * 애플 ID 토큰 검증
   * 
   * 참고: 실제 프로덕션에서는 Apple의 공개 키를 사용하여 토큰을 검증해야 합니다.
   * 현재는 간단하게 디코딩만 수행합니다.
   */
  private async verifyAppleToken(
    idToken: string,
  ): Promise<{ email: string; sub: string }> {
    try {
      // JWT 디코딩 (검증 없이) - Base64 디코딩 사용
      const tokenParts = idToken.split('.');
      if (tokenParts.length !== 3) {
        throw new BadRequestException('유효하지 않은 애플 ID 토큰 형식입니다.');
      }

      // Payload 부분 디코딩
      const payload = tokenParts[1];
      const decodedPayload = Buffer.from(payload, 'base64').toString('utf-8');
      const decoded: any = JSON.parse(decodedPayload);

      if (!decoded || !decoded.email) {
        throw new BadRequestException('유효하지 않은 애플 ID 토큰입니다.');
      }

      return {
        email: decoded.email,
        sub: decoded.sub,
      };

      // TODO: 프로덕션에서는 Apple의 공개 키로 토큰을 검증해야 합니다.
      // Apple의 공개 키는 https://appleid.apple.com/auth/keys 에서 가져올 수 있습니다.
      // 
      // 검증 방법:
      // 1. Apple의 공개 키 엔드포인트에서 키 목록을 가져옵니다.
      // 2. 토큰 헤더의 'kid'와 일치하는 키를 찾습니다.
      // 3. 해당 키로 토큰 서명을 검증합니다.
      // 4. issuer가 'https://appleid.apple.com'인지 확인합니다.
      // 5. audience가 앱의 Bundle ID인지 확인합니다.
      // 6. exp(만료 시간)이 유효한지 확인합니다.
    } catch (error) {
      this.logger.error('Failed to verify Apple ID token:', error);
      throw new UnauthorizedException('애플 ID 토큰 검증에 실패했습니다.');
    }
  }

  /**
   * OAuth 사용자 생성
   * 
   * 이메일, 이름, OAuth 제공자 정보로 새로운 사용자를 생성합니다.
   * 비밀번호는 랜덤 문자열로 생성합니다 (OAuth 로그인은 비밀번호를 사용하지 않음).
   */
  private async createOAuthUser(
    email: string,
    name: string,
    provider: OAuthProvider,
  ): Promise<User> {
    try {
      // OAuth 사용자는 비밀번호를 사용하지 않으므로 랜덤 문자열 생성
      const randomPassword = this.generateRandomPassword();

      const userData: Partial<User> = {
        email,
        name,
        password: randomPassword,
        register_path: provider,
        marketing_agreed: false,
      };

      return await this.usersService.create(userData as any);
    } catch (error) {
      this.logger.error('Failed to create OAuth user:', error);
      throw new BadRequestException('OAuth 사용자 생성에 실패했습니다.');
    }
  }

  /**
   * 랜덤 비밀번호 생성
   * OAuth 사용자는 비밀번호로 로그인하지 않으므로 암호학적으로 안전한 랜덤 문자열을 생성합니다.
   * crypto.randomBytes()를 사용하여 보안성을 보장합니다.
   */
  private generateRandomPassword(): string {
    // 32바이트의 암호학적으로 안전한 랜덤 데이터를 base64로 인코딩
    return crypto.randomBytes(32).toString('base64');
  }
}

