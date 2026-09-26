import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Equal, IsNull, Or, Repository } from 'typeorm';
import { AiProviderEntity } from './entities/ai-provider.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { CryptoUtil } from '@common/utils/crypto.util';
import { ProviderFactory } from './provider.factory';
import { SubscriptionEntity } from '@modules/subscriptions/entities/subscription.entity';

@Injectable()
export class ProvidersService {
  private readonly crypto: CryptoUtil;

  constructor(
    @InjectRepository(AiProviderEntity)
    private readonly repo: Repository<AiProviderEntity>,
    @InjectRepository(SubscriptionEntity)
    private readonly subs: Repository<SubscriptionEntity>,
    private readonly factory: ProviderFactory,
    private readonly dataSource: DataSource,
    config: ConfigService,
  ) {
    this.crypto = new CryptoUtil(config.getOrThrow<string>('encryptionKey'));
  }

  async listForUser(userId: string) {
    const rows = await this.repo.find({
      where: [{ userId }, { userId: IsNull() }],
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });
    return rows.map((r) => this.toDto(r));
  }

  async getOne(userId: string, id: string) {
    const p = await this.findOwnedOrSystem(userId, id);
    return this.toDto(p);
  }

  async create(userId: string, dto: CreateProviderDto) {
    await this.assertProviderQuota(userId);

    const payload = this.crypto.encrypt(dto.apiKey);
    const isFirst = (await this.repo.count({ where: { userId } })) === 0;

    const entity = this.repo.create({
      userId,
      type: dto.type,
      name: dto.name,
      baseUrl: dto.baseUrl ?? null,
      defaultModel: dto.defaultModel,
      apiKeyEncrypted: payload.encrypted,
      apiKeyIv: payload.iv,
      apiKeyTag: payload.tag,
      isDefault: isFirst,
    });
    const saved = await this.repo.save(entity);
    return this.toDto(saved);
  }

  async update(userId: string, id: string, dto: UpdateProviderDto) {
    const p = await this.findOwnedOrSystem(userId, id);
    if (p.userId === null)
      throw new ForbiddenException('Cannot edit system provider');

    if (dto.apiKey) {
      const payload = this.crypto.encrypt(dto.apiKey);
      p.apiKeyEncrypted = payload.encrypted;
      p.apiKeyIv = payload.iv;
      p.apiKeyTag = payload.tag;
    }
    if (dto.name) p.name = dto.name;
    if (dto.defaultModel) p.defaultModel = dto.defaultModel;
    if (dto.baseUrl !== undefined) p.baseUrl = dto.baseUrl ?? null;

    return this.toDto(await this.repo.save(p));
  }

  async delete(userId: string, id: string) {
    const p = await this.findOwnedOrSystem(userId, id);
    if (p.userId === null)
      throw new ForbiddenException('Cannot delete system provider');
    await this.repo.softDelete(p.id);
  }

  async setEnabled(userId: string, id: string, enabled: boolean) {
    const p = await this.findOwnedOrSystem(userId, id);
    if (p.userId === null)
      throw new ForbiddenException('Cannot modify system provider');
    p.isEnabled = enabled;
    return this.toDto(await this.repo.save(p));
  }

  async setDefault(userId: string, id: string) {
    const p = await this.findOwnedOrSystem(userId, id);
    if (p.userId === null)
      throw new ForbiddenException('Cannot modify system provider');

    await this.dataSource.transaction(async (m) => {
      await m.update(
        AiProviderEntity,
        { userId, isDefault: true },
        { isDefault: false },
      );
      await m.update(AiProviderEntity, { id: p.id }, { isDefault: true });
    });
    return this.toDto(await this.repo.findOneByOrFail({ id: p.id }));
  }

  async healthCheckAll(userId: string) {
    const providers = await this.repo.find({
      where: [
        { userId, isEnabled: true },
        { userId: IsNull(), isEnabled: true },
      ],
    });
    const results = await Promise.all(
      providers.map(async (p) => {
        const healthy = await this.pingOne(p);
        return { id: p.id, name: p.name, type: p.type, healthy };
      }),
    );
    return results;
  }

  async healthCheckOne(userId: string, id: string) {
    const p = await this.findOwnedOrSystem(userId, id);
    const healthy = await this.pingOne(p);
    return { id: p.id, name: p.name, type: p.type, healthy };
  }

  /** Used by ChatService */
  async resolveForChat(
    userId: string,
    providerId?: string,
  ): Promise<AiProviderEntity> {
    if (providerId) {
      const p = await this.repo.findOne({ where: { id: providerId } });
      if (!p) throw new NotFoundException('Provider not found');
      if (p.userId && p.userId !== userId) {
        throw new ForbiddenException('Provider not accessible');
      }
      if (!p.isEnabled) throw new BadRequestException('Provider disabled');
      return p;
    }

    const userDefault = await this.repo.findOne({
      where: { userId, isDefault: true, isEnabled: true },
    });
    if (userDefault) return userDefault;

    const systemDefault = await this.repo.findOne({
      where: { userId: IsNull(), isDefault: true, isEnabled: true },
    });
    if (systemDefault) return systemDefault;

    throw new BadRequestException('No default provider configured');
  }

  decryptKey(p: AiProviderEntity): string {
    return this.crypto.decrypt({
      encrypted: p.apiKeyEncrypted,
      iv: p.apiKeyIv,
      tag: p.apiKeyTag,
    });
  }

  private async findOwnedOrSystem(
    userId: string,
    id: string,
  ): Promise<AiProviderEntity> {
    const p = await this.repo.findOne({
      where: {
        id,
        userId: Or(Equal(userId), IsNull()),
      },
    });
    if (!p) {
      const raw = await this.repo.findOne({ where: { id } });
      if (!raw || (raw.userId && raw.userId !== userId)) {
        throw new NotFoundException('Provider not found');
      }
      return raw;
    }
    return p;
  }

  private async pingOne(p: AiProviderEntity): Promise<boolean> {
    const adapter = this.factory.get(p.type);
    const apiKey = this.decryptKey(p);
    const ok = await adapter.healthCheck({ apiKey, baseUrl: p.baseUrl });
    if (ok) {
      await this.repo.update({ id: p.id }, { lastHealthyAt: new Date() });
    }
    return ok;
  }

  private async assertProviderQuota(userId: string) {
    const sub = await this.subs.findOne({
      where: { userId },
      relations: { plan: true },
    });
    if (!sub) return;
    const count = await this.repo.count({ where: { userId } });
    if (count >= sub.plan.providerLimit) {
      throw new ForbiddenException(
        `Provider limit reached (${count}/${sub.plan.providerLimit}). Upgrade your plan.`,
      );
    }
  }

  private toDto(p: AiProviderEntity) {
    const masked = (() => {
      try {
        return this.crypto.mask(this.decryptKey(p));
      } catch {
        return '****';
      }
    })();
    return {
      id: p.id,
      userId: p.userId,
      type: p.type,
      name: p.name,
      baseUrl: p.baseUrl,
      defaultModel: p.defaultModel,
      isEnabled: p.isEnabled,
      isDefault: p.isDefault,
      lastHealthyAt: p.lastHealthyAt,
      apiKeyMasked: masked,
      createdAt: p.createdAt,
    };
  }
}
