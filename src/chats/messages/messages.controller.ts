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
    @Param("cid", ParseIntPipe) id: number, // chatId
    @Query() dto: paginateChatMessagesDto,
  ) {
    return this.chatMessageService.paginateMessages(dto, {
      where: {
        chat: {
          id,
        },
      },
      relations: {
        author: true,
        chat: true,
      },
    });
  }

  @Post()
  postMessage(@Body() dto: CreateChatsMessageDto, authorId: number) {
    this.chatMessageService.createMessage(dto, authorId);
  }
}
