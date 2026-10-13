import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { JwtAuth } from './jwtAuth.provider.js';
import { TokensController } from './tokens.controller.js';

@Module({
  imports: [UsersModule],
  providers: [JwtAuth],
  controllers: [TokensController],
})
export class AuthModule {}
