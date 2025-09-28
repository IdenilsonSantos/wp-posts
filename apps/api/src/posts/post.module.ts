import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { PostCacheService } from './services/post.service';
import { PostsCacheController } from './controllers/post.controller';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { PostsCache } from './entitites/post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsCache]),
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
  providers: [PostCacheService],
  controllers: [PostsCacheController],
  exports: [PostCacheService],
})
export class PostModule {}
