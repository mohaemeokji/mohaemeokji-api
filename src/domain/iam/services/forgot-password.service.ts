import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../../core/entities/user/user.entity';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { MailerService } from '../../../core/components/mailer/mailer.service';
import { UuidService } from '../../../core/utils/uuid/uuid.service';
import { HashingService } from '../../../core/utils/hashing/hashing.service';
import { forgotPasswordEmail } from '../../../core/components/mailer/mailer.constants';

@Injectable()
export class ForgotPasswordService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailerService: MailerService,
    private readonly uuidService: UuidService,
    private readonly hashingService: HashingService,
  ) {}

  public async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<any> {
    const userUpdate = await this.userRepository.findOneBy({
      email: forgotPasswordDto.email,
    });
    const passwordRand = this.uuidService.generateUuid();
    userUpdate.password = await this.hashingService.hash(passwordRand);

    this.sendMailForgotPassword(userUpdate.email, passwordRand);

    return await this.userRepository.save(userUpdate);
  }

  private sendMailForgotPassword(email: string, password: string): void {
    try {
      this.mailerService.sendMail({
        to: email,
        from: 'from@example.com',
        subject: 'Forgot Password successful ✔',
        text: 'Forgot Password successful!',
        html: forgotPasswordEmail(password),
      });
      Logger.log('[MailService] Forgot Password: Send Mail successfully!');
    } catch (err) {
      Logger.error('[MailService] Forgot Password: Send Mail Failed!', err);
    }
  }
}
