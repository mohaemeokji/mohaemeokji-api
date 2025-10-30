import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { geminiProvider } from '../../infrastructure/gemini.provider';

@Module({
  imports: [ConfigModule],
  providers: [geminiProvider, GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {}

