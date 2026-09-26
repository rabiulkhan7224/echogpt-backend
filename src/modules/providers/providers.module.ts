import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiProviderEntity } from './entities/ai-provider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiProviderEntity])],
})
export class ProvidersModule {}
