import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { comparePassword, hashPassword } from '@common/utils/hash.util';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SessionsService } from '@modules/sessions/sessions.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity) private readonly repo: Repository<UserEntity>,
    private readonly sessions: SessionsService,
  ) {}

  async findById(id: string): Promise<UserEntity> {
    const u = await this.repo.findOne({
      where: { id },
      relations: { roles: true },
    });
    if (!u) throw new NotFoundException('User not found');
    return u;
  }

  async me(id: string) {
    const u = await this.findById(id);
    return {
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      avatarUrl: u.avatarUrl,
      emailVerified: u.emailVerified,
      roles: u.roles.map((r) => r.name),
      createdAt: u.createdAt,
    };
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    await this.repo.update({ id }, dto);
    return this.me(id);
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const u = await this.findById(id);
    const ok = await comparePassword(dto.oldPassword, u.passwordHash);
    if (!ok) throw new UnauthorizedException('Old password incorrect');

    u.passwordHash = await hashPassword(dto.newPassword);
    await this.repo.save(u);
    // force re-login on other devices
    await this.sessions.revokeAllForUser(id);
  }

  async deleteAccount(id: string) {
    await this.repo.softDelete(id);
    await this.sessions.revokeAllForUser(id);
  }

  async listSessions(id: string) {
    return this.sessions.listActive(id);
  }
}
