import { Injectable, Inject } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsCache } from '../entitites/post.entity';

export interface Post {
  id_wp: string | number;
  title: string;
  slug: string | null;
  excerpt: string | null;
  published_at: string | null;
  updated_at: string | null;
  __data?: any;
}

export interface PaginatedPosts {
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
  data: Post[];
}

@Injectable()
export class PostCacheService {
  private wpClient: AxiosInstance;
  private cacheTTL: number;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
    @InjectRepository(PostsCache)
    private postRepo: Repository<PostsCache>,
  ) {
    this.wpClient = axios.create({
      baseURL: 'http://localhost:3005',
      timeout: 5000,
    });

    this.cacheTTL = Number(this.configService.get('WP_CACHE_TTL')) || 600;
  }

  async findAll(
    search?: string,
    page: number = 1,
    pageSize: number = 10,
    options?: { forceRefresh?: boolean },
  ): Promise<PaginatedPosts> {
    page = Number(page) || 1;
    pageSize = Number(pageSize) || 10;

    const cacheKey = 'posts:all';
    let posts: Post[] | undefined = options?.forceRefresh
      ? undefined
      : await this.cacheManager.get<Post[]>(cacheKey);

    if (!posts) {
      const response = await this.wpClient.get('/posts');
      const data: any[] = response.data || [];

      posts = data.map<Post>((p: any) => ({
        id_wp: p.id,
        title: p.title?.rendered ?? p.title ?? '',
        slug: p.slug ?? null,
        excerpt: p.excerpt?.rendered ?? null,
        published_at: p.date ?? p.published_at ?? null,
        updated_at: p.modified ?? p.updated_at ?? null,
      }));

      posts.sort((a, b) => {
        const aTime = a.published_at ? new Date(a.published_at).getTime() : 0;
        const bTime = b.published_at ? new Date(b.published_at).getTime() : 0;
        return bTime - aTime;
      });

      await this.cacheManager.set(cacheKey, posts, {
        ttl: this.cacheTTL,
      } as any);

      for (const post of posts) {
        const postData = this.postRepo.create({
          id_wp: +post.id_wp,
          title: post.title,
          slug: post.slug ?? null,
          excerpt: post.excerpt ?? null,
        });
        await this.postRepo.save(postData);
      }
    }

    let filteredPosts = posts;

    if (search && search.trim() !== '') {
      const query = search.toLowerCase();
      filteredPosts = posts.filter((p) =>
        (p.title ?? '').toLowerCase().includes(query),
      );
    }

    const total = filteredPosts.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    if (page > totalPages) {
      return { total, totalPages, page, pageSize, data: [] };
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageData = filteredPosts.slice(start, end);

    return { total, totalPages, page, pageSize, data: pageData };
  }
}
