import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsModule } from '../sessions/sessions.module';
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from './entities/role.entity';
import { UsersService } from './users.service';
import { RolesBootstrapService } from './roles-bootstrap.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity]), SessionsModule],
  providers: [UsersService, RolesBootstrapService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
