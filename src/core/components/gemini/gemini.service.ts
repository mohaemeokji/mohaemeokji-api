import { Injectable, Inject } from '@nestjs/common';
import {
  GoogleGenerativeAI,
  GenerateContentRequest,
  Part,
  GenerateContentResult,
  GenerateContentStreamResult,
} from '@google/generative-ai';
import { GEMINI_CLIENT } from '../../infrastructure/gemini.provider';

@Injectable()
export class GeminiService {
  constructor(@Inject(GEMINI_CLIENT) private readonly genAI: GoogleGenerativeAI) {}

  async generate(
    request: GenerateContentRequest | string | Array<string | Part>,
    model: string = 'gemini-2.5-flash',
  ): Promise<GenerateContentResult> {
    const genModel = this.genAI.getGenerativeModel({ model });
    return await genModel.generateContent(request);
  }

  async streamGenerate(
    request: GenerateContentRequest | string | Array<string | Part>,
    model: string = 'gemini-2.5-flash',
  ): Promise<GenerateContentStreamResult> {
    const genModel = this.genAI.getGenerativeModel({ model });
    return await genModel.generateContentStream(request);
  }
}

