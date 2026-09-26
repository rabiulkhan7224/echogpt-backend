import { DataSource } from 'typeorm';
import { UserEntity } from '@modules/users/entities/user.entity';
import { RoleEntity } from '@modules/users/entities/role.entity';
import { PlanEntity } from '@modules/subscriptions/entities/plan.entity';
import { SubscriptionEntity } from '@modules/subscriptions/entities/subscription.entity';
import { RoleName } from '@common/constants/roles.constant';
import { PlanName, SubscriptionStatus } from '@common/constants/plans.constant';
import { hashPassword } from '@common/utils/hash.util';

interface UserSeed {
  email: string;
  password: string;
  fullName: string;
  role: RoleName;
}

export async function seedUsers(ds: DataSource): Promise<void> {
  const userRepo = ds.getRepository(UserEntity);
  const roleRepo = ds.getRepository(RoleEntity);
  const planRepo = ds.getRepository(PlanEntity);
  const subRepo = ds.getRepository(SubscriptionEntity);

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@echogpt.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123';
  const userEmail = process.env.SEED_USER_EMAIL ?? 'user@echogpt.local';
  const userPassword = process.env.SEED_USER_PASSWORD ?? 'User@123';

  const seeds: UserSeed[] = [
    {
      email: adminEmail,
      password: adminPassword,
      fullName: 'Admin',
      role: RoleName.ADMIN,
    },
    {
      email: userEmail,
      password: userPassword,
      fullName: 'Demo User',
      role: RoleName.USER,
    },
  ];

  const freePlan = await planRepo.findOne({ where: { name: PlanName.FREE } });
  if (!freePlan) throw new Error('FREE plan not seeded — run seedPlans first');

  for (const s of seeds) {
    const existing = await userRepo.findOne({
      where: { email: s.email.toLowerCase() },
      relations: { roles: true },
    });
    if (existing) {
      console.log(`  · user: ${s.email} (exists)`);
      continue;
    }

    const role = await roleRepo.findOne({ where: { name: s.role } });
    if (!role)
      throw new Error(`Role ${s.role} not seeded — run seedRoles first`);

    await ds.transaction(async (m) => {
      const user = m.create(UserEntity, {
        email: s.email.toLowerCase(),
        passwordHash: await hashPassword(s.password),
        fullName: s.fullName,
        emailVerified: true, // seeded users skip verification
        isActive: true,
        roles: [role],
      });
      const savedUser = await m.save(user);

      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const sub = m.create(SubscriptionEntity, {
        userId: savedUser.id,
        planId: freePlan.id,
        status: SubscriptionStatus.ACTIVE,
        requestsUsed: 0,
        searchesUsed: 0,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      });
      await m.save(sub);
    });

    console.log(`  ✓ user: ${s.email} [${s.role}]`);
  }
}
