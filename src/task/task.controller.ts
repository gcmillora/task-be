import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, TaskDto, UpdateTaskDto } from 'src/dto/task.dto';
import { ResponseDto } from 'src/dto/response.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // Implement the getTasks method
  @Get()
  async getTasks(): Promise<ResponseDto<TaskDto[]>> {
    return this.taskService.getTasks();
  }

  // Implement the createTask method
  @Post('create')
  @ApiBody({ type: CreateTaskDto })
  async createTask(@Body() data: CreateTaskDto): Promise<ResponseDto<TaskDto>> {
    return this.taskService.createTask(data);
  }

  // Implement the updateTask method
  @Put('update')
  async updateTask(@Body() data: UpdateTaskDto): Promise<ResponseDto<TaskDto>> {
    return this.taskService.updateTask(data);
  }

  // Implement the deleteTask method
  @Delete('delete')
  async deleteTask(
    @Body() data: { id: string },
  ): Promise<ResponseDto<TaskDto>> {
    return this.taskService.deleteTask(data);
  }
}
