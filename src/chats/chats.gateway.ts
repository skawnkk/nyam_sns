import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { CreateChatDto } from "./dto/create-chat.dto";
import { ChatsService } from "./chats.service";
import { ChatsMessagesService } from "./messages/messages.service";

@WebSocketGateway({
  namespace: "chats", //ws://localhost:3000/chats
})
export class ChatsGateway implements OnGatewayConnection {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messageService: ChatsMessagesService,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    console.log(`on connect called: ${socket.id}`);
  }

  //1.
  @SubscribeMessage("create_chat")
  async createChat(
    @MessageBody() dto: CreateChatDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const chat = await this.chatsService.createChat(dto);
    this.server.to(socket.id).emit("chat_created", chat);
  }

  //2.
  @SubscribeMessage("enter_chat")
  // 여러개의 방 chat id를 리스트로 받음
  async enterChat(
    @MessageBody() chatIds: { chatIds: number[] },
    @ConnectedSocket() socket: Socket,
  ) {
    for (const chatId of chatIds.chatIds) {
      const exists = await this.chatsService.checkIfChatExists(chatId);

      if (!exists) {
        throw new WsException({
          code: 100,
          message: `존재하지 않는 chat 입니다. chatId: ${chatId}`,
        });
      }
    } // TODO: 존재하지 않는 챗일 경우 나머지는 에러 생성하고 방에 들어가지 않아도 괜찮은지?

    socket.join(chatIds.chatIds.map((id) => id.toString()));
  }

  // 3. socket.on('send_message', (message)=>{..})
  @SubscribeMessage("send_message")
  async sendMessage(
    @MessageBody() data: { message: string; chatId: number; authorId: number },
    // @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    // 존재하는 방인지 우선 확인
    const chatExists = await this.chatsService.checkIfChatExists(data.chatId);

    if (!chatExists) {
      throw new WsException({
        code: 100,
        message: `존재하지 않는 chat 입니다. chatId: ${data.chatId}`,
      });
    }

    // 메세지 생성
    const message = await this.messageService.createMessage({
      ...data,
      // authorId: socket.user?.id,
    });

    // this.server.emit("receive_message", "hello from server!!"); // receive_message 이벤트를 모두 구독하는 client에게 보내지는 메세지
    this.server
      .in(message.chat.id.toString()) // receive_message를 구독하는 특정 채팅방에만 보내는 메세지
      .emit("receive_message", message.message);
  }
}
