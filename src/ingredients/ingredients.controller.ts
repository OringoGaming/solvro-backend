import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  SerializeOptions,
} from '@nestjs/common';
import { IngredientsService } from './ingredients.service.js';
import { createIngredientSchema } from './dto/createIngredient.dto.js';
import type { CreateIngredientDto } from './dto/createIngredient.dto.js';
import {
  IngredientResponseDto,
  ingredientResponseSchema,
} from './dto/ingredientResponse.dto.js';
import z from 'zod';
import {
  IngredientsPageDto,
  ingredientsPageSchema,
} from './dto/ingredientsPage.dto.js';
import type { UpdateCocktailDto } from '../cocktails/dto/updateCocktail.dto.js';
import { updateCocktailSchema } from '../cocktails/dto/updateCocktail.dto.js';

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Get()
  @SerializeOptions({ schema: ingredientsPageSchema })
  async page(
    @Query('page', { schema: z.coerce.number().int().nonnegative() })
    page: number,
    @Query('pageSize', { schema: z.coerce.number().int().gte(1).lte(100) })
    pageSize: number,
  ): Promise<IngredientsPageDto> {
    const { ingredients, total } = await this.ingredientsService.findPaginated(
      pageSize,
      page * pageSize,
    );

    return { pageCount: Math.ceil(total / pageSize), ingredients };
  }

  @Get(':id')
  @SerializeOptions({ schema: ingredientResponseSchema })
  async get(
    @Param('id', { schema: z.uuid() }) id: string,
  ): Promise<IngredientResponseDto> {
    const resp = await this.ingredientsService.find(id);
    if (resp == null) throw new NotFoundException('Ingredient not found.');
    return resp;
  }

  @Post()
  @SerializeOptions({ schema: ingredientResponseSchema })
  create(
    @Body({ schema: createIngredientSchema }) body: CreateIngredientDto,
  ): Promise<IngredientResponseDto> {
    return this.ingredientsService.create(body);
  }

  @Patch(':id')
  @SerializeOptions({ schema: ingredientResponseSchema })
  async update(
    @Param('id', { schema: z.uuid() }) id: string,
    @Body({ schema: updateCocktailSchema }) body: UpdateCocktailDto,
  ): Promise<IngredientResponseDto> {
    const res = await this.ingredientsService.update(id, body);
    if (res == null) throw new NotFoundException('Ingredient not found.');
    return res;
  }

  @Delete(':id')
  async delete(@Param('id', { schema: z.uuid() }) id: string) {
    if (!(await this.ingredientsService.remove(id)))
      throw new NotFoundException('Ingredient not found.');
  }
}
