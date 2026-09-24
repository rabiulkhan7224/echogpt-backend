import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { RoleEntity } from '../users/entities/role.entity';
import { RegisterDto } from './dto/register.dto';
import { comparePassword, hashPassword } from '@/common/utils/hash.util';
import { RoleName } from '@/common/constants/roles.constant';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { randomUUID } from 'crypto';
import { SessionsService } from '../sessions/sessions.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roles: Repository<RoleEntity>,
    private readonly sessions: SessionsService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  //   registerUser

  async registerUser(dto: RegisterDto, meta: { ua?: string; ip?: string }) {
    const normalizedEmail = dto.email.toLowerCase();
    const existing = await this.users.findOne({
      where: { email: normalizedEmail },
    });
    if (existing) throw new ConflictException('Email already in use');
    const userRole = await this.roles.findOne({
      where: { name: RoleName.USER },
    });
    if (!userRole) throw new Error('USER role missing — run seeds');
    const passwordHash = await hashPassword(dto.password);
    const user = await this.dataSource.transaction(async (m) => {
      const u = m.create(UserEntity, {
        email: normalizedEmail,
        passwordHash,
        fullName: dto.fullName ?? null,
        roles: [userRole],
      });
      const savedUser = await m.save(u);
      //   TODO: Uncomment this line when the subscriptions module is implemented
      //   await this.subscriptions.createFreeForUser(m, savedUser.id);
      return savedUser;
    });
    // Ensure roles array is attached for token payload
    user.roles = [userRole];
    return this.issueTokens(user, meta);
  }
  async login(dto: LoginDto, meta: { ua?: string; ip?: string }) {
    const user = await this.users.findOne({
      where: { email: dto.email.toLowerCase() },
      relations: { roles: true },
    });
    if (!user || !user.isActive)
      throw new UnauthorizedException('Invalid credentials');

    const ok = await comparePassword(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user, meta);
  }

  async refresh(refreshToken: string, meta: { ua?: string; ip?: string }) {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.sessions.findByRefreshToken(refreshToken);
    if (!session || session.userId !== payload.sub) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    // rotate
    await this.sessions.revoke(session.id);
    return this.issueTokens(session.user, meta);
  }

  async logout(sessionId: string | undefined, userId: string) {
    if (sessionId) {
      await this.sessions.revoke(sessionId);
    } else {
      await this.sessions.revokeAllForUser(userId);
    }
  }

  async logoutAll(userId: string) {
    await this.sessions.revokeAllForUser(userId);
  }

  private async issueTokens(
    user: UserEntity,
    meta: { ua?: string; ip?: string },
  ): Promise<AuthResponseDto> {
    const roles = (user.roles ?? []).map((r) => r.name);
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
    };

    const accessToken = await this.jwt.signAsync(accessPayload, {
      secret: this.config.getOrThrow('jwt.accessSecret'),
      expiresIn: this.config.getOrThrow('jwt.accessExpiresIn'),
    });

    const sessionId = randomUUID();
    const refreshPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
      sid: sessionId,
    };

    const refreshToken = await this.jwt.signAsync(refreshPayload, {
      secret: this.config.getOrThrow('jwt.refreshSecret'),
      expiresIn: this.config.getOrThrow('jwt.refreshExpiresIn'),
    });

    const decoded = this.jwt.decode(refreshToken) as { exp: number };

    // Pass the custom generated sessionId so payload.sid matches the database primary key
    await this.sessions.create({
      id: sessionId,
      userId: user.id,
      refreshToken,
      expiresAt: new Date(decoded.exp * 1000),
      userAgent: meta.ua,
      ipAddress: meta.ip,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName ?? null,
        roles,
      },
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }
}
