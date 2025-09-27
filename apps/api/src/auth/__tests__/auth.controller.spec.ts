import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { UserService } from '../../user/services/user.service';
import { LoginDto } from '../dto/login.dto';
import { StructuredLogger } from '../../logger/structured.logger';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let logger: StructuredLogger;

  const mockAuth = {
    id: 'uuid-1234',
    username: 'UserTest Doe',
    email: 'user@user.com',
    password: 'hashedpassword',
  };

  const mockService = {
    login: jest.fn(),
    create: jest.fn(),
  };

  const mockUsersService = {
    findByEmail: jest.fn().mockResolvedValue({
      id: '1',
      email: 'user@user.com',
      password: 'hashed',
    }),
  };

  const mockResponse = (): Response => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  const mockRequest = (): Request => {
    return { correlationId: 'test-correlation-id' } as unknown as Request;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockService },
        { provide: UserService, useValue: mockUsersService },
        {
          provide: StructuredLogger,
          useValue: { log: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    logger = module.get<StructuredLogger>(StructuredLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register an User and return response', async () => {
    mockService.create.mockResolvedValue(mockAuth);
    const res = mockResponse();
    const req = mockRequest();
    const dto = {
      username: 'UserTest Doe',
      email: 'user@user.com',
      password: '123',
    };

    await controller.create(dto, req, res);

    expect(mockService.create).toHaveBeenCalledWith(dto);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 201,
        message: 'User created successfully',
        data: mockAuth,
      }),
    );
  });

  it('should call login and return JWT', async () => {
    const dto: LoginDto = { email: 'user@test.com', password: '123456' };
    const result = { access_token: 'jwt-token' };
    const req = mockRequest();
    const res = mockResponse();

    mockService.login.mockResolvedValue(result);

    await controller.login(dto, req, res);

    expect(mockService.login).toHaveBeenCalledWith(dto);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.OK,
      message: 'Login successfull',
      access_token: 'jwt-token',
    });
  });
});
