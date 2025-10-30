import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user/user.entity';

/**
 * Database Infrastructure
 * 
 * 순수한 데이터베이스 연결 및 설정만 담당합니다.
 * 비즈니스 로직이나 DTO에 의존하지 않습니다.
 */
export const createDatabaseProvider = (configService: ConfigService) => {
  return new DataSource({
    type: 'postgres',
    host: configService.get<string>('TYPEORM_HOST'),
    port: configService.get<number>('TYPEORM_PORT'),
    username: configService.get<string>('TYPEORM_USERNAME'),
    password: configService.get<string>('TYPEORM_PASSWORD'),
    database: configService.get<string>('TYPEORM_DATABASE'),
    entities: [User],
    synchronize: false, // production에서는 false
    logging: false,
  });
};

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

