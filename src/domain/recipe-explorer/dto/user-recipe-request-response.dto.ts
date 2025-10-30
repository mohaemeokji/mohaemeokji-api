import { ApiProperty } from '@nestjs/swagger';

export class UserRecipeRequestResponseDto {
  @ApiProperty({ description: '요청 ID' })
  id: string;

  @ApiProperty({ description: '유저 ID' })
  userId: number;

  @ApiProperty({ description: '레시피 ID' })
  recipeId: string;

  @ApiProperty({ description: '최초 요청 시간' })
  createdAt: Date;

  @ApiProperty({ description: '마지막 요청 시간' })
  updatedAt: Date;
}

