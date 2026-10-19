import { CurrentUser, Public } from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  SerializeOptions,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import z from 'zod';
import { Cocktail } from '../entities/cocktail.entity.js';
import { User } from '../entities/user.entity.js';
import type { PaginationDto } from '../shared/dto/pagination.dto.js';
import { paginationSchema } from '../shared/dto/pagination.dto.js';
import { CocktailsPolicy } from './cocktails.policy.js';
import { CocktailInput, CocktailsService } from './cocktails.service.js';
import {
  CocktailResponseDto,
  cocktailResponseSchema,
} from './dto/cocktailResponse.dto.js';
import {
  CocktailsFilterDto,
  cocktailsFilterSchema,
} from './dto/cocktailsFilter.dto.js';
import {
  CocktailsPageDto,
  cocktailsPageSchema,
} from './dto/cocktailsPage.dto.js';
import {
  createCocktailSchema,
  type CreateCocktailDto,
} from './dto/createCocktail.dto.js';
import {
  updateCocktailSchema,
  type UpdateCocktailDto,
} from './dto/updateCocktail.dto.js';

function dtoToCocktailInput(
  dto: UpdateCocktailDto | CreateCocktailDto,
): CocktailInput {
  return {
    name: dto.name,
    instruction: dto.instruction,
    categoryId: dto.categoryId,
    cocktailIngredients: dto.ingredients?.map((ingredient) => {
      return {
        ingredientId: ingredient.id,
        unit: ingredient.unit,
        amount: ingredient.amount.toString(),
      };
    }),
  };
}

function cocktailToDto(cocktail: Cocktail): CocktailResponseDto {
  return {
    id: cocktail.id,
    name: cocktail.name,
    instruction: cocktail.instruction,
    category: cocktail.category,
    ingredients: cocktail.cocktailIngredients.map((ci) => {
      return {
        id: ci.ingredientId,
        name: ci.ingredient.name,
        alcoholic: ci.ingredient.alcoholic,
        description: ci.ingredient.description,
        unit: ci.unit,
        amount: parseFloat(ci.amount),
      };
    }),
    user: {
      id: cocktail.userId,
      email: cocktail.user.email,
    },
  };
}

@Controller('cocktails')
export class CocktailsController {
  constructor(private readonly cocktailsService: CocktailsService) {}

  @Get()
  @Public()
  @SerializeOptions({ schema: cocktailsPageSchema })
  @ApiOperation({
    summary:
      'Returns a page of cocktails and the amount of pages filtered and sorted by the specified options.',
  })
  @ApiOkResponse({ summary: 'The page', standardSchema: cocktailsPageSchema })
  async page(
    @Query({ schema: z.intersection(paginationSchema, cocktailsFilterSchema) })
    {
      pageSize,
      page,
      name,
      alcoholic,
      ingredientIds,
      userId,
      instruction,
      categoryIds,
      sort,
      sortDir
    }: PaginationDto & CocktailsFilterDto,
  ): Promise<CocktailsPageDto> {
    const cocktailPage = await this.cocktailsService.findPaginated({
      take: pageSize,
      skip: page * pageSize,
      userId,
      ingredientIds,
      name,
      alcoholic,
      instruction,
      categoryIds,
      sort,
      sortDir
    });

    return {
      cocktails: cocktailPage.cocktails.map(cocktailToDto),
      pageCount: Math.max(1, Math.ceil(cocktailPage.total / pageSize)),
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Can(CocktailsPolicy, 'create')
  @SerializeOptions({ schema: cocktailResponseSchema })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Creates a new cocktail.' })
  @ApiCreatedResponse({
    summary: 'The cocktail was created.',
    standardSchema: cocktailResponseSchema,
  })
  @ApiUnprocessableEntityResponse({
    summary:
      'If the category does not exist or one of the ingredients does not exist.',
  })
  @ApiConflictResponse({ summary: 'If the cocktail name is taken.' })
  async create(
    @CurrentUser() user: User,
    @Body({ schema: createCocktailSchema })
    body: CreateCocktailDto,
  ): Promise<CocktailResponseDto> {
    return cocktailToDto(
      await this.cocktailsService.create(dtoToCocktailInput(body), user),
    );
  }

  @Public()
  @Get(':id')
  @SerializeOptions({ schema: cocktailResponseSchema })
  @ApiOperation({ summary: 'Returns a cocktail with the id.' })
  @ApiOkResponse({
    summary: 'The cocktail.',
    standardSchema: cocktailResponseSchema,
  })
  @ApiNotFoundResponse({ summary: 'If there is no cocktail with the id.' })
  async get(
    @Param('id', { schema: z.uuid() }) id: string,
  ): Promise<CocktailResponseDto> {
    const res = await this.cocktailsService.find(id);
    if (res === null) throw new NotFoundException('Cocktail not found.');

    return cocktailToDto(res);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  //Checked in cocktailService
  @Can.Anyone() 
  @SerializeOptions({ schema: cocktailResponseSchema })
  @ApiOperation({ summary: 'Updates a cocktail with the id.' })
  @ApiNotFoundResponse({ summary: 'If there is no cocktail with the id.' })
  @ApiOkResponse({
    summary: 'The cocktail has been updated.',
    standardSchema: cocktailResponseSchema,
  })
  @ApiForbiddenResponse({
    summary: "If the user is not an admin or isn't an owner of the cocktail.",
  })
  @ApiBearerAuth()
  @ApiUnprocessableEntityResponse({
    summary:
      'If the category does not exist or one of the ingredients does not exist.',
  })
  @ApiConflictResponse({ summary: 'If the cocktail name is taken.' })
  async update(
    @Param('id', { schema: z.uuid() }) id: string,
    @Body({ schema: updateCocktailSchema })
    body: UpdateCocktailDto,
    @CurrentUser() user: User | null
  ): Promise<CocktailResponseDto> {
    const result = await this.cocktailsService.update(
      id,
      dtoToCocktailInput(body),
      user,
    );
    if (result === null) throw new NotFoundException('Cocktail not found.');

    return cocktailToDto(result);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  //checked in cocktails service.
  @Can.Anyone()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletes a cocktail with the id.' })
  @ApiNotFoundResponse({ summary: 'If the cocktail does not exist.' })
  @ApiNoContentResponse({
    summary: 'If the cocktail was deleted successfully.',
  })
  async delete(@Param('id', { schema: z.uuid() }) id: string,
    @CurrentUser() user: User | null) {
    if (!(await this.cocktailsService.remove(id, user)))
      throw new NotFoundException('Cocktail not found.');
  }
}
