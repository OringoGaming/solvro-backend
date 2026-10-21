import { PasswordHasher } from '@nestjs/authentication';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UQ_USER_EMAIL, User } from '../entities/user.entity.js';
import { isConstraintError, PgErrorCode } from '../shared/utils/dbErrors.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async create(
    user: Omit<Partial<User>, 'id' | 'passwordHash' | 'cocktails'>,
    password: string,
  ): Promise<User> {
    const passwordHash = await this.passwordHasher.hash(password);
    const u = this.entityManager.create(User, { ...user, passwordHash });
    try {
      return await this.entityManager.save(User, u);
    } catch (e) {
      if (isConstraintError(e, PgErrorCode.UNIQUE_VIOLATION, UQ_USER_EMAIL))
        throw new ConflictException("User email is taken.");
      throw e;
    }
  }

  async hasUsers(): Promise<boolean> {
    return await this.entityManager.count(User) !== 0;
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
