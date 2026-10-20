import { Policy } from "@nestjs/authorization";
import { User, UserRole } from "../entities/user.entity.js";

@Policy()
export class CategoriesPolicy {
  edit(user: User | null) {
    return user?.role === UserRole.ADMIN;
  }
}
