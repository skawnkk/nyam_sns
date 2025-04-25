import { BadRequestException, Injectable } from "@nestjs/common";
import { UsersModel } from "./entities/users.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
  ) {}

  async postUsers(users: Pick<UsersModel, "nickname" | "email" | "password">) {
    //1) nickname 중복여부 체크 : exist()
    //2) email 중복여부 체크
    const nicknameExists = await this.usersRepository.exists({
      where: { nickname: users.nickname },
    });
    if (nicknameExists) {
      throw new BadRequestException("Nickname already exists");
    }

    const emailExists = await this.usersRepository.exists({
      where: { email: users.email },
    });
    if (emailExists) {
      throw new BadRequestException("email already exists");
    }

    const user = this.usersRepository.create({
      nickname: users.nickname,
      email: users.email,
      password: users.password,
    });
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

  getUserByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }
}
