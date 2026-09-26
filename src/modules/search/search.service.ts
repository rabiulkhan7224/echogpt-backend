import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { WebSearchEntity } from './entities/web-search.entity';
import { WebSearchResultEntity } from './entities/web-search-result.entity';
import { SubscriptionsService } from '@modules/subscriptions/subscriptions.service';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @InjectRepository(WebSearchEntity)
    private readonly searches: Repository<WebSearchEntity>,
    @InjectRepository(WebSearchResultEntity)
    private readonly results: Repository<WebSearchResultEntity>,
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly subs: SubscriptionsService,
  ) {}

  async query(userId: string, q: string) {
    await this.subs.assertQuota(userId, 'searches');

    // naive public DuckDuckGo "instant answers" endpoint — replace with real provider
    const apiUrl =
      this.config.get<string>('search.apiUrl') ?? 'https://api.duckduckgo.com';
    let rawResults: Array<{ title: string; url: string; snippet?: string }> =
      [];
    try {
      const { data } = await firstValueFrom(
        this.http.get(apiUrl, { params: { q, format: 'json', no_html: 1 } }),
      );
      if (Array.isArray(data?.RelatedTopics)) {
        rawResults = data.RelatedTopics.slice(0, 10)
          .flatMap((t: any) => {
            if (t.Topics) return t.Topics;
            return [t];
          })
          .filter((t: any) => t.FirstURL && t.Text)
          .map((t: any) => ({
            title: t.Text.slice(0, 300),
            url: t.FirstURL,
            snippet: t.Text,
          }));
      }
    } catch (e) {
      this.logger.warn(`Search provider error: ${(e as Error).message}`);
    }

    const search = await this.searches.save(
      this.searches.create({
        userId,
        query: q,
        resultCount: rawResults.length,
        cached: false,
      }),
    );

    if (rawResults.length > 0) {
      await this.results.save(
        rawResults.map((r, i) =>
          this.results.create({
            searchId: search.id,
            title: r.title,
            url: r.url,
            snippet: r.snippet ?? null,
            position: i + 1,
          }),
        ),
      );
    }

    await this.subs.incrementUsage(userId, 'searches');

    return {
      id: search.id,
      query: q,
      results: rawResults,
      cached: false,
      createdAt: search.createdAt,
    };
  }

  async history(userId: string, page: PaginationQueryDto) {
    const [items, total] = await this.searches.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: page.skip,
      take: page.limit,
    });
    return {
      data: items,
      meta: {
        page: page.page,
        limit: page.limit,
        total,
        totalPages: Math.ceil(total / page.limit),
      },
    };
  }

  recent(userId: string) {
    return this.searches.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

  async suggestions(userId: string, q: string) {
    if (!q || q.length < 2) return [];
    const rows = await this.searches
      .createQueryBuilder('s')
      .select('DISTINCT s.query', 'query')
      .where('s.user_id = :userId', { userId })
      .andWhere('s.query ILIKE :q', { q: `%${q}%` })
      .limit(10)
      .getRawMany<{ query: string }>();
    return rows.map((r) => r.query);
  }

  async deleteOne(userId: string, id: string) {
    await this.searches.delete({ id, userId });
  }

  async clearHistory(userId: string) {
    await this.searches.delete({ userId });
  }
}
