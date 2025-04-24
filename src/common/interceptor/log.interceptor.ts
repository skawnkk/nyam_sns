import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";

// controller UseInterceptors 인자로 반영해주어 사용
@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    /**
     * 요청이 들어올 때 타임스탬프를 찍음
     * [Req] {path} {시간}
     * 요청이 끝날 때 타임스탬프를 찍는다.
     * [Res] {path} {시간} {소요시간}
     */
    const beforeRequestTime = new Date();

    const req = context.switchToHttp().getRequest();
    const path = req.originalUrl;
    console.log(`[REQ] ${path} ${beforeRequestTime.toLocaleString("kr")}`);

    // -> handle() :라우트의 로직이 모두 실행되고 observable로 응답이 반환된다.
    return next.handle().pipe(
      tap(() => {
        const afterRequestTime = new Date();

        console.log(
          `[RES] ${path} ${afterRequestTime.toLocaleString("kr")} ${afterRequestTime.getMilliseconds() - beforeRequestTime.getMilliseconds()}`,
        );
      }),
      // map((observable) => {
      //   return { response: observable, message: "응답 변경됨" };
      // }), // 응답을 변형해주는 map
      // tap((observable) => {
      //   console.log(observable);
      // }), // 응답값 감시할 수 있는 tap
    );
  }
}
