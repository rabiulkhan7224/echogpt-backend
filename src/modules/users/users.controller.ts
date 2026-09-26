import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  me(@CurrentUser() u: AuthenticatedUser) {
    return this.users.me(u.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  update(@CurrentUser() u: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(u.id, dto);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change current user password' })
  async changePassword(
    @CurrentUser() u: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.users.changePassword(u.id, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete current user account' })
  async deleteMe(@CurrentUser() u: AuthenticatedUser) {
    await this.users.deleteAccount(u.id);
  }

  @Get('me/sessions')
  @ApiOperation({ summary: 'List active sessions' })
  sessions(@CurrentUser() u: AuthenticatedUser) {
    return this.users.listSessions(u.id);
  }
}
