import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { UserService } from '../../user/services/user.service';
import { AuthService } from '../services/auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let userRepo: jest.Mocked<Repository<User>>;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        { provide: UserService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    userRepo = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password using sha256', () => {
      const password = '123456';
      const hash = service.hashPassword(password);
      expect(hash).toHaveLength(64); // sha256 sempre tem 64 chars
      expect(hash).not.toBe(password);
    });
  });

  describe('create', () => {
    it('should throw BadRequestException if fields are missing', async () => {
      await expect(service.create({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if email already exists', async () => {
      userRepo.findOne.mockResolvedValueOnce({
        id: '1',
        email: 'user@user.com',
      } as any);

      await expect(
        service.create({
          username: 'UserTest',
          email: 'user@user.com',
          password: '123',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'user@user.com' },
      });
    });

    it('should hash password and save user', async () => {
      const dto = {
        username: 'UserTest',
        email: 'user@user.com',
        password: '123456',
      };

      userRepo.findOne.mockResolvedValueOnce(null);
      userRepo.create.mockReturnValue({
        ...dto,
        password: service.hashPassword(dto.password),
      } as any);
      userRepo.save.mockResolvedValue({
        id: 'uuid-1',
        ...dto,
        password: service.hashPassword(dto.password),
      } as any);

      const result = await service.create(dto);

      expect(userRepo.findOne).toHaveBeenCalled();
      expect(userRepo.create).toHaveBeenCalled();
      expect(userRepo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });
  });

  it('should throw error if email is invalid', async () => {
    const body = { email: 'invalid-email', password: '123456' };

    await expect(service.login(body)).rejects.toThrow();
  });

  it('should throw error if password is less than 6 characters', async () => {
    const body = { email: 'user@test.com', password: '123' };

    await expect(service.login(body)).rejects.toThrow();
  });

  it('should return JWT token for valid credentials', async () => {
    const user = { id: '1', email: 'test@test.com', password: 'hashed' };
    mockUsersService.findByEmail.mockResolvedValue(user);

    jest.spyOn(service, 'validateUser').mockResolvedValue({
      id: '1',
      email: 'user@test.com',
      name: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result = await service.login({
      email: 'user@test.com',
      password: '123456',
    });

    expect(result).toEqual({ access_token: 'jwt-token' });
  });
});
