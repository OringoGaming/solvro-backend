import { Body, Delete, Get, Injectable, Param, Post } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { Cocktail } from "../entities/cocktail.entity.js";
import type { CreateCocktailDto } from "./dto/createCocktail.dto.js";

@Injectable()
export class CocktailsService {
  constructor(
    private readonly entityManager: EntityManager
  ) {}

  findAll(): Promise<Cocktail[]> {
    return this.entityManager.find(Cocktail);
  }

  async remove(id: string): Promise<boolean> {
    const res = await this.entityManager
      .createQueryBuilder()
      .delete()
      .from(Cocktail)
      .whereInIds(id)
      .execute();
    return res.affected ? true : false;
  }
}