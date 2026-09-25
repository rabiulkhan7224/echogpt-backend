import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionEntity } from './entities/session.entity';
import { IsNull, LessThan, Repository } from 'typeorm';
import { hashToken } from '@/common/utils/hash.util';
export interface CreateSessionInput {
  /** Optional. When supplied, becomes the row PK and must match the JWT `sid` claim. */
  id?: string;
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}
@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly repo: Repository<SessionEntity>,
  ) {}

  async create(data: CreateSessionInput): Promise<SessionEntity> {
    const session = this.repo.create({
      // Only set id when provided — otherwise let the DB default (gen_random_uuid) fire.
      ...(data.id ? { id: data.id } : {}),
      userId: data.userId,
      // Store the HASH, never the raw token.
      refreshTokenHash: hashToken(data.refreshToken),
      expiresAt: data.expiresAt,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
    });
    return this.repo.save(session);
  }

  async findByRefreshToken(
    refreshToken: string,
  ): Promise<SessionEntity | null> {
    return this.repo.findOne({
      where: { refreshTokenHash: hashToken(refreshToken), revokedAt: IsNull() },
      relations: {
        user: {
          roles: true,
        },
      },
    });
  }

  async revoke(sessionId: string): Promise<void> {
    await this.repo.update({ id: sessionId }, { revokedAt: new Date() });
  }

  async revokeAllForUser(
    userId: string,
    exceptSessionId?: string,
  ): Promise<void> {
    const qb = this.repo
      .createQueryBuilder()
      .update()
      .set({ revokedAt: new Date() })
      .where('user_id = :userId AND revoked_at IS NULL', { userId });
    if (exceptSessionId)
      qb.andWhere('id <> :exceptSessionId', { exceptSessionId });
    await qb.execute();
  }

  listActive(userId: string): Promise<SessionEntity[]> {
    return this.repo.find({
      where: { userId, revokedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async purgeExpired(): Promise<number> {
    const res = await this.repo.delete({ expiresAt: LessThan(new Date()) });
    return res.affected ?? 0;
  }
}
