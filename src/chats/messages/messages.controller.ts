import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from "@nestjs/common";
import { paginateChatMessagesDto } from "./dto/paginate-messages.dto";
import { ChatsMessagesService } from "./messages.service";
import { CreateChatsMessageDto } from "./dto/create-message.dto";

@Controller("chats/:cid/messages")
export class ChatMessagesController {
  constructor(private readonly chatMessageService: ChatsMessagesService) {}

  @Get()
  paginateMessages(
    @Param("cid", ParseIntPipe) cid: number, // chatId
    @Query() dto: paginateChatMessagesDto,
  ) {
    return this.chatMessageService.paginateMessages(dto, {
      where: {
        chat: {
          id: cid,
        },
      },
      relations: {
        author: true,
        chat: true,
      },
    });
  }

  @Post()
  postMessage(
    @Param("cid", ParseIntPipe) cid: number, // chatId
    @Body() dto: CreateChatsMessageDto,
  ) {
    this.chatMessageService.createMessage(dto, dto.authorId);
  }
}
