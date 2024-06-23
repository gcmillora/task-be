import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ResponseDto } from 'src/dto/response.dto';
import { CreateTaskDto, TaskDto, UpdateTaskDto } from 'src/dto/task.dto';
import { TaskStatus } from 'src/dto/task.status.enum';

@Injectable()
export class TaskService {
  public tasks: TaskDto[] = [];

  async createTask(data: CreateTaskDto): Promise<ResponseDto<TaskDto>> {
    try {
      //Check if the due date is in the past and validate the due date
      const dueDate = new Date(data.dueDate);

      if (dueDate < new Date() || isNaN(dueDate.getTime())) {
        throw new ConflictException(
          'Due date cannot be in the past or invalid date format',
        );
      }

      const task = {
        ...data,
        dueDate: dueDate,
        id: Math.random().toString(36).substring(7),
        status: TaskStatus.OPEN,
      };

      this.tasks.push(task);

      return new ResponseDto(201, task);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(
        'Something went wrong: ' + e.message,
      );
    }
  }

  async deleteTask(data: { id: string }): Promise<ResponseDto<TaskDto>> {
    const taskIndex = this.tasks.findIndex((task) => task.id === data.id);

    const task = this.tasks[taskIndex];

    if (taskIndex === -1) {
      throw new NotFoundException('Task not found');
    }

    this.tasks.splice(taskIndex, 1);

    return new ResponseDto(200, task);
  }

  async getTasks(): Promise<ResponseDto<TaskDto[]>> {
    // Sort the tasks by due date, first on the list is the task that is due soonest
    const sortedTasks = this.tasks.sort(
      (a, b) => a.dueDate.getTime() - b.dueDate.getTime(),
    );

    return new ResponseDto(200, sortedTasks);
  }

  async getTaskById(id: string): Promise<ResponseDto<TaskDto>> {
    const task = this.tasks.find((task) => task.id === id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return new ResponseDto(200, task);
  }

  async updateTask(data: UpdateTaskDto): Promise<ResponseDto<TaskDto>> {
    const task = this.tasks.find((task) => task.id === data.id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Update the task, only update the field that is not undefined
    const updatedTask: TaskDto = {
      ...task,
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : task.dueDate,
    };

    const taskIndex = this.tasks.findIndex((task) => task.id === data.id);
    this.tasks[taskIndex] = updatedTask;

    return new ResponseDto(200, updatedTask);
  }
}
