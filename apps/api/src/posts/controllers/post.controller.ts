import { Controller, Get, Query, HttpStatus } from '@nestjs/common';
import { PostCacheService } from '../services/post.service';

@Controller('content/posts')
export class PostsCacheController {
  constructor(private readonly PostCacheService: PostCacheService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    try {
      const posts = await this.PostCacheService.findAll(
        search,
        Number(page) || 1,
        Number(pageSize) || 10,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Posts retrieved successfully',
        data: posts,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch posts';
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: errorMessage,
      };
    }
  }
}
