import { OmitType } from '@nestjs/swagger';
import { TaskStatus } from './task.status.enum';
import { IsDate, IsEnum, IsNotEmpty, IsString, MinDate } from 'class-validator';
import { Type } from 'class-transformer';

export class TaskDto {
  id?: string;

  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  @MinDate(new Date())
  dueDate!: Date;
}

export class CreateTaskDto extends OmitType(TaskDto, [
  'id',
  'status',
] as const) {}

export class UpdateTaskDto extends OmitType(TaskDto, [] as const) {}
