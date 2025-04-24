import { Module } from "@nestjs/common";
import { ChatsService } from "./chats.service";
import { ChatsController } from "./chats.controller";
import { ChatsGateway } from "./chats.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatsModel } from "./entities/chats.entity";
import { CommonModule } from "src/common/common.module";
import { MessagesModel } from "./messages/entities/messasges.entity";
import { ChatsMessagesService } from "./messages/messages.service";
import { ChatMessagesController } from "./messages/messages.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatsModel, MessagesModel]),
    CommonModule,
  ],
  controllers: [ChatsController, ChatMessagesController],
  providers: [ChatsService, ChatsGateway, ChatsMessagesService],
})
export class ChatsModule {}
