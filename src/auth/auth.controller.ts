import { Body, Controller, Head, Headers, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersModel } from "src/users/entities/users.entity";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("token/access")
  postTokenAccess(@Headers("authorization") rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);
    return { accessToken: this.authService.rotateToken(token, false) };
  }

  @Post("token/refresh")
  postRefreshAccess(@Headers("authorization") rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);
    return { refreshToken: this.authService.rotateToken(token, true) };
  }

  @Post("login/email")
  async postLoginWithEmail(@Headers("authorization") rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, false);
    const credentials = this.authService.decodeBasicToken(token);
    return this.authService.loginWithEmail(credentials);
  }

  @Post("register/email")
  postRegisterWithEmail(@Body() users: Pick<UsersModel, "email" | "password" | "nickname">) {
    return this.authService.registerWithEmail(users);
  }
}
