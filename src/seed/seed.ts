import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { Admin } from 'typeorm/driver/mongodb/typings.js';
import { UserRole } from '../entities/user.entity.js';

@Injectable()
export class Seed implements OnModuleInit {
  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    try {
      await this.usersService.create(
        { email: 'user@example.com', role: UserRole.USER },
        'test',
      );
      await this.usersService.create(
        { email: 'admin@example.com', role: UserRole.ADMIN },
        'test',
      );
    } catch (e) {}
  }
}
