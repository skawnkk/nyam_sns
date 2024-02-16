import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersDto } from "./dto/users.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  postUsers(@Body("nickname") nickname: string, @Body("email") email: string, @Body("password") password: string) {
    return this.usersService.postUsers(nickname, email, password);
  }

  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }

  @Get(":id")
  getUser(@Param("id") id: string) {
    return this.usersService.getUser(+id);
  }
}
