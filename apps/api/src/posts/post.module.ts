import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { PostCacheService } from './services/post.service';
import { PostsCacheController } from './controllers/post.controller';
import { ConfigModule } from '@nestjs/config';
import { PostsCache } from './entitites/post.entity';
import { RedisCacheModule } from '../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsCache]),
    ConfigModule,
    RedisCacheModule,
  ],
  providers: [PostCacheService],
  controllers: [PostsCacheController],
  exports: [PostCacheService],
})
export class PostModule {}
