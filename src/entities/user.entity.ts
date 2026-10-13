import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { Cocktail } from './cocktail.entity.js';

export const USER_UNIQUE_EMAIL = 'UQ_USER_EMAIL';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
@Unique(USER_UNIQUE_EMAIL, ['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'text' })
  email: string;
  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ type: 'text' })
  passwordHash: string;

  @OneToMany('Cocktail', (cocktail: Cocktail) => cocktail.user)
  cocktails: Cocktail[];
}
