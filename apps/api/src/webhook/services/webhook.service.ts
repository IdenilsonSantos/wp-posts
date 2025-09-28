import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

export interface PostType {
  id?: string;
  title: string | { rendered: string };
  slug?: string;
  excerpt?: string | { rendered: string };
  content?: string | { rendered: string };
  date?: string;
  modified?: string;
  [key: string]: any;
}

@Injectable()
export class WpWebhookService {
  private jsonFilePath = path.join(process.cwd(), 'src/utils/mockPosts.json');
  private cacheTTL: number;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.cacheTTL = Number(this.configService.get('WP_CACHE_TTL')) || 600;
  }

  private formatPost(post: PostType): PostType {
    const now = new Date().toISOString();

    if (!post.id) post.id = uuidv4();
    if (!post.date) post.date = now;

    post.modified = now;

    post.title =
      typeof post.title === 'string' ? { rendered: post.title } : post.title;
    post.excerpt =
      post.excerpt && typeof post.excerpt === 'string'
        ? { rendered: post.excerpt }
        : post.excerpt;
    post.content =
      post.content && typeof post.content === 'string'
        ? { rendered: post.content }
        : post.content;

    return post;
  }

  async updatePostsCache(post: PostType): Promise<void> {
    post = this.formatPost(post);
    const keysIterable = await this.cacheManager.stores.keys();
    const keys = Array.from(keysIterable);
    const postKeys = keys
      .map((k) => String(k))
      .filter((key) => key.startsWith('posts:'));

    for (const key of postKeys) {
      const posts: PostType[] =
        (await this.cacheManager.get<PostType[]>(key)) || [];
      const index = posts.findIndex((p) => p.id === post.id);

      if (index > -1) posts[index] = post;
      else posts.unshift(post);

      await this.cacheManager.set(key, posts, { ttl: this.cacheTTL } as any);
    }
  }

  async updateJsonServerFile(post: PostType): Promise<void> {
    post = this.formatPost(post);
    const raw = fs.readFileSync(this.jsonFilePath, 'utf-8');
    const db: { posts: PostType[] } = JSON.parse(raw);
    db.posts = db.posts || [];

    const index = db.posts.findIndex((p) => p.id === post.id);

    if (index > -1) db.posts[index] = post;
    else db.posts.unshift(post);

    fs.writeFileSync(this.jsonFilePath, JSON.stringify(db, null, 2));
  }

  async handlePost(post: PostType): Promise<void> {
    const isUpdate = !!post.id;

    if (isUpdate) {
      const raw = fs.readFileSync(this.jsonFilePath, 'utf-8');
      const db: { posts: PostType[] } = JSON.parse(raw);
      db.posts = db.posts || [];

      const index = db.posts.findIndex((p) => p.id === post.id);
      if (index === -1) {
        throw new NotFoundException('Post not found for update');
      }
    }

    await this.updatePostsCache(post);
    await this.updateJsonServerFile(post);
  }
}
