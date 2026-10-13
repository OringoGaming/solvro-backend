import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { Public, TokenService } from '@nestjs/authentication';
import { signInSchema, type SignInDto } from './dto/signIn.dto.js';
import { UsersService } from '../users/users.service.js';

@Public()
@Controller('auth/token')
export class TokensController {
  constructor(
    private usersService: UsersService,
    private readonly tokenService: TokenService,
  ) {}

  @Post()
  async issue(@Body({ schema: signInSchema }) body: SignInDto) {
    const user = await this.usersService.findForLogin(
      body.email,
      body.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.tokenService.issue(user.id);
  }

  // An unknown, expired or reused refresh token gets a 401.
  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.tokenService.refresh(refreshToken);
  }
}
