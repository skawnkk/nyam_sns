import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";

@Injectable()
export class BasicTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    //1)요청객체를 가져온다.
    const req = context.switchToHttp().getRequest();
    const rawToken = req.headers.authorization;
    if (!rawToken) {
      throw new UnauthorizedException("Token is not found");
    }

    const token = this.authService.extractTokenFromHeader(rawToken, false);

    const { password, email } = this.authService.decodeBasicToken(token);

    const user = await this.authService.authenticateWithEmailAndPassword({ email, password });

    req.user = user; //응답으로 돌아갈 때까지 request는 유효하다.
    return true;
  }
}
