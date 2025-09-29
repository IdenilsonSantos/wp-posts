import { IsString, IsInt, IsEnum, Min, IsOptional } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class CreateOrderDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  productSku!: string;

  @IsInt()
  @Min(1)
  qty!: number;

  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
