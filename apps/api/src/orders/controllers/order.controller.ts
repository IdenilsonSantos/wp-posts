import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create.dto';
import { UpdateOrderDto } from '../dto/update.dto';
import { JwtAuthGuard } from '../../auth/guard/jwt.guard';
import { StructuredLogger } from '../../logger/structured.logger';
import { User } from '../../user/entities/user.entity';
import type { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly logger: StructuredLogger,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Post()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const correlationId = req.correlationId;
    const userId = req?.user?.userId;

    try {
      this.logger.log('Create order attempt', 'OrdersController', {
        correlationId,
      });

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
        });
      }

      const order = await this.ordersService.create({
        ...createOrderDto,
        userId,
      });

      this.logger.log('Order created successfully', 'OrdersController', {
        correlationId,
        orderId: order.id,
      });

      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: 'Order created successfully',
        data: order,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error creating order';
      const trace = error instanceof Error ? error.stack : undefined;

      this.logger.error(errorMessage, trace, 'OrdersController', {
        correlationId,
      });

      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: errorMessage,
      });
    }
  }

  @Get()
  async findAll(@Req() req: Request | any, @Res() res: Response) {
    const correlationId = req.correlationId;

    try {
      this.logger.log('Find all orders attempt', 'OrdersController', {
        correlationId,
      });

      const orders = await this.ordersService.findAll();

      this.logger.log('Orders retrieved successfully', 'OrdersController', {
        correlationId,
        count: orders.length,
      });

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Orders retrieved successfully',
        data: orders,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error fetching orders';
      const trace = error instanceof Error ? error.stack : undefined;

      this.logger.error(errorMessage, trace, 'OrdersController', {
        correlationId,
      });

      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: errorMessage,
      });
    }
  }

  @Get('/my')
  async findByUser(@Req() req: Request | any, @Res() res: Response) {
    const correlationId = req.correlationId;
    const userId = req?.user?.userId;

    try {
      this.logger.log('Find order attempt', 'OrdersController', {
        correlationId,
      });

      const orders = await this.ordersService.findByUser(userId);

      this.logger.log('Order retrieved successfully', 'OrdersController', {
        correlationId,
        orderId: orders.map((order) => order.id),
      });

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Order retrieved successfully',
        data: orders,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error fetching order';
      const trace = error instanceof Error ? error.stack : undefined;

      this.logger.error(errorMessage, trace, 'OrdersController', {
        correlationId,
      });

      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: errorMessage,
      });
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const correlationId = req.correlationId;

    try {
      this.logger.log('Find order attempt', 'OrdersController', {
        correlationId,
        orderId: id,
      });

      const order = await this.ordersService.findOne(id);

      this.logger.log('Order retrieved successfully', 'OrdersController', {
        correlationId,
        orderId: order?.id,
      });

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Order retrieved successfully',
        data: order,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error fetching order';
      const trace = error instanceof Error ? error.stack : undefined;

      this.logger.error(errorMessage, trace, 'OrdersController', {
        correlationId,
        orderId: id,
      });

      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: errorMessage,
      });
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const correlationId = req.correlationId;

    try {
      this.logger.log('Update order attempt', 'OrdersController', {
        correlationId,
        orderId: id,
      });

      const order = await this.ordersService.update(id, updateOrderDto);

      this.logger.log('Order updated successfully', 'OrdersController', {
        correlationId,
        orderId: order.id,
      });

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Order updated successfully',
        data: order,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error updating order';
      const trace = error instanceof Error ? error.stack : undefined;

      this.logger.error(errorMessage, trace, 'OrdersController', {
        correlationId,
        orderId: id,
      });

      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: errorMessage,
      });
    }
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const correlationId = req.correlationId;

    try {
      this.logger.log('Delete order attempt', 'OrdersController', {
        correlationId,
        orderId: id,
      });

      await this.ordersService.remove(id);

      this.logger.log('Order deleted successfully', 'OrdersController', {
        correlationId,
        orderId: id,
      });

      return res.status(HttpStatus.NO_CONTENT).json({
        statusCode: HttpStatus.NO_CONTENT,
        message: 'Order deleted successfully',
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error deleting order';
      const trace = error instanceof Error ? error.stack : undefined;

      this.logger.error(errorMessage, trace, 'OrdersController', {
        correlationId,
        orderId: id,
      });

      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: errorMessage,
      });
    }
  }
}
