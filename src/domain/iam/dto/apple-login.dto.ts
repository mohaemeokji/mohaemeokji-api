import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AppleLoginDto {
  @ApiProperty({
    description: '애플 SDK에서 받은 Identity Token (JWT)',
    example: 'eyJraWQiOiJlWGF1bm1MIiwiYWxnIjoiUlMyNTYifQ...',
  })
  @IsNotEmpty()
  @IsString()
  identityToken: string;

  @ApiPropertyOptional({
    description: '사용자 이름 (최초 로그인 시에만 제공됨)',
    example: '홍길동',
  })
  @IsOptional()
  @IsString()
  name?: string;
}

