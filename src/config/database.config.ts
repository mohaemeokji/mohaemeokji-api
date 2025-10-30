import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    host: config.get<string>('TYPEORM_HOST'),
    port: config.get<number>('TYPEORM_PORT'),
    username: config.get<string>('TYPEORM_USERNAME'),
    password: config.get<string>('TYPEORM_PASSWORD'),
    database: config.get<string>('TYPEORM_DATABASE'),
    timezone: 'Asia/Seoul',
    synchronize: true,
    entities: [__dirname + '/../**/*.{model,entity}.{ts,js}'],
    namingStrategy: new SnakeNamingStrategy(),
    migrations: ['dist/migrations/**/*.js'],
    subscribers: ['dist/subscriber/**/*.js'],
    cli: {
      migrationsDir: config.get<string>('TYPEORM_MIGRATIONS_DIR'),
      subscribersDir: config.get<string>('TYPEORM_SUBSCRIBERS_DIR'),
    },
    ssl: {
      rejectUnauthorized: false,
    },
  }),
};

