import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { ApiUsageLogEntity } from './entities/api-usage-log.entity';

export interface LogInput {
  userId?: string | null;
  providerId?: string | null;
  endpoint: string;
  method: string;
  statusCode: number;
  latencyMs: number;
  tokensUsed?: number | null;
  ipAddress?: string | null;
  errorMessage?: string | null;
}

@Injectable()
export class UsageService {
  constructor(
    @InjectRepository(ApiUsageLogEntity)
    private readonly repo: Repository<ApiUsageLogEntity>,
  ) {}

  async log(input: LogInput): Promise<void> {
    try {
      await this.repo.insert(input);
    } catch {
      // never let logging break the request
    }
  }

  async countRequestsBetween(from: Date, to: Date): Promise<number> {
    return this.repo.count({ where: { createdAt: Between(from, to) } });
  }

  async paginate(opts: {
    page: number;
    limit: number;
    userId?: string;
    endpoint?: string;
    statusCode?: number;
    from?: Date;
    to?: Date;
  }) {
    const qb = this.repo
      .createQueryBuilder('l')
      .orderBy('l.created_at', 'DESC');
    if (opts.userId) qb.andWhere('l.user_id = :u', { u: opts.userId });
    if (opts.endpoint) qb.andWhere('l.endpoint = :e', { e: opts.endpoint });
    if (opts.statusCode)
      qb.andWhere('l.status_code = :s', { s: opts.statusCode });
    if (opts.from) qb.andWhere('l.created_at >= :f', { f: opts.from });
    if (opts.to) qb.andWhere('l.created_at <= :t', { t: opts.to });

    const [items, total] = await qb
      .skip((opts.page - 1) * opts.limit)
      .take(opts.limit)
      .getManyAndCount();

    return {
      data: items,
      meta: {
        page: opts.page,
        limit: opts.limit,
        total,
        totalPages: Math.ceil(total / opts.limit),
      },
    };
  }
}
