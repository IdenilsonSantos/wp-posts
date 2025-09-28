import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { User } from '../user/entities/user.entity';
import { OrdersController } from './controllers/order.controller';
import { OrdersService } from './services/order.service';
import { StructuredLogger } from '../logger/structured.logger';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User])],
  controllers: [OrdersController],
  providers: [OrdersService, StructuredLogger],
  exports: [OrdersService],
})
export class OrdersModule {}
