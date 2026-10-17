import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { Cocktail } from './cocktail.entity.js';


export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'text', unique: true })
  email: string;
  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ type: 'text', select: false, nullable: false })
  passwordHash?: string;

  @OneToMany('Cocktail', (cocktail: Cocktail) => cocktail.user)
  cocktails: Cocktail[];
}
