import { OmitType } from '@nestjs/swagger';
import { TaskStatus } from './task.status.enum';
import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class TaskDto {
  id?: string;

  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsDateString()
  @IsNotEmpty()
  dueDate!: Date;
}

export class CreateTaskDto extends OmitType(TaskDto, [
  'id',
  'status',
] as const) {}

export class UpdateTaskDto extends OmitType(TaskDto, [] as const) {}
