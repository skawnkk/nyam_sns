import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersModel } from "src/users/entities/users.entity";
import { HASH_ROUNDS, JWT_SECRET } from "./const/auth.const";
import { UsersService } from "src/users/users.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  //accessToken, refreshToken을 생성하는 메소드
  //jwt payload에 들어갈 정보 :email, sub(id), type(accessToken, refreshToken)
  signToken(user: Pick<UsersModel, "email" | "id">, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? "refresh" : "access",
    };

    return this.jwtService.sign(payload, { secret: JWT_SECRET, expiresIn: isRefreshToken ? 3600 : 300 });
  }

  //accessToken, refreshToken을 반환하는 메소드
  loginUser(user: Pick<UsersModel, "email" | "id">) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  async authenticateWithEmailAndPassword(user: Pick<UsersModel, "email" | "password">) {
    //email로 사용자를 찾는다.
    const existingUser = await this.usersService.getUserByEmail(user.email);
    if (!existingUser) {
      throw new UnauthorizedException("User not found");
    }

    const passOk = bcrypt.compare(user.password, existingUser.password);
    if (!passOk) {
      throw new UnauthorizedException("Password is not correct");
    }

    return existingUser;
  }

  async loginWithEmail(users: Pick<UsersModel, "email" | "password">) {
    const existingUser = await this.authenticateWithEmailAndPassword(users);
    return this.loginUser(existingUser);
  }

  async registerWithEmail(users: Pick<UsersModel, "email" | "password" | "nickname">) {
    const hash = await bcrypt.hash(users.password, HASH_ROUNDS); //round:10 -> 2^10번 해싱, 높을 수록 속도가 느려진다. salt는 .hash()에서 자동으로 생성한다.
    const newUser = await this.usersService.postUsers({ ...users, password: hash });
    return this.loginUser(newUser);
  }

  //token parsing header:"Bearer ${token}", "Basic ${token}"
  extractTokenFromHeader(header: string, isBearer: boolean) {
    const splitToken = header.split(" ");
    const prefix = isBearer ? "Bearer" : "Basic";
    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException("Invalid token format");
    }
    return splitToken[1];
  }

  decodeBasicToken(base64String: string) {
    const decoded = Buffer.from(base64String, "base64").toString("utf-8") || "";
    const split = decoded.split(":");
    if (split.length !== 2) {
      throw new UnauthorizedException("Invalid token format");
    }
    return { email: split[0], password: split[1] };
  }

  //token 검증
  verifyToken(token: string) {
    return this.jwtService.verify(token, { secret: JWT_SECRET });
  }

  //token 재발급
  //refresh -> refresh & access
  rotateToken(token: string, isRefreshToken: boolean) {
    const payload = this.verifyToken(token);
    if (payload.type !== "refresh") {
      throw new UnauthorizedException("refresh token required");
    }
    return this.signToken({ ...payload }, isRefreshToken);
  }
}
