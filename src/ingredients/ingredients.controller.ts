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
import { updateIngredientSchema } from './dto/updateIngredient.dto.js';
import type { UpdateIngredientDto } from './dto/updateIngredient.dto.js';
import {
  paginationSchema,
  type PaginationDto,
} from '../shared/pagination.dto.js';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ConstraintSchema } from '../shared/dbConstraints.js';
import { IngredientsPolicy } from './ingredients.policy.js';
import { Can } from '@nestjs/authorization';
import { Public } from '@nestjs/authentication';

@ApiTags('ingredients')
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Returns an page of ingredients' })
  @ApiResponse({
    description: 'The amount of pages and the ingredients in the page',
    status: HttpStatus.OK,
    standardSchema: ingredientsPageSchema,
  })
  @SerializeOptions({ schema: ingredientsPageSchema })
  async page(
    @Query({ schema: paginationSchema }) { pageSize, page }: PaginationDto,
  ): Promise<IngredientsPageDto> {
    const { ingredients, total } = await this.ingredientsService.findPaginated(
      pageSize,
      page * pageSize,
    );

    return {
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
      ingredients,
    };
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Returns an ingredient' })
  @ApiResponse({
    description: 'The ingredient',
    status: HttpStatus.OK,
    standardSchema: ingredientResponseSchema,
  })
  @ApiResponse({
    description: 'No ingredient with the id',
    status: HttpStatus.NOT_FOUND,
  })
  @SerializeOptions({ schema: ingredientResponseSchema })
  async get(
    @Param('id', { schema: z.uuid() }) id: string,
  ): Promise<IngredientResponseDto> {
    const resp = await this.ingredientsService.find(id);
    if (resp === null) throw new NotFoundException('Ingredient not found.');
    return resp;
  }

  @Post()
  @ApiBearerAuth()
  @Can(IngredientsPolicy, 'edit')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    description: 'If the logged in user is not an admin.',
    status: HttpStatus.FORBIDDEN,
  })
  @ApiOperation({ summary: 'Creates an ingredient' })
  @ApiResponse({
    description: 'The created ingredient',
    status: HttpStatus.CREATED,
    standardSchema: ingredientResponseSchema,
  })
  @SerializeOptions({ schema: ingredientResponseSchema })
  @ConstraintSchema(createIngredientSchema)
  create(
    @Body({ schema: createIngredientSchema })
    body: CreateIngredientDto,
  ): Promise<IngredientResponseDto> {
    return this.ingredientsService.create(body);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Can(IngredientsPolicy, 'edit')
  @SerializeOptions({ schema: ingredientResponseSchema })
  @ApiOperation({ summary: 'Updates an ingredient' }) 
  @ApiResponse({
    description: 'If the logged in user is not an admin.',
    status: HttpStatus.FORBIDDEN,
  })
  @ApiResponse({
    description: 'The updated ingredient',
    status: HttpStatus.OK,
    standardSchema: ingredientResponseSchema,
  })
  @ApiResponse({
    description: 'No ingredient with the id',
    status: HttpStatus.NOT_FOUND,
  })
  @ConstraintSchema(updateIngredientSchema)
  async update(
    @Param('id', { schema: z.uuid() }) id: string,
    @Body({ schema: updateIngredientSchema })
    body: UpdateIngredientDto,
  ): Promise<IngredientResponseDto> {
    const res = await this.ingredientsService.update(id, body);
    if (res === null) throw new NotFoundException('Ingredient not found.');
    return res;
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Can(IngredientsPolicy, 'edit')
  @ApiOperation({ summary: 'Deletes an ingredient' })
  @ApiResponse({
    description: 'The ingredient has been deleted',
    status: HttpStatus.NO_CONTENT,
  })
  @ApiResponse({
    description: 'If the logged in user is not an admin.',
    status: HttpStatus.FORBIDDEN,
  })
  @ApiResponse({
    description: 'No ingredient with the id',
    status: HttpStatus.NOT_FOUND,
  })
  async delete(@Param('id', { schema: z.uuid() }) id: string) {
    if (!(await this.ingredientsService.remove(id)))
      throw new NotFoundException('Ingredient not found.');
  }

  //TODO: file uplaod
}
