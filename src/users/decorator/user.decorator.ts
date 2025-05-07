import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from "@nestjs/common";
import { UsersModel } from "../entities/users.entity";

export const User = createParamDecorator(
  (data: keyof UsersModel | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    const user = req.user as UsersModel;

    if (!user) {
      throw new InternalServerErrorException(
        "AccessTokenGuard is not working properly, or user is not found in request object.",
      );
    }

    if (data) {
      return user[data];
    }

    return user;
  },
);
