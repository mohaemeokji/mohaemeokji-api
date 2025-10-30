import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class UuidService {
  public generateUuid(): string {
    return crypto.randomUUID();
  }
}

