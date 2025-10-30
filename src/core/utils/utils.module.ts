import { Module } from '@nestjs/common';
import { UuidService } from './uuid/uuid.service';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { YoutubeIdExtractorService } from './youtube/youtube-id-extractor.service';

@Module({
  providers: [
    UuidService,
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    YoutubeIdExtractorService,
  ],
  exports: [UuidService, HashingService, YoutubeIdExtractorService],
})
export class UtilsModule {}
