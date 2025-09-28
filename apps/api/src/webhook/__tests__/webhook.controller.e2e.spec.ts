import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PostType, WpWebhookService } from '../services/webhook.service';
import { WpWebHookController } from '../controllers/webhook.controller';

describe('WpWebHookController (e2e)', () => {
  let app: INestApplication;
  let service: WpWebhookService;

  const mockService = {
    handlePost: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [WpWebHookController],
      providers: [{ provide: WpWebhookService, useValue: mockService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    service = moduleFixture.get<WpWebhookService>(WpWebhookService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a new post successfully', async () => {
    mockService.handlePost.mockResolvedValueOnce(undefined);

    const post: PostType = { title: 'My first post' };

    const res = await request(app.getHttpServer())
      .post('/wp/webhook')
      .send(post)
      .expect(200);

    expect(res.body).toEqual(
      expect.objectContaining({
        status: 'success',
        message: 'Post created successfully',
      }),
    );
  });

  it('should update an existing post successfully', async () => {
    mockService.handlePost.mockResolvedValueOnce(undefined);

    const post: PostType = { id: '123', title: 'Updated post' };

    const res = await request(app.getHttpServer())
      .post('/wp/webhook')
      .send(post)
      .expect(200);

    expect(res.body).toEqual(
      expect.objectContaining({
        status: 'success',
        message: 'Post updated successfully',
        postId: '123',
      }),
    );
  });

  it('should return 400 if title is missing', async () => {
    const post: PostType = { id: '123' } as any;

    const res = await request(app.getHttpServer())
      .post('/wp/webhook')
      .send(post)
      .expect(400);

    expect(res.body.message).toBe('The title field is required.');
  });

  it('should return 404 if service throws not found error', async () => {
    mockService.handlePost.mockRejectedValueOnce(new Error('not found'));

    const post: PostType = { id: '999', title: 'Not found' };

    const res = await request(app.getHttpServer())
      .post('/wp/webhook')
      .send(post)
      .expect(404);

    expect(res.body.message).toBe('Post not found for update.');
  });

  it('should return 500 if service throws unexpected error', async () => {
    mockService.handlePost.mockRejectedValueOnce(new Error('unexpected'));

    const post: PostType = { title: 'Fails here' };

    const res = await request(app.getHttpServer())
      .post('/wp/webhook')
      .send(post)
      .expect(500);

    expect(res.body.message).toBe('unexpected');
  });
});
