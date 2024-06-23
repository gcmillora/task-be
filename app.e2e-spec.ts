import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './src/app.module';
import { TaskService } from 'src/task/task.service';
import { ResponseDto } from 'src/dto/response.dto';
import { TaskStatus } from 'src/dto/task.status.enum';
import { CreateTaskDto, UpdateTaskDto } from 'src/dto/task.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let service: TaskService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = moduleFixture.get<TaskService>(TaskService);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET tasks (empty state)', () => {
    it('should return OK', async () => {
      jest
        .spyOn(service, 'getTasks')
        .mockResolvedValue(new ResponseDto(200, []));

      await request(app.getHttpServer()).get('/task').expect({
        statusCode: 200,
        body: [],
      });
    });
  });

  describe('POST task', () => {
    it('should return CREATED', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test title',
        description: 'Test description',
        dueDate: new Date(),
      };

      const createTask = jest.spyOn(service, 'createTask');

      const response = await request(app.getHttpServer())
        .post('/task/create')
        .send(createTaskDto)
        .expect(201);

      expect(createTask).toHaveBeenCalledTimes(1);
      expect(response.body.body.id).toBeDefined();
      expect(response.body.body.title).toEqual(createTaskDto.title);
    });
  });

  describe('PUT task', () => {
    it('should return OK', async () => {
      const updateTask = jest.spyOn(service, 'updateTask');

      const createTask = await service.createTask({
        title: 'Test title',
        description: 'Test description',
        dueDate: new Date(),
      });

      const updateTaskDto: UpdateTaskDto = {
        id: createTask.body.id,
        title: 'Test title updated',
        description: 'Test description updated',
        dueDate: new Date(),
        status: TaskStatus.DONE,
      };

      const response = await request(app.getHttpServer())
        .put('/task/update')
        .send(updateTaskDto)
        .expect(200);

      expect(updateTask).toHaveBeenCalledTimes(1);
      expect(response.body.body.id).toEqual(updateTaskDto.id);
      expect(response.body.body.title).toEqual(updateTaskDto.title);
    });
  });

  describe('DELETE task', () => {
    it('should return OK', async () => {
      const deleteTask = jest.spyOn(service, 'deleteTask');

      const createTask = await service.createTask({
        title: 'Test title',
        description: 'Test description',
        dueDate: new Date(),
      });

      const response = await request(app.getHttpServer())
        .delete('/task/delete')
        .send({ id: createTask.body.id })
        .expect(200);

      expect(deleteTask).toHaveBeenCalledTimes(1);
      expect(response.body.body.id).toEqual(createTask.body.id);
    });
  });

  describe('GET tasks (with data, sorted by DUE DATE)', () => {
    it('should return OK', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test title',
        description: 'Test description',
        dueDate: new Date('2024-12-30'),
      };

      const createTaskDto2: CreateTaskDto = {
        title: 'Test title 2',
        description: 'Test description 2',
        dueDate: new Date('2024-10-31'),
      };

      const results = [];

      await service.createTask(createTaskDto).then((result) => {
        results.push(result);
      });

      await service.createTask(createTaskDto2).then((result) => {
        results.push(result);
      });

      results.sort(
        (a, b) => a.body.dueDate.getTime() - b.body.dueDate.getTime(),
      );

      const getTasks = jest.spyOn(service, 'getTasks').mockResolvedValue(
        new ResponseDto(
          200,
          results.map((result) => result.body),
        ),
      );

      const response = await request(app.getHttpServer())
        .get('/task')
        .expect(200);

      expect(getTasks).toHaveBeenCalledTimes(1);
      expect(response.body.body.length).toBe(2);
      // Compare the due dates if they are sorted correctly, the first one should be the one with the nearest due date
      expect(
        new Date(response.body.body[0].dueDate).getTime(),
      ).toBeLessThanOrEqual(new Date(response.body.body[1].dueDate).getTime());
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
