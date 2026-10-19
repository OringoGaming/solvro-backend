import { Policy } from '@nestjs/authorization';
import { Cocktail } from '../entities/cocktail.entity.js';
import { User, UserRole } from '../entities/user.entity.js';

@Policy()
export class CocktailsPolicy {
  create(user: User | null) {
    return user !== null;
  }

  async edit(user: User | null, cocktail: Cocktail) {
    //policy runs before validation.
    if (user === null) return false;
    if (user.role !== UserRole.ADMIN) return true;

    return user.id === cocktail.userId;
  }
}
