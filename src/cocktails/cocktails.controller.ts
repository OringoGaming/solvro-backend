import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  SerializeOptions,
} from '@nestjs/common';
import { CocktailsService } from './cocktails.service.js';
import { Cocktail } from '../entities/cocktail.entity.js';
import { createCocktailSchema } from './dto/createCocktail.dto.js';
import type { CreateCocktailDto } from './dto/createCocktail.dto.js';
import { updateCocktailSchema } from './dto/updateCocktail.dto.js';
import type { UpdateCocktailDto } from './dto/updateCocktail.dto.js';
import {
  CocktailResponseDto,
  cocktailResponseSchema,
  cocktailToDto,
} from './dto/cocktailResponse.dto.js';
import z from 'zod';
import {
  CocktailsPageDto,
  cocktailsPageSchema,
} from './dto/cocktailsPage.dto.js';
import { paginationSchema } from '../shared/pagination.dto.js';
import type { PaginationDto } from '../shared/pagination.dto.js';

@Controller('cocktails')
export class CocktailsController {
  constructor(private readonly cocktailsService: CocktailsService) {}

  @Get()
  @SerializeOptions({ schema: cocktailsPageSchema })
  async page(
    @Query({ schema: paginationSchema }) { pageSize, page }: PaginationDto,
  ): Promise<CocktailsPageDto> {
    const cocktailPage = await this.cocktailsService.findPaginated(
      pageSize,
      page * pageSize,
    );

    return {
      cocktails: cocktailPage.cocktails.map(cocktailToDto),
      pageCount: Math.max(1, Math.ceil(cocktailPage.total / pageSize)),
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @SerializeOptions({ schema: cocktailResponseSchema })
  async create(
    @Body({ schema: createCocktailSchema })
    body: CreateCocktailDto,
  ): Promise<CocktailResponseDto> {
    const cocktail = {
      name: body.name,
      instruction: body.instruction,
      categoryId: body.categoryId,
      cocktailIngredients: body.ingredients.map((ingredient) => {
        return {
          ingredientId: ingredient.id,
          unit: ingredient.unit,
          amount: ingredient.amount.toString(),
        };
      }),
    };
    return cocktailToDto(await this.cocktailsService.create(cocktail));
  }

  @Get(':id')
  @SerializeOptions({ schema: cocktailResponseSchema })
  async get(
    @Param('id', { schema: z.uuid() }) id: string,
  ): Promise<CocktailResponseDto> {
    const res = await this.cocktailsService.find(id);
    if (res == null) throw new NotFoundException('Cocktail not found.');

    return cocktailToDto(res);
  }

  @Patch(':id')
  @SerializeOptions({ schema: cocktailResponseSchema })
  async update(
    @Param('id', { schema: z.uuid() }) id: string,
    @Body({ schema: updateCocktailSchema })
    body: UpdateCocktailDto,
  ): Promise<CocktailResponseDto> {
    const result = await this.cocktailsService.update(id, body);
    if (!result) throw new NotFoundException('Cocktail not found.');

    return cocktailToDto(result);
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    if (!(await this.cocktailsService.remove(id)))
      throw new NotFoundException('Cocktail not found.');
  }
}
