import { IsOptional, IsString } from 'class-validator';

export class OrderResponseDto {
  @IsOptional()
  id?: string;

  @IsString()
  userId!: string;

  @IsString()
  productSku!: string;

  @IsString()
  qty!: number;

  @IsString()
  status!: string;

  @IsString()
  createdAt?: Date;
}
