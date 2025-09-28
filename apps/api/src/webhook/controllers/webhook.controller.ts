import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as webhookService from '../services/webhook.service';

@Controller('wp')
export class WpWebHookController {
  constructor(private readonly wpService: webhookService.WpWebhookService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() post: webhookService.PostType) {
    if (!post.title || post.title === '') {
      throw new BadRequestException('The title field is required.');
    }

    const isUpdate = !!post.id;

    try {
      await this.wpService.handlePost(post);
      return {
        status: 'success',
        message: isUpdate
          ? 'Post updated successfully'
          : 'Post created successfully',
        postId: post.id,
      };
    } catch (err: any) {
      if (err.message.includes('not found')) {
        throw new NotFoundException('Post not found for update.');
      }
      throw new InternalServerErrorException(
        err.message || 'Internal server error',
      );
    }
  }
}
