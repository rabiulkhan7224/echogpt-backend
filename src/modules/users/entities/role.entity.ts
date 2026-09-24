import { Column, Entity, ManyToMany } from 'typeorm';
import { RoleName } from '@common/constants/roles.constant';
import { UserEntity } from './user.entity';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity({ name: 'roles' })
export class RoleEntity extends BaseEntity {
  @Column({ type: 'enum', enum: RoleName, unique: true })
  name!: RoleName;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string | null;

  @ManyToMany(() => UserEntity, (u) => u.roles)
  users!: UserEntity[];
}
