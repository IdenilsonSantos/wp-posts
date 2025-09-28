import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from '../../orders/order.module';
import { AuthModule } from '../../auth/auth.module';
import { User } from '../../user/entities/user.entity';
import { Order, OrderStatus } from '../entities/order.entity';
import { ConfigModule } from '@nestjs/config';
import { StructuredLogger } from '../../logger/structured.logger';
import { Repository } from 'typeorm';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  let userRepo: Repository<User>;
  let orderRepo: Repository<Order>;
  let jwtToken: string;
  let userId: string;

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
          entities: [User, Order],
          synchronize: true,
        }),
        AuthModule,
        OrdersModule,
      ],
    })
      .overrideProvider(StructuredLogger)
      .useValue(mockLogger)
      .compile();

    app = moduleFixture.createNestApplication();
    userRepo = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    orderRepo = moduleFixture.get<Repository<Order>>(getRepositoryToken(Order));

    app.setGlobalPrefix('api');
    await app.init();

    const signupRes = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        username: 'Test User',
        email: 'test@example.com',
        password: '123456',
      });

    userId = signupRes.body.data.id;

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: '123456' });

    jwtToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await orderRepo.query(`DELETE FROM "order";`);
  });

  it('/api/orders (POST) - should create an order', async () => {
    const dto = { productSku: 'ABC123', qty: 2, status: OrderStatus.PENDING };

    const res = await request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(dto)
      .expect(HttpStatus.CREATED);

    expect(res.body.statusCode).toBe(HttpStatus.CREATED);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.userId).toBe(userId);
    expect(res.body.data.productSku).toBe(dto.productSku);
  });

  it('/api/orders/my (GET) - should return orders for logged-in user', async () => {
    const order = orderRepo.create({
      productSku: 'ABC123',
      qty: 2,
      status: OrderStatus.PENDING,
      userId,
    });
    await orderRepo.save(order);

    const res = await request(app.getHttpServer())
      .get('/api/orders/my')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(HttpStatus.OK);

    expect(res.body.statusCode).toBe(HttpStatus.OK);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0].userId).toBe(userId); // comparar com o ID real
  });

  it('/api/orders/my (GET) - should return empty array if no orders', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/orders/my')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(HttpStatus.OK);

    expect(res.body.statusCode).toBe(HttpStatus.OK);
    expect(res.body.data).toEqual([]);
  });
});
