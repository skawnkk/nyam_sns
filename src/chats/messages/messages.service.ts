import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MessagesModel } from "./entities/messasges.entity";
import { FindManyOptions, Repository } from "typeorm";
import { CommonService } from "src/common/common.service";
import { paginateChatMessagesDto } from "./dto/paginate-messages.dto";
import { CreateChatsMessageDto } from "./dto/create-message.dto";

@Injectable()
export class ChatsMessagesService {
  constructor(
    @InjectRepository(MessagesModel)
    private readonly messagesRepository: Repository<MessagesModel>,
    private readonly commonService: CommonService,
  ) {}

  async createMessage(dto: CreateChatsMessageDto) {
    const message = await this.messagesRepository.save({
      chat: { id: dto.chatId }, // priamry key로 연결된다
      author: { id: dto.authorId },
      message: dto.message,
    });

    return this.messagesRepository.findOne({
      where: { id: message.id },
      relations: {
        chat: true,
      },
    });
  }

  async paginateMessages(
    dto: paginateChatMessagesDto,
    overrideFindOptions: FindManyOptions<MessagesModel>,
  ) {
    return this.commonService.paginate(
      dto,
      this.messagesRepository,
      overrideFindOptions,
      "messages",
    );
  }
}
