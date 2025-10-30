import { Module } from '@nestjs/common';
import { UuidService } from './uuid/uuid.service';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';

@Module({
  providers: [
    UuidService,
    {
      provide: HashingService,
      useClass: BcryptService,
    },
  ],
  exports: [UuidService, HashingService],
})
export class UtilsModule {}
