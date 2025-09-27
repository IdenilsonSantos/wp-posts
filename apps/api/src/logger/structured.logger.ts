import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class StructuredLogger implements LoggerService {
  log(message: string, context?: string, meta?: any) {
    this.print('INFO', message, context, meta);
  }

  error(message: string, trace?: string, context?: string, meta?: any) {
    this.print('ERROR', message, context, { ...meta, trace });
  }

  warn(message: string, context?: string, meta?: any) {
    this.print('WARN', message, context, meta);
  }

  debug(message: string, context?: string, meta?: any) {
    this.print('DEBUG', message, context, meta);
  }

  private print(level: string, message: string, context?: string, meta?: any) {
    const logObject = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      ...meta,
    };
    console.log(JSON.stringify(logObject));
  }
}
