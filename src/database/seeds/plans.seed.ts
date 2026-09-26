import { DataSource } from 'typeorm';
import { PlanEntity } from '@modules/subscriptions/entities/plan.entity';
import { PlanName } from '@common/constants/plans.constant';

export async function seedPlans(ds: DataSource): Promise<void> {
  const repo = ds.getRepository(PlanEntity);

  const plans = [
    {
      name: PlanName.FREE,
      priceMonthly: '0.00',
      requestLimit: 50,
      searchLimit: 10,
      providerLimit: 1,
      features: {
        streaming: false,
        webSearch: true,
        customProviders: false,
      },
    },
    {
      name: PlanName.PREMIUM,
      priceMonthly: '9.99',
      requestLimit: 5000,
      searchLimit: 1000,
      providerLimit: 5,
      features: {
        streaming: true,
        webSearch: true,
        customProviders: true,
        prioritySupport: true,
      },
    },
  ];

  for (const p of plans) {
    const exists = await repo.findOne({ where: { name: p.name } });
    if (!exists) {
      await repo.save(repo.create(p));
      console.log(
        `  ✓ plan: ${p.name} (${p.requestLimit} req, ${p.searchLimit} search)`,
      );
    } else {
      console.log(`  · plan: ${p.name} (exists)`);
    }
  }
}
