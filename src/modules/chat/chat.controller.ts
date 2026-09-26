import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendPromptDto } from './dto/send-prompt.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { Throttle } from '@nestjs/throttler';

@ApiTags('chat')
@ApiBearerAuth('access-token')
@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('completions')
  @ApiOperation({ summary: 'Send a prompt and receive an AI completion' })
  complete(@CurrentUser() u: AuthenticatedUser, @Body() dto: SendPromptDto) {
    return this.chat.complete(u.id, dto);
  }
}
