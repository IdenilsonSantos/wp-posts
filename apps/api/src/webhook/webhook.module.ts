import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WpWebhookService } from './services/webhook.service';
import { WpWebHookController } from './controllers/webhook.controller';
import { RedisCacheModule } from '../redis/redis.module';

@Module({
  imports: [ConfigModule, RedisCacheModule],
  controllers: [WpWebHookController],
  providers: [WpWebhookService],
  exports: [WpWebhookService],
})
export class WpWebhookModule {}
