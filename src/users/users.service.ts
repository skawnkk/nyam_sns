import { BadRequestException, Injectable } from "@nestjs/common";
import { UsersModel } from "./entities/users.entity";
import { Not, QueryRunner, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { UpdateUserProfileDto } from "./dto/update-user.dto";
import * as bcrypt from "bcrypt";
import { ENV_HASH_ROUNDS_KEY } from "src/common/const/env-keys.const";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
    private readonly configService: ConfigService,
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
    return this.usersRepository.find({ relations: ["posts", "image"] });
  }

  getUser(id: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    return repository.findOne({
      where: { id },
      relations: ["posts", "image"],
    });
  }

  getUserByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<UsersModel>(UsersModel)
      : this.usersRepository;
  }

  async updateUser(dto: UpdateUserProfileDto, id: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    const userExists = await repository.exists({
      where: { id },
    });
    if (!userExists) {
      throw new BadRequestException("해당 user는 존재하지 않습니다.");
    }

    if (dto.email) {
      const emailExists = await repository.exists({
        where: { email: dto.email, id: Not(id) }, // 다른 계정 중에 동일한 이메일이 존재하는지
      });
      if (emailExists) {
        throw new BadRequestException("이미 등록된 이메일 주소입니다.");
      }
    }

    let hashedPassword: string | undefined = undefined;
    if (dto.password) {
      hashedPassword = await bcrypt.hash(
        dto.password,
        Number(this.configService.get(ENV_HASH_ROUNDS_KEY)),
      );
    }

    await repository.update(
      { id },
      {
        ...(dto.email && { email: dto.email }),
        ...(hashedPassword && { password: hashedPassword }),
      },
    );

    // 업데이트 후 다시 조회해서 리턴
    const updatedUser = await repository.findOneBy({ id });

    return updatedUser;
  }
}
