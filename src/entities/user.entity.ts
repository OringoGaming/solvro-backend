import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import type { Cocktail } from './cocktail.entity.js';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export const UQ_USER_EMAIL = "UQ_USER_EMAIL";

@Entity()
@Unique(UQ_USER_EMAIL, ['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'text' })
  email: string;
  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ type: 'text', select: false, nullable: false })
  passwordHash?: string;

  @OneToMany('Cocktail', (cocktail: Cocktail) => cocktail.user)
  cocktails: Cocktail[];
}
