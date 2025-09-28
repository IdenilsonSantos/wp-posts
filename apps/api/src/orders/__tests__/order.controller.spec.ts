import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../controllers/order.controller';
import { OrdersService } from '../services/order.service';
import { UserService } from '../../user/services/user.service';
import { CreateOrderDto } from '../dto/create.dto';
import { UpdateOrderDto } from '../dto/update.dto';
import { OrderResponseDto } from '../dto/order-response-dto';
import { OrderStatus } from '../entities/order.entity';
import { User } from '../../user/entities/user.entity';
import { StructuredLogger } from '../../logger/structured.logger';
import { HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;
  let logger: StructuredLogger;

  const mockOrdersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn().mockImplementation(({ where }) => {
      if (where.id === '1') {
        return Promise.resolve({
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
        });
      }
      return null;
    }),
  } as unknown as jest.Mocked<Repository<User>>;

  const mockUsersService = {
    findByEmail: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
  };

  const mockRequest: any = {
    correlationId: 'test-correlation-id',
    userId: '1',
  };

  const mockResponse: any = {
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: UserService, useValue: mockUsersService },
        { provide: StructuredLogger, useValue: mockLogger },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
    logger = module.get<StructuredLogger>(StructuredLogger);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create an order', async () => {
    const dto: CreateOrderDto = {
      productSku: 'ABC123',
      qty: 2,
      status: OrderStatus.PENDING,
    };

    const result: OrderResponseDto = {
      id: '123',
      userId: '1',
      productSku: 'ABC123',
      qty: 2,
      status: OrderStatus.PENDING,
      createdAt: new Date(),
    };

    (mockUserRepository.findOne as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'test@test.com',
    });

    (mockOrdersService.create as jest.Mock).mockResolvedValue(result);

    await controller.create(dto, mockRequest, mockResponse);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CREATED,
      message: 'Order created successfully',
      data: result,
    });
  });

  it('should return all orders', async () => {
    const result: OrderResponseDto[] = [
      {
        id: '123',
        userId: '1',
        productSku: 'ABC123',
        qty: 2,
        status: OrderStatus.PENDING,
        createdAt: new Date(),
      },
    ];

    jest.spyOn(service, 'findAll').mockResolvedValue(result);

    await controller.findAll(mockRequest, mockResponse);

    expect(service.findAll).toHaveBeenCalled();
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.OK,
      message: 'Orders retrieved successfully',
      data: result,
    });
  });

  it('should return one order by id', async () => {
    const result: OrderResponseDto = {
      id: '123',
      userId: '1',
      productSku: 'ABC123',
      qty: 2,
      status: OrderStatus.PENDING,
      createdAt: new Date(),
    };

    jest.spyOn(service, 'findOne').mockResolvedValue(result);

    await controller.findOne('123', mockRequest, mockResponse);

    expect(service.findOne).toHaveBeenCalledWith('123');
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.OK,
      message: 'Order retrieved successfully',
      data: result,
    });
  });

  it('should update an order', async () => {
    const dto: UpdateOrderDto = { qty: 3 };

    const result: OrderResponseDto = {
      id: '123',
      userId: '1',
      productSku: 'ABC123',
      qty: 3,
      status: OrderStatus.PENDING,
      createdAt: new Date(),
    };

    jest.spyOn(service, 'update').mockResolvedValue(result);

    await controller.update('123', dto, mockRequest, mockResponse);

    expect(service.update).toHaveBeenCalledWith('123', dto);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.OK,
      message: 'Order updated successfully',
      data: result,
    });
  });

  it('should remove an order', async () => {
    jest.spyOn(service, 'remove').mockResolvedValue(undefined);

    await controller.remove('123', mockRequest, mockResponse);

    expect(service.remove).toHaveBeenCalledWith('123');
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NO_CONTENT,
      message: 'Order deleted successfully',
    });
    expect(logger.log).toHaveBeenCalledWith(
      'Order deleted successfully',
      'OrdersController',
      expect.objectContaining({
        correlationId: 'test-correlation-id',
        orderId: '123',
      }),
    );
  });
});
