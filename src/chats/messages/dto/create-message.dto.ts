import { PickType } from "@nestjs/mapped-types";
import { MessagesModel } from "../entities/messasges.entity";
import { IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateChatsMessageDto extends PickType(MessagesModel, [
  "message",
]) {
  @ApiProperty({ description: "채팅방 ID" })
  @IsNumber()
  chatId: number;

  @ApiProperty({ description: "작성자 ID" })
  @IsNumber()
  authorId: number;
}
