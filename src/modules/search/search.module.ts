import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebSearchEntity } from './entities/web-search.entity';
import { WebSearchResultEntity } from './entities/web-search-result.entity';
import { HttpModule } from '@nestjs/axios';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { SearchController } from './search.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebSearchEntity, WebSearchResultEntity]),
    HttpModule,
    SubscriptionsModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
