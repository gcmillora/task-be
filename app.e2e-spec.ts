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
        dueDate: new Date('2024-12-30'),
      };

      await request(app.getHttpServer())
        .post('/task/create')
        .send(createTaskDto)
        .expect(201)
        .expect(({ body }) => {
          expect(body.body.title).toEqual(createTaskDto.title);
          expect(body.body.description).toEqual(createTaskDto.description);
          expect(body.body.dueDate).toEqual(
            createTaskDto.dueDate.toISOString(),
          );
          expect(body.body.status).toEqual(TaskStatus.OPEN);
        });
    });
  });

  describe('PUT task', () => {
    it('should return OK', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test title',
        description: 'Test description',
        dueDate: new Date('2024-12-30'),
      };

      const createdTask = await request(app.getHttpServer())
        .post('/task/create')
        .send(createTaskDto)
        .expect(201);

      const updateTaskDto: UpdateTaskDto = {
        id: createdTask.body.body.id,
        title: 'Test title updated',
        description: 'Test description updated',
        dueDate: new Date('2024-12-25'),
        status: TaskStatus.DONE,
      };

      await request(app.getHttpServer())
        .put('/task/update')
        .send(updateTaskDto)
        .expect(200)
        .expect(({ body }) => {
          expect(body.body.id).toEqual(updateTaskDto.id);
          expect(body.body.title).toEqual(updateTaskDto.title);
          expect(body.body.description).toEqual(updateTaskDto.description);
          expect(body.body.dueDate).toEqual(
            updateTaskDto.dueDate.toISOString(),
          );
          expect(body.body.status).toEqual(updateTaskDto.status);
        });
    });
  });

  describe('DELETE task', () => {
    it('should return OK', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test title',
        description: 'Test description',
        dueDate: new Date('2024-12-30'),
      };

      const createdTask = await request(app.getHttpServer())
        .post('/task/create')
        .send(createTaskDto)
        .expect(201);

      await request(app.getHttpServer())
        .delete('/task/delete')
        .send({ id: createdTask.body.body.id })
        .expect(200)
        .expect(({ body }) => {
          expect(body.body.id).toEqual(createdTask.body.body.id);
          expect(body.body.title).toEqual(createdTask.body.body.title);
          expect(body.body.description).toEqual(
            createdTask.body.body.description,
          );
          expect(body.body.dueDate).toEqual(createdTask.body.body.dueDate);
          expect(body.body.status).toEqual(createdTask.body.body.status);
        });
    });
  });

  describe('GET tasks (with data, sorted by DUE DATE)', () => {
    it('should return OK', async () => {
      const tasksToCreate: CreateTaskDto[] = [
        {
          title: 'Test title',
          description: 'Test description',
          dueDate: new Date('2024-12-30'),
        },
        {
          title: 'Test title 2',
          description: 'Test description 2',
          dueDate: new Date('2024-10-31'),
        },
        {
          title: 'Test title 3',
          description: 'Test description 3',
          dueDate: new Date('2024-11-30'),
        },
      ];

      const results = [];

      for (const task of tasksToCreate) {
        const createdTask = await service.createTask(task);

        results.push(createdTask);
      }

      results.sort(
        (a, b) => a.body.dueDate.getTime() - b.body.dueDate.getTime(),
      );

      console.log('results', results);

      await request(app.getHttpServer())
        .get('/task')
        .expect(200)
        .expect(({ body }) => {
          console.log(body.body);
          expect(body.body.length).toBe(3);
          expect(body.body[0].title).toEqual(results[0].body.title);
          expect(body.body[1].title).toEqual(results[1].body.title);
          expect(body.body[2].title).toEqual(results[2].body.title);
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
