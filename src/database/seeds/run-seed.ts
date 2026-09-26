import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import dataSource from '../data-source';
import { seedRoles } from './roles.seed';
import { seedPlans } from './plans.seed';
import { seedUsers } from './users.seed';
import { seedProviders } from './providers.seed';

async function run(): Promise<void> {
  console.log('\n🌱 Seeding database...\n');

  await dataSource.initialize();

  try {
    console.log('Roles:');
    await seedRoles(dataSource);

    console.log('\nPlans:');
    await seedPlans(dataSource);

    console.log('\nUsers:');
    await seedUsers(dataSource);

    console.log('\nAI Providers:');
    await seedProviders(dataSource);

    console.log('\n✅ Seed complete.\n');
  } catch (err) {
    console.error('\n❌ Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await dataSource.destroy();
  }
}

run();
