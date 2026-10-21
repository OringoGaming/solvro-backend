import { Public } from '@nestjs/authentication';
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
  SerializeOptions,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import z from 'zod';
import { CategoriesPolicy } from './categories.policy.js';
import { CategoriesService } from './categories.service.js';
import type { CocktailCategoryResposeDto } from './dto/cocktailCategoryResponse.dto.js';
import { cocktailCategoryResponseSchema } from './dto/cocktailCategoryResponse.dto.js';
import {
  createCocktailCategorySchema,
  type CreateCocktailCategoryDto,
} from './dto/createCocktailCategory.dto.js';

@Controller('category')
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @SerializeOptions({ schema: cocktailCategoryResponseSchema })
  @Can(CategoriesPolicy, 'edit')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Creates a new cocktail category' })
  @ApiCreatedResponse({
    description: 'Returns the category.',
    standardSchema: cocktailCategoryResponseSchema,
  })
  @ApiConflictResponse({ description: 'If the category name is taken.' })
  @ApiForbiddenResponse({
    description: 'If the logged in user is not an admin.',
  })
  createCategory(
    @Body({ schema: createCocktailCategorySchema })
    body: CreateCocktailCategoryDto,
  ): Promise<CocktailCategoryResposeDto> {
    return this.categoryService.createCategory(body);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ schema: cocktailCategoryResponseSchema })
  @Public()
  @ApiOperation({ summary: 'Gets all categories.' })
  @ApiOkResponse({ description: 'All exisitng categories.' })
  async categories(): Promise<CocktailCategoryResposeDto[]> {
    return await this.categoryService.findCategories();
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ schema: cocktailCategoryResponseSchema })
  @Can(CategoriesPolicy, 'edit')
  @ApiOperation({ summary: 'Updates an existing category.' })
  @ApiOkResponse({
    description: 'Returns the category.',
    standardSchema: cocktailCategoryResponseSchema,
  })
  @ApiNotFoundResponse({
    description: 'If a category with the id does not exist.',
  })
  @ApiConflictResponse({ description: 'If the category name is taken.' })
  @ApiForbiddenResponse({
    description: 'If the logged in user is not an admin.',
  })
  async updateCategory(
    @Param({ schema: z.object({ id: z.coerce.number() }) }) id: number,
    @Body({ schema: createCocktailCategorySchema })
    body: CreateCocktailCategoryDto,
  ): Promise<CocktailCategoryResposeDto> {
    const result = await this.categoryService.updateCategory(id, body);
    if (result === null) throw new NotFoundException('Cocktail not found.');
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Can(CategoriesPolicy, 'edit')
  @ApiOperation({ summary: 'Deletes an existing category.' })
  @ApiNotFoundResponse({
    description: 'If a category with the id does not exist.',
  })
  @ApiConflictResponse({
    description: 'If the category is still in use by cocktails.',
  })
  @ApiForbiddenResponse({
    description: 'If the logged in user is not an admin.',
  })
  async deleteCategory(
    @Param({ schema: z.object({ id: z.coerce.number() }) }) id: number,
  ) {
    const result = await this.categoryService.deleteCategory(id);
    if (!result) throw new NotFoundException('Cocktail not found.');
  }
}
