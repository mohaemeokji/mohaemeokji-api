import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateRecipeRequestDto {
  @ApiProperty({ 
    description: '유튜브 비디오 ID 또는 URL',
    example: 'eIo2BaE6LxI'
  })
  @IsString()
  @IsNotEmpty()
  videoIdOrUrl: string;
}

