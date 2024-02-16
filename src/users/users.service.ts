import { Injectable } from "@nestjs/common";
import { UsersDto } from "./dto/users.dto";
import { UsersModel } from "./entities/users.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { log } from "console";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
  ) {}

  async postUsers(nickname: string, email: string, password: string) {
    const user = this.usersRepository.create({ nickname, email, password });
    const newUser = await this.usersRepository.save(user);
    return newUser;
  }

  getUsers() {
    return this.usersRepository.find({ relations: ["posts"] });
  }

  getUser(id: number) {
    return this.usersRepository.findOne({
      where: { id },
      relations: ["posts"],
    });
  }
}
