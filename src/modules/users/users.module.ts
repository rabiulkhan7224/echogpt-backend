import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsModule } from '../sessions/sessions.module';
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from './entities/role.entity';
import { UsersService } from './users.service';
import { RolesBootstrapService } from './roles-bootstrap.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RoleEntity]), // ← must include RoleEntity
    SessionsModule,
  ],
  providers: [
    UsersService,
    RolesBootstrapService, // ← MUST be here
  ],
  exports: [UsersService],
})
export class UsersModule {}
