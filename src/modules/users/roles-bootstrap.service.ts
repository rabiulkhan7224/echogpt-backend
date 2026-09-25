import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from './entities/role.entity';
import { RoleName } from '@common/constants/roles.constant';

@Injectable()
export class RolesBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RolesBootstrapService.name);

  constructor(
    @InjectRepository(RoleEntity)
    private readonly roles: Repository<RoleEntity>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const required = [
      { name: RoleName.ADMIN, description: 'Full system access' },
      { name: RoleName.USER, description: 'Standard user' },
    ];

    for (const r of required) {
      const exists = await this.roles.findOne({ where: { name: r.name } });
      if (!exists) {
        await this.roles.save(this.roles.create(r));
        this.logger.log(`Seeded missing role: ${r.name}`);
      }
    }
  }
}
