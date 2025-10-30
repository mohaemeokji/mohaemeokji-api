import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUser } from '../../iam/interfaces/jwt-user.interface';

export const GetUser = createParamDecorator(
  (data, ctx: ExecutionContext): JwtUser => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
