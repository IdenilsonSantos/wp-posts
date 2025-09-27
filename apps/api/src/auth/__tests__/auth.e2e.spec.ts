import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth.module';
import { User } from '../../user/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { StructuredLogger } from '../../logger/structured.logger';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test.local' }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User],
          synchronize: true,
        }),
        AuthModule,
      ],
    })
      .overrideProvider(StructuredLogger)
      .useValue(mockLogger)
      .compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const repo = app.get('UserRepository');
    await repo.query(`DELETE FROM user;`);
  });

  it('/api/auth/signup (POST) - should create a new user', async () => {
    const dto = {
      username: 'Test User',
      email: 'test@example.com',
      password: '123456',
    };
    const res = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send(dto)
      .expect(HttpStatus.CREATED);

    expect(res.body.statusCode).toBe(HttpStatus.CREATED);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).not.toHaveProperty('password');
  });

  it('/api/auth/signup (POST) - should fail on duplicate email', async () => {
    const dto = {
      username: 'Test User',
      email: 'test@example.com',
      password: '123456',
    };
    await request(app.getHttpServer()).post('/api/auth/signup').send(dto);

    const res = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send(dto)
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
  });

  it('/api/auth/login (POST) - should return JWT', async () => {
    const signupDto = {
      username: 'Test User',
      email: 'test@example.com',
      password: '123456',
    };
    await request(app.getHttpServer()).post('/api/auth/signup').send(signupDto);

    const loginDto = { email: 'test@example.com', password: '123456' };
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send(loginDto)
      .expect(HttpStatus.OK);

    expect(res.body.statusCode).toBe(HttpStatus.OK);
    expect(res.body.message).toBe('Login successfull');
  });

  it('/api/auth/login (POST) - should fail with wrong password', async () => {
    const signupDto = {
      username: 'Test User',
      email: 'test@example.com',
      password: '123456',
    };
    await request(app.getHttpServer()).post('/api/auth/signup').send(signupDto);

    const loginDto = { email: 'test@example.com', password: 'wrongpassword' };
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send(loginDto)
      .expect(HttpStatus.UNAUTHORIZED);

    expect(res.body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('/api/auth/login (POST) - should fail with non-existent email', async () => {
    const loginDto = { email: 'nonexistent@example.com', password: '123456' };
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send(loginDto)
      .expect(HttpStatus.NOT_FOUND);

    expect(res.body.statusCode).toBe(HttpStatus.NOT_FOUND);
  });
});
