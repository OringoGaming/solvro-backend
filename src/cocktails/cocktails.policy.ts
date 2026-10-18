import { Policy } from '@nestjs/authorization';
import { NotFoundException } from '@nestjs/common';
import { User, UserRole } from '../entities/user.entity.js';
import { CocktailsService } from './cocktails.service.js';

@Policy()
export class CocktailsPolicy {
  constructor(private readonly cocktailsService: CocktailsService) {}
  create(user: User | null) {
    return user !== null;
  }

  async edit(user: User | null, cocktailId: unknown) {
    //policy runs before validation.
    if (user === null || typeof cocktailId !== 'string') return false;
    if (user.role !== UserRole.ADMIN) return true;
    const cocktail = await this.cocktailsService.find(cocktailId);
    if (cocktail === null) throw new NotFoundException(`Cocktail not found.`);
    return user.id === cocktail.userId;
  }
}
