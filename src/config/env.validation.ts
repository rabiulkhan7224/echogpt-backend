import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  validateSync,
  Min,
} from 'class-validator';

enum NodeEnv {
  development = 'development',
  test = 'test',
  production = 'production',
}

class EnvSchema {
  @IsEnum(NodeEnv) NODE_ENV!: NodeEnv;

  @IsInt() @Min(1) PORT!: number;

  @IsString() DB_HOST!: string;
  @IsInt() DB_PORT!: number;
  @IsString() DB_USER!: string;
  @IsString() DB_PASSWORD!: string;
  @IsString() DB_NAME!: string;

  @IsString() JWT_ACCESS_SECRET!: string;
  @IsString() JWT_REFRESH_SECRET!: string;
  @IsString() ENCRYPTION_KEY!: string;

  @IsOptional() @IsString() REDIS_URL?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const parsed = plainToInstance(EnvSchema, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(parsed, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(
      `Env validation failed:\n${errors.map((e) => Object.values(e.constraints ?? {}).join(', ')).join('\n')}`,
    );
  }
  return config;
}
