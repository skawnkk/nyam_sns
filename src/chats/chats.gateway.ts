import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { CreateChatDto } from "./dto/create-chat.dto";
import { ChatsService } from "./chats.service";
import { ChatsMessagesService } from "./messages/messages.service";
import {
  UnauthorizedException,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { SocketCatchHttpExceptionFilter } from "src/common/exception-filter/socket-catch-http.exception-filter";
import { UsersModel } from "src/users/entities/users.entity";
import { CreateChatsMessageDto } from "./messages/dto/create-message.dto";
import { AuthService } from "src/auth/auth.service";
import { UsersService } from "src/users/users.service";

@WebSocketGateway({
  namespace: "chats", //ws://localhost:3000/chats
})
export class ChatsGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  constructor(
    private readonly chatsService: ChatsService,
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly messageService: ChatsMessagesService,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit() {
    //@Param - server: Server 상위에 선언된 server와 동일객체
    console.log(`init gateway`);
  }
  // 0. Lifecycle Hook: 소켓 연결 시 최초 1회 실행되는 hook
  // socket 객체에 저장된 값은 연결이 끊기기 전까지 계속 유지됨
  //
  // ⚠️ 주의사항
  // - 소켓은 연결 이후 토큰이 갱신되더라도, 기존에 받아온 토큰 값을 계속 유지함
  //   (예: access token 재발급되어도 반영 안 됨)
  // - 따라서 모든 이벤트마다 토큰을 재검증할 필요는 없으며,
  //   최초 연결 시점에만 인증 처리를 하고 socket.user 등에 사용자 정보를 저장하면 효율적

  async handleConnection(socket: Socket & { user: UsersModel }) {
    const header = socket.handshake.headers;
    const rawToken = header["authorization"];

    if (!rawToken) {
      socket.disconnect();
      throw new UnauthorizedException("Token is not found");
    }
    try {
      const token = this.authService.extractTokenFromHeader(rawToken, true);
      const payload = await this.authService.verifyToken(token);
      const user = await this.userService.getUserByEmail(payload.email);

      socket.user = user;

      return true;
    } catch (e) {
      socket.disconnect();
      throw new WsException("토큰이 유효하지 않습니다.");
    }
  }

  handleDisconnect(socket: Socket) {
    console.log(`disconnected ${socket.id}`);
  }

  //1.
  @UsePipes(
    new ValidationPipe({
      transform: true, //entitiy의 지정 기본값이 반영되도록 함
      transformOptions: {
        enableImplicitConversion: true, //요청값을 자동으로 변환 @IsNumber => number로 인식,  @Type(() => Number)을 사용할 필요가 없다.
      },
      whitelist: true, //dto에 적힌 값만 입력할 수 있도록
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage("create_chat")
  async createChat(
    @MessageBody() dto: CreateChatDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    const chat = await this.chatsService.createChat(dto);
    this.server.to(socket.id).emit("chat_created", chat);
  }

  //2.
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
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
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage("send_message")
  async sendMessage(
    @MessageBody() data: CreateChatsMessageDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
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
    const message = await this.messageService.createMessage(
      data,
      socket.user.id,
    );

    // this.server.emit("receive_message", "hello from server!!"); // receive_message 이벤트를 모두 구독하는 client에게 보내지는 메세지
    this.server
      .in(message.chat.id.toString()) // receive_message를 구독하는 특정 채팅방에만 보내는 메세지
      .emit("receive_message", message.message);
  }
}
