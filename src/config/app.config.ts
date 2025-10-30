import { ConfigModuleOptions } from '@nestjs/config';
import { validateSchemaEnv } from './env-validation.config';

export const appConfig: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: ['.env', '.env.dev', '.env.stage', '.env.prod'],
  validate: validateSchemaEnv,
};

