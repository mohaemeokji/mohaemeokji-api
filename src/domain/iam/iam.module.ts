import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from '../../core/utils/utils.module';
import { UsersModule } from '../users/users.module';
import { MailerModule } from '../../core/components/mailer/mailer.module';
import { RepositoriesModule } from '../../core/repositories/repositories.module';
import oauthConfig from '../../config/oauth.config';

// Services
import { LoginService } from './services/login.service';
import { RegisterService } from './services/register.service';
import { ChangePasswordService } from './services/change-password.service';
import { ForgotPasswordService } from './services/forgot-password.service';
import { OAuthLoginService } from './services/oauth-login.service';

// Controllers
import { IamController } from './iam.controller';

// Guards
import { AccessTokenGuard } from './guards/access-token.guard';
import { AuthenticationGuard } from './guards/authentication.guard';

// Config
import jwtConfig from './config/jwt.config';
import { APP_GUARD } from '@nestjs/core';
import { SmsModule } from '../../core/components/sms/sms.module';

/**
 * IAM Module (Identity and Access Management)
 * 
 * 인증 및 인가 관련 기능을 담당합니다.
 * - Login, Register, Change Password, Forgot Password
 * - JWT 기반 인증
 * - Guards 및 Decorators
 */
@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(oauthConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    UsersModule,
    RepositoriesModule,
    UtilsModule,
    MailerModule,
    SmsModule,
  ],
  controllers: [IamController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    LoginService,
    RegisterService,
    ChangePasswordService,
    ForgotPasswordService,
    OAuthLoginService,
    AccessTokenGuard,
  ],
  exports: [LoginService, RegisterService, OAuthLoginService],
})
export class IamModule {}
