import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UserRole } from '../entities/user.entity.js';
import { isTest } from '../shared/utils/utils.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class Seed implements OnModuleInit {
  private readonly logger = new Logger(Seed.name);
  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    if (isTest() || (await this.usersService.hasUsers())) return;
    try {
      await this.usersService.create(
        { email: 'user@example.com', role: UserRole.USER },
        'test',
      );
      await this.usersService.create(
        { email: 'admin@example.com', role: UserRole.ADMIN },
        'test',
      );
    } catch (e) {
      this.logger.error('Failed to seed users.', e);
    }
  }
}
