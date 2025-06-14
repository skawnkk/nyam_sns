import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { HttpExceptionFilter } from "./common/exception-filter/http.exception-filter";
import { LogInterceptor } from "./common/interceptor/log.interceptor";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: `http://localhost:3001`, //true,
    credentials: true,
    exposedHeaders: ["Authorization"],
  });

  const config = new DocumentBuilder()
    .setTitle("Sabujak")
    .setDescription("사부작 API Description")
    .setVersion("1.0")
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, documentFactory);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, //entitiy의 지정 기본값이 반영되도록 함
      transformOptions: {
        enableImplicitConversion: true, //요청값을 자동으로 변환 @IsNumber => number로 인식,  @Type(() => Number)을 사용할 필요가 없다.
      },
      whitelist: true, //dto에 적힌 값만 입력할 수 있도록
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(new LogInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(3000);
}
bootstrap();
