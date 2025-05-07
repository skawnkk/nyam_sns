import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiHeader,
  ApiResponse,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { BasicTokenGuard } from "./guard/basic-token.guard";
import { RefreshTokenGuard } from "./guard/bearer-token.guard";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { Request, Response } from "express";
import { AccessTokenDto } from "./dto/access-token.dto";

@ApiTags("auth") // 스웨거에서 auth 그룹으로 묶임
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("token/access")
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({ summary: "Access Token 재발급 (헤더로 refresh 토큰 전달)" })
  @ApiHeader({ name: "Authorization", description: "Bearer {refreshToken}" })
  @ApiResponse({ status: 201, description: "AccessToken 재발급 성공" })
  postTokenAccess(@Headers("authorization") rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);
    return { accessToken: this.authService.rotateToken(token, false) };
  }

  @Post("token/refresh")
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({ summary: "Refresh Token 재발급 (쿠키 기반)" })
  @ApiHeader({ name: "Authorization", description: "Bearer {refreshToken}" })
  @ApiResponse({ status: 201, description: "RefreshToken 재발급 성공" })
  postRefreshAccess(
    @Headers("authorization") rawToken: string,
    @Req() req: Request,
  ) {
    const token = req.cookies["refreshToken"];
    return { refreshToken: this.authService.rotateToken(token, true) };
  }

  @Post("login/email")
  @UseGuards(BasicTokenGuard)
  @ApiOperation({
    summary: "이메일 로그인 (accessToken + refreshToken 쿠키로 반환)",
  })
  @ApiHeader({
    name: "Authorization",
    description: "Basic base64(email:password)",
  })
  @ApiResponse({
    status: 201,
    description: "로그인 성공, accessToken 반환 및 refreshToken 쿠키로 설정",
    type: AccessTokenDto, // ✅ 여기가 핵심
  })
  async postLoginWithEmail(
    @Headers("authorization") rawToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = this.authService.extractTokenFromHeader(rawToken, false);
    const credentials = this.authService.decodeBasicToken(token);
    const { accessToken, refreshToken } =
      await this.authService.loginWithEmail(credentials);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  @Post("register/email")
  @ApiOperation({ summary: "이메일 회원가입" })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: "회원가입 성공" })
  postRegisterWithEmail(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerWithEmail(createUserDto);
  }
}
