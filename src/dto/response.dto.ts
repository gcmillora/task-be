import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class ResponseDto<T> {
  @IsArray()
  readonly body: T;

  @ApiProperty()
  statusCode!: number;

  constructor(statusCode: number, body: T) {
    this.statusCode = statusCode;
    this.body = body;
  }
}
