import { Body, Controller, Headers, Post, UseGuards, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { MaxLengthPipe, MinLengthPipe } from "./pipe/password.pipe";
import { BasicTokenGuard } from "./guard/basic-token.guard";
import { RefreshTokenGuard } from "./guard/bearer-token.guard";

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
  async postLoginWithEmail(@Headers("authorization") rawToken: string, @Request() req: any) {
    const token = this.authService.extractTokenFromHeader(rawToken, false);
    const credentials = this.authService.decodeBasicToken(token);
    return this.authService.loginWithEmail(credentials);
  }

  @Post("register/email")
  postRegisterWithEmail(
    @Body("email") email: string,
    @Body("password", new MaxLengthPipe(20, "password"), new MinLengthPipe(8, "password")) password: string,
    @Body("nickname") nickname: string,
  ) {
    return this.authService.registerWithEmail({ email, password, nickname });
  }
}
