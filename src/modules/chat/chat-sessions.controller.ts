import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ChatSessionsService } from './chat-sessions.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { ParseUuidPipe } from '@common/pipes/parse-uuid.pipe';

class RenameSessionDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;
}

@ApiTags('chat-sessions')
@ApiBearerAuth('access-token')
@Controller('chat/sessions')
export class ChatSessionsController {
  constructor(private readonly svc: ChatSessionsService) {}

  @Get()
  @ApiOperation({ summary: 'List my chat sessions' })
  list(@CurrentUser() u: AuthenticatedUser, @Query() page: PaginationQueryDto) {
    return this.svc.list(u.id, page);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new chat session' })
  create(@CurrentUser() u: AuthenticatedUser) {
    return this.svc.create(u.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a chat session' })
  get(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id', ParseUuidPipe) id: string,
  ) {
    return this.svc.get(u.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Rename a chat session' })
  rename(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id', ParseUuidPipe) id: string,
    @Body() dto: RenameSessionDto,
  ) {
    return this.svc.rename(u.id, id, dto.title);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a chat session' })
  async remove(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id', ParseUuidPipe) id: string,
  ) {
    await this.svc.remove(u.id, id);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'List messages in a session (paginated)' })
  messages(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id', ParseUuidPipe) id: string,
    @Query() page: PaginationQueryDto,
  ) {
    return this.svc.messagesPaged(u.id, id, page);
  }
}
