import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { WpWebhookService } from './services/webhook.service';
import { WpWebHookController } from './controllers/webhook.controller';

@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get<string>('REDIS_HOST', 'localhost'),
        port: config.get<number>('REDIS_PORT', 6379),
        ttl: config.get<number>('CACHE_TTL', 600),
      }),
    }),
  ],
  controllers: [WpWebHookController],
  providers: [WpWebhookService],
  exports: [WpWebhookService],
})
export class WpWebhookModule {}
