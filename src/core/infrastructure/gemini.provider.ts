import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

export const GEMINI_CLIENT = 'GEMINI_CLIENT';

export const geminiProvider = {
  provide: GEMINI_CLIENT,
  useFactory: (configService: ConfigService) => {
    const apiKey = configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    return new GoogleGenerativeAI(apiKey);
  },
  inject: [ConfigService],
};

