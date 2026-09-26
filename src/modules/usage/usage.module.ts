import { Module } from '@nestjs/common';
import { UsageService } from './usage.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiUsageLogEntity } from './entities/api-usage-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApiUsageLogEntity])],
  providers: [UsageService],
  exports: [UsageService],
})
export class UsageModule {}
