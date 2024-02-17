import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from "@nestjs/common";

@Injectable()
export class MaxLengthPipe implements PipeTransform {
  constructor(
    private readonly length: number,
    private readonly subject: string,
  ) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (value.length > this.length) {
      throw new BadRequestException(`${this.subject}'s max length sholuld be ${this.length}.`);
    }
    return value.toString();
  }
}

@Injectable()
export class MinLengthPipe implements PipeTransform {
  constructor(
    private readonly length: number,
    private readonly subject: string,
  ) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (value.length < this.length) {
      throw new BadRequestException(`${this.subject}'s min length sholuld be ${this.length}.`);
    }
    return value.toString();
  }
}
