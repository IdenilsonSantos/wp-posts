import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Username must be a string' })
  username!: string;

  @IsEmail({}, { message: 'Email must be valid' })
  email!: string;

  @IsString({ message: 'Password must be a string' })
  password!: string;
}
