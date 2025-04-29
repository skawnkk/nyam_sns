import { TypeOrmModule } from "@nestjs/typeorm";
import { ImageModel } from "src/common/entities/image.entity";
import { ImagesService } from "./images.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    TypeOrmModule.forFeature([ImageModel]), // ✅ 추가
  ],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
