import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { AuthService } from "src/auth/auth.service";
import { UsersService } from "src/users/users.service";

@Injectable()
export class SocketBearerTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket = context.switchToWs().getClient();
    const header = socket.handshake.headers;
    const rawToken = header["authorization"];

    if (!rawToken) {
      throw new UnauthorizedException("Token is not found");
    }

    try {
      const token = this.authService.extractTokenFromHeader(rawToken, true);
      const payload = await this.authService.verifyToken(token);
      const user = await this.userService.getUserByEmail(payload.email);

      socket.user = user;
      socket.token = token;
      socket.tokenType = payload.tokenType;
      return true;
    } catch (e) {
      throw new WsException("토큰이 유효하지 않습니다.");
    }
  }
}
