import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { User } from '../../../core/entities/user/user.entity';

export class UserUpdateDto extends IntersectionType(
  PartialType(PickType(User, ['email', 'phone', 'name'] as const)),
) {}
