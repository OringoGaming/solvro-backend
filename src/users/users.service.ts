import { PasswordHasher } from '@nestjs/authentication';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { User } from '../entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async create(
    user: Omit<Partial<User>, 'id' | 'passwordHash'>,
    password: string,
  ): Promise<User> {
    const passwordHash = await this.passwordHasher.hash(password);
    const u = this.entityManager.create(User, { ...user, passwordHash });
    return this.entityManager.save(User, u);
  }

  async findForLogin(email: string, password: string): Promise<User | null> {
    const user = await this.entityManager
      .createQueryBuilder(User, 'user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
    //pass null to prevent timing attacks
    if (!(await this.passwordHasher.verify(password, user?.passwordHash)))
      return null;
    delete user!.passwordHash;
    return user;
  }

  findById(id: string): Promise<User | null> {
    return this.entityManager.findOneBy(User, { id });
  }
}
