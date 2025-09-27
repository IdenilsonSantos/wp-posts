import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../../user/dto/create.dto';
import { LoginDto } from '../dto/login.dto';
import { maskEmail } from '../../utils/maskEmail.util';
import { StructuredLogger } from '../../logger/structured.logger';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: StructuredLogger,
  ) {}

  @Post('/signup')
  async create(
    @Body() dto: CreateUserDto,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const correlationId = req.correlationId;
    const maskedEmail = maskEmail(dto.email);

    try {
      this.logger.log('Signup attempt', 'AuthController', {
        correlationId,
        maskedEmail,
      });

      const user = await this.authService.create(dto);

      this.logger.log('Signup successful', 'AuthController', {
        correlationId,
        userId: user.id,
        maskedEmail,
      });

      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: 'User created successfully',
        data: user,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error creating user';
      const trace = error instanceof Error ? error.stack : undefined;

      this.logger.error(errorMessage, trace, 'AuthController', {
        correlationId,
        maskedEmail,
      });

      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({
          statusCode: error.getStatus(),
          message: error.message,
        });
      }

      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: errorMessage,
      });
    }
  }

  @Post('/login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const correlationId = req.correlationId;
    const maskedEmail = maskEmail(dto.email);

    try {
      this.logger.log('Login attempt', 'AuthController', {
        correlationId,
        maskedEmail,
      });

      const token = await this.authService.login(dto);

      this.logger.log('Login successfull', 'AuthController', {
        correlationId,
        maskedEmail,
      });

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Login successfull',
        access_token: token.access_token,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error during login';
      const trace = error instanceof Error ? error.stack : undefined;

      this.logger.error(errorMessage, trace, 'AuthController', {
        correlationId,
        maskedEmail,
      });

      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({
          statusCode: error.getStatus(),
          message: error.message,
        });
      }

      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: errorMessage,
      });
    }
  }
}
