import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { ParseUuidPipe } from '@common/pipes/parse-uuid.pipe';

@ApiTags('search')
@ApiBearerAuth('access-token')
@Controller('search')
export class SearchController {
  constructor(private readonly svc: SearchService) {}

  @Post()
  @ApiOperation({ summary: 'Run a web search query' })
  query(@CurrentUser() u: AuthenticatedUser, @Body() dto: SearchQueryDto) {
    return this.svc.query(u.id, dto.q);
  }

  @Get('history')
  @ApiOperation({ summary: 'Paginated search history' })
  history(
    @CurrentUser() u: AuthenticatedUser,
    @Query() page: PaginationQueryDto,
  ) {
    return this.svc.history(u.id, page);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Last 10 searches' })
  recent(@CurrentUser() u: AuthenticatedUser) {
    return this.svc.recent(u.id);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Search suggestions based on history' })
  suggestions(@CurrentUser() u: AuthenticatedUser, @Query('q') q: string) {
    return this.svc.suggestions(u.id, q);
  }

  @Delete('history/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a history entry' })
  async deleteOne(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id', ParseUuidPipe) id: string,
  ) {
    await this.svc.deleteOne(u.id, id);
  }

  @Delete('history')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear all search history' })
  async clear(@CurrentUser() u: AuthenticatedUser) {
    await this.svc.clearHistory(u.id);
  }
}
