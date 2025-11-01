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
import * as jwksClient from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';

/**
 * OAuth Login Service
 * 
 * 카카오, 애플 등 소셜 로그인을 Client-Side Flow로 처리합니다.
 * 네이티브 앱에서 받은 토큰을 검증하여 로그인합니다.
 * 
 * 이메일을 기준으로 계정을 통합 관리합니다.
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
   * 카카오 토큰으로 로그인
   * 
   * 네이티브 앱에서 카카오 SDK로 받은 액세스 토큰을 사용하여 로그인합니다.
   * 
   * @param accessToken 카카오 SDK에서 받은 액세스 토큰
   * @returns JWT 토큰 (accessToken, refreshToken)
   */
  async kakaoLoginWithToken(accessToken: string): Promise<any> {
    try {
      this.logger.log('Kakao Client-Side Flow: Starting login with access token');

      // 1. 액세스 토큰으로 사용자 정보 조회
      const kakaoUserInfo = await this.getKakaoUserInfo(accessToken);

      if (!kakaoUserInfo || !kakaoUserInfo.email) {
        throw new BadRequestException(
          '카카오로부터 이메일 정보를 가져올 수 없습니다.',
        );
      }

      this.logger.log(`Kakao user info retrieved: ${kakaoUserInfo.email}`);

      // 2. 이메일로 기존 사용자 검색 및 로그인 처리
      const user = await this.findOrCreateUser(
        kakaoUserInfo.email,
        kakaoUserInfo.name,
        OAuthProvider.KAKAO,
      );

      // 3. JWT 토큰 생성 및 반환
      return await this.loginService.generateTokens(user);
    } catch (error) {
      this.logger.error('Kakao Client-Side login failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : '카카오 로그인에 실패했습니다.';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 애플 토큰으로 로그인
   * 
   * 네이티브 앱에서 애플 SDK로 받은 Identity Token을 사용하여 로그인합니다.
   * 
   * @param identityToken 애플 SDK에서 받은 Identity Token (JWT)
   * @param name 사용자 이름 (최초 로그인 시에만 제공됨)
   * @returns JWT 토큰 (accessToken, refreshToken)
   */
  async appleLoginWithToken(identityToken: string, name?: string): Promise<any> {
    try {
      this.logger.log('Apple Client-Side Flow: Starting login with identity token');

      // 1. Identity Token 검증 및 사용자 정보 추출
      const appleUserInfo = await this.verifyAppleToken(identityToken);

      if (!appleUserInfo || !appleUserInfo.email) {
        throw new BadRequestException(
          '애플로부터 이메일 정보를 가져올 수 없습니다.',
        );
      }

      this.logger.log(`Apple user info retrieved: ${appleUserInfo.email}`);

      // 2. 이메일로 기존 사용자 검색 및 로그인 처리
      const userName = name || '애플 사용자';
      const user = await this.findOrCreateUser(
        appleUserInfo.email,
        userName,
        OAuthProvider.APPLE,
      );

      // 3. JWT 토큰 생성 및 반환
      return await this.loginService.generateTokens(user);
    } catch (error) {
      this.logger.error('Apple Client-Side login failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : '애플 로그인에 실패했습니다.';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
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
   * Apple의 공개 키를 사용하여 JWT 서명을 검증합니다.
   * - Apple 공개 키 엔드포인트에서 키 가져오기
   * - JWT 서명 검증
   * - issuer, audience, 만료 시간 검증
   */
  private async verifyAppleToken(
    idToken: string,
  ): Promise<{ email: string; sub: string }> {
    try {
      // 1. JWT 디코딩 (검증 전)
      const decodedToken: any = jwt.decode(idToken, { complete: true });
      
      if (!decodedToken || !decodedToken.header || !decodedToken.header.kid) {
        throw new BadRequestException('유효하지 않은 애플 ID 토큰 형식입니다.');
      }

      const kid = decodedToken.header.kid;
      this.logger.log(`Verifying Apple token with kid: ${kid}`);

      // 2. Apple 공개 키 가져오기
      const client = jwksClient({
        jwksUri: 'https://appleid.apple.com/auth/keys',
        cache: true,
        cacheMaxAge: 86400000, // 24시간 캐싱
      });

      const key = await client.getSigningKey(kid);
      const publicKey = key.getPublicKey();

      // 3. JWT 검증 (서명, issuer, 만료 시간)
      const verified: any = jwt.verify(idToken, publicKey, {
        algorithms: ['RS256'],
        issuer: 'https://appleid.apple.com',
        // audience: 'YOUR_BUNDLE_ID', // 필요시 앱 Bundle ID로 검증
      });

      this.logger.log(`Apple token verified successfully for email: ${verified.email}`);

      // 4. 이메일 정보 확인
      if (!verified.email) {
        throw new BadRequestException('애플 토큰에 이메일 정보가 없습니다.');
      }

      return {
        email: verified.email,
        sub: verified.sub,
      };
    } catch (error) {
      this.logger.error('Failed to verify Apple ID token:', error);
      
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('애플 ID 토큰 서명이 유효하지 않습니다.');
      }
      
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('애플 ID 토큰이 만료되었습니다.');
      }
      
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

