import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { Seed } from './seed.js';

@Module({
  imports: [UsersModule],
  providers: [Seed],
})
export class SeedModule {}
