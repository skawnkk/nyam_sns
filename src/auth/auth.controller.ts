import { Body, Controller, Headers, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { BasicTokenGuard } from "./guard/basic-token.guard";
import { RefreshTokenGuard } from "./guard/bearer-token.guard";
import { CreateUserDto } from "src/users/dto/create-user.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("token/access")
  @UseGuards(RefreshTokenGuard)
  postTokenAccess(@Headers("authorization") rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);
    return { accessToken: this.authService.rotateToken(token, false) };
  }

  @Post("token/refresh")
  @UseGuards(RefreshTokenGuard)
  postRefreshAccess(@Headers("authorization") rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);
    return { refreshToken: this.authService.rotateToken(token, true) };
  }

  @Post("login/email")
  @UseGuards(BasicTokenGuard)
  async postLoginWithEmail(@Headers("authorization") rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, false);
    const credentials = this.authService.decodeBasicToken(token);
    return this.authService.loginWithEmail(credentials);
  }

  @Post("register/email")
  postRegisterWithEmail(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerWithEmail(createUserDto);
  }
}
