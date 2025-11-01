import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class KakaoLoginDto {
  @ApiProperty({
    description: '카카오 SDK에서 받은 액세스 토큰',
    example: 'ya29.a0AfH6SMBx...',
  })
  @IsNotEmpty()
  @IsString()
  accessToken: string;
}

