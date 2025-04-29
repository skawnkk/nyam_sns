import { PickType } from "@nestjs/mapped-types";
import { IsEmail, IsOptional, IsString, Length } from "class-validator";
import { UsersModel } from "src/users/entities/users.entity";

export class UpdateUserProfileDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Length(8, 20)
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  image?: string;
}

export class UpdateUserDto extends PickType(UsersModel, [
  "email",
  "password",
]) {}
