import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { CreateOrderDto } from '../dto/create.dto';
import { UpdateOrderDto } from '../dto/update.dto';
import { OrderResponseDto } from '../dto/order-response-dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const order = this.orderRepository.create({
      ...createOrderDto,
      status: createOrderDto.status || OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepository.save(order);
    return plainToInstance(OrderResponseDto, savedOrder);
  }

  async findAll(): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.find();
    return orders.map((order) => plainToInstance(OrderResponseDto, order));
  }

  async findOne(id: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return plainToInstance(OrderResponseDto, order);
  }

  async findByUser(id: string): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.find({
      where: { userId: id },
    });

    if (!orders.length) {
      return [];
    }

    return orders.map((order) => plainToInstance(OrderResponseDto, order));
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    Object.assign(order, updateOrderDto);
    const updatedOrder = await this.orderRepository.save(order);
    return plainToInstance(OrderResponseDto, updatedOrder);
  }

  // Remover pedido
  async remove(id: string): Promise<void> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    await this.orderRepository.remove(order);
  }
}
