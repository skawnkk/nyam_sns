import { Injectable } from "@nestjs/common";
import { CreateChatDto } from "./dto/create-chat.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatsModel } from "./entities/chats.entity";
import { Repository } from "typeorm";
import { PaginateChatDto } from "./dto/paginate-chat.dto";
import { CommonService } from "src/common/common.service";

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatsModel)
    private readonly chatsRepository: Repository<ChatsModel>,
    private readonly commonService: CommonService,
  ) {}

  async createChat(dto: CreateChatDto) {
    const chat = await this.chatsRepository.save({
      users: dto.userIds.map((id) => ({ id })),
    });

    return this.chatsRepository.findOne({
      where: {
        id: chat.id,
      },
    });
  }

  paginateChats(dto: PaginateChatDto) {
    return this.commonService.paginate(
      dto,
      this.chatsRepository,
      {
        relations: {
          users: true,
        },
      },
      "chats",
    );
  }

  async checkIfChatExists(chatId: number) {
    const chat = await this.chatsRepository.findOne({
      where: { id: chatId },
    });

    return !!chat;
  }
}
