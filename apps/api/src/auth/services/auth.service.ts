import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../user/entities/user.entity';
import { UserService } from '../../user/services/user.service';
import { CreateUserDto } from '../../user/dto/create.dto';
import { LoginDto } from '../dto/login.dto';

export type UserResponse = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  private verifyPassword(plain: string, hashed: string): boolean {
    return this.hashPassword(plain) === hashed;
  }

  private excludePassword(user: User): UserResponse {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async create(dto: CreateUserDto): Promise<UserResponse> {
    const { username, email, password } = dto;

    if (!username || !email || !password) {
      throw new BadRequestException(
        'Username, email, and password are required',
      );
    }

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException(`Email "${email}" is already in use`);
    }

    const user = this.userRepository.create({
      ...dto,
      password: this.hashPassword(password),
    });

    const savedUser = await this.userRepository.save(user);
    return this.excludePassword(savedUser);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserResponse | null> {
    const user = await this.userService.findByEmail(email);
    if (!user) return null;

    if (!this.verifyPassword(password, user.password)) return null;

    return this.excludePassword(user);
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const { email, password } = dto;
    const user = await this.validateUser(email, password);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const payload = { email: user.email, id: user.id, name: user.username };
    return { access_token: this.jwtService.sign(payload) };
  }
}
