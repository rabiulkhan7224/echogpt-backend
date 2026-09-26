import { DataSource, IsNull } from 'typeorm';
import { AiProviderEntity } from '@modules/providers/entities/ai-provider.entity';
import { ProviderType } from '@common/constants/providers.constant';
import { CryptoUtil } from '@common/utils/crypto.util';

interface ProviderSeed {
  type: ProviderType;
  name: string;
  defaultModel: string;
  baseUrl: string | null;
  placeholderKey: string;
}

export async function seedProviders(ds: DataSource): Promise<void> {
  const repo = ds.getRepository(AiProviderEntity);

  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error('ENCRYPTION_KEY missing in env');
  const crypto = new CryptoUtil(key);

  const seeds: ProviderSeed[] = [
    {
      type: ProviderType.OPENAI,
      name: 'OpenAI (system)',
      defaultModel: 'gpt-4o-mini',
      baseUrl: 'https://api.openai.com/v1',
      placeholderKey: process.env.OPENAI_SEED_KEY ?? 'sk-placeholder-openai',
    },
    {
      type: ProviderType.CLAUDE,
      name: 'Claude (system)',
      defaultModel: 'claude-3-5-sonnet-latest',
      baseUrl: 'https://api.anthropic.com/v1',
      placeholderKey: process.env.CLAUDE_SEED_KEY ?? 'sk-placeholder-claude',
    },
    {
      type: ProviderType.GEMINI,
      name: 'Gemini (system)',
      defaultModel: 'gemini-1.5-flash',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      placeholderKey: process.env.GEMINI_SEED_KEY ?? 'sk-placeholder-gemini',
    },
  ];

  for (const s of seeds) {
    const exists = await repo.findOne({
      where: { type: s.type, userId: IsNull() },
    });
    if (exists) {
      console.log(`  · provider: ${s.type} (exists)`);
      continue;
    }

    const payload = crypto.encrypt(s.placeholderKey);
    const isDefault = s.type === ProviderType.OPENAI; // OpenAI is default system provider

    await repo.save(
      repo.create({
        userId: null,
        type: s.type,
        name: s.name,
        baseUrl: s.baseUrl,
        defaultModel: s.defaultModel,
        apiKeyEncrypted: payload.encrypted,
        apiKeyIv: payload.iv,
        apiKeyTag: payload.tag,
        isEnabled: true,
        isDefault,
      }),
    );
    console.log(`  ✓ provider: ${s.type}${isDefault ? ' [default]' : ''}`);
  }
}
