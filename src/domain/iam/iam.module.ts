import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from '../../core/utils/utils.module';
import { UsersModule } from '../users/users.module';
import { MailerModule } from '../../core/components/mailer/mailer.module';
import { RepositoriesModule } from '../../core/repositories/repositories.module';

// Services
import { LoginService } from './services/login.service';
import { RegisterService } from './services/register.service';
import { ChangePasswordService } from './services/change-password.service';
import { ForgotPasswordService } from './services/forgot-password.service';

// Controllers
import { LoginController } from './controllers/login.controller';
import { RegisterController } from './controllers/register.controller';
import { ChangePasswordController } from './controllers/change-password.controller';
import { ForgotPasswordController } from './controllers/forgot-password.controller';

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
    JwtModule.registerAsync(jwtConfig.asProvider()),
    UsersModule,
    RepositoriesModule,
    UtilsModule,
    MailerModule,
    SmsModule,
  ],
  controllers: [
    LoginController,
    RegisterController,
    ChangePasswordController,
    ForgotPasswordController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    LoginService,
    RegisterService,
    ChangePasswordService,
    ForgotPasswordService,
    AccessTokenGuard,
  ],
  exports: [LoginService, RegisterService],
})
export class IamModule {}
