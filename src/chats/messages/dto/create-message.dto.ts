import { PickType } from "@nestjs/mapped-types";
import { MessagesModel } from "../entities/messasges.entity";
import { IsNumber } from "class-validator";

export class CreateChatsMessageDto extends PickType(MessagesModel, [
  "message",
]) {
  @IsNumber()
  chatId: number;
}
