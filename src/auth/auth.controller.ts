import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersModel } from "src/users/entities/users.entity";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login/email")
  loginWithEmail(@Body() users: Pick<UsersModel, "email" | "password">) {
    return this.authService.loginWithEmail(users);
  }

  @Post("register/email")
  registerWithEmail(@Body() users: Pick<UsersModel, "email" | "password" | "nickname">) {
    return this.authService.registerWithEmail(users);
  }
}
