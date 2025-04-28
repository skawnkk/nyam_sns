import { ApiProperty } from "@nestjs/swagger";
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

// abstract > 직접 인스턴스화(생성)하지 않고, 공통 속성과 메서드를 자식 클래스들이 상속받게 하기 위해
// 상속받는 쪽에서 @Entity()를 붙여 사용하는 구조
export abstract class BaseModel {
  @ApiProperty({ description: "PK ID" })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: "생성일시" })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: "수정일시" })
  @UpdateDateColumn()
  updatedAt: Date;
}
