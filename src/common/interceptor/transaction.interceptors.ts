import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, catchError, tap } from "rxjs";
import { DataSource } from "typeorm";

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    // 트랜잭션과 관련된 모든 쿼리를 담당할 쿼리 러너 생성
    const qr = this.dataSource.createQueryRunner();
    // 쿼리러너 연결
    await qr.connect();
    // 쿼리러너에서 트랜잭션 시작 - 트랜직션 내에서 데이터베이스 액션을 실행할 수 있음
    await qr.startTransaction();

    const req = context.switchToHttp().getRequest();
    req.queryRunner = qr;

    return next.handle().pipe(
      catchError(async (err) => {
        console.error("TransactionInterceptor 에러", err); // ★ 진짜 에러 찍기

        await qr.rollbackTransaction(); // 에러가 나면 트랜잭션을 종료하고 원상태로 롤백 (db에 post가 생성되지 않는다.)
        await qr.release(); // 쿼리러너 연결 종료

        throw new InternalServerErrorException(
          `${req.path} 요청 중 에러가 발생했어요.`,
        );
      }),
      tap(async () => {
        await qr.commitTransaction(); // 변경 수용
        await qr.release(); // 쿼리러너 연결 종료
      }),
    );
  }
}
