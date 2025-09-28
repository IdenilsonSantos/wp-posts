import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { OrdersService } from '../services/order.service';
import { Order, OrderStatus } from '../entities/order.entity';
import { UpdateOrderDto } from '../dto/update.dto';
import { CreateOrderDto } from '../dto/create.dto';

describe('OrdersService', () => {
  let service: OrdersService;
  let repository: Repository<Order>;

  const mockOrder: Order = {
    id: '1',
    userId: 'user-1',
    productSku: 'sku-123',
    qty: 2,
    status: OrderStatus.PENDING,
    createdAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn().mockReturnValue(mockOrder),
    save: jest.fn().mockResolvedValue(mockOrder),
    find: jest.fn().mockResolvedValue([mockOrder]),
    findOne: jest.fn().mockResolvedValue(mockOrder),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    repository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const dto: CreateOrderDto = {
        productSku: 'sku-123',
        qty: 2,
      };

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        status: OrderStatus.PENDING,
      });
      expect(repository.save).toHaveBeenCalledWith(mockOrder);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('findAll', () => {
    it('should return an array of orders', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockOrder]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return one order', async () => {
      const result = await service.findOne('1');
      expect(result).toEqual(mockOrder);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException if order does not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.findOne('1000')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an order', async () => {
      const dto: UpdateOrderDto = { status: OrderStatus.PAID };

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockOrder);

      const result = await service.update('1', dto);

      expect(result).toEqual(mockOrder);
      expect(repository.save).toHaveBeenCalledWith({
        ...mockOrder,
        ...dto,
      });
    });
  });

  describe('remove', () => {
    it('should remove an order', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockOrder);

      await service.remove('1');

      expect(repository.remove).toHaveBeenCalledWith(mockOrder);
    });
  });
});
