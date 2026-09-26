import { DataSource } from 'typeorm';
import { RoleEntity } from '@modules/users/entities/role.entity';
import { RoleName } from '@common/constants/roles.constant';

export async function seedRoles(ds: DataSource): Promise<void> {
  const repo = ds.getRepository(RoleEntity);

  const roles = [
    { name: RoleName.ADMIN, description: 'Full system access' },
    { name: RoleName.USER, description: 'Standard user' },
  ];

  for (const r of roles) {
    const exists = await repo.findOne({ where: { name: r.name } });
    if (!exists) {
      await repo.save(repo.create(r));
      console.log(`✓ role: ${r.name}`);
    } else {
      console.log(`· role: ${r.name} (exists)`);
    }
  }
}
