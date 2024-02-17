import { Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersDto } from "./dto/users.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }

  @Get(":id")
  getUser(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.getUser(id);
  }
}
