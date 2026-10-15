import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Query,
  SerializeOptions,
  UnprocessableEntityException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  IngredientsFilter,
  IngredientsService,
} from './ingredients.service.js';
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
} from '../shared/dto/pagination.dto.js';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { IngredientsPolicy } from './ingredients.policy.js';
import { Can } from '@nestjs/authorization';
import { Public } from '@nestjs/authentication';
import type { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { IngredientsFilterDto, ingredientsFilterSchema } from './dto/ingredientsFilter.dto.js';

@ApiTags('ingredients')
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Returns an page of ingredients' })
  @ApiOkResponse({
    description: 'The amount of pages and the ingredients in the page',
    standardSchema: ingredientsPageSchema,
  })
  @SerializeOptions({ schema: ingredientsPageSchema })
  async page(
    @Query({ schema: z.intersection(paginationSchema, ingredientsFilterSchema) })
    {
      pageSize,
      page,
      name,
      alcoholic,
      sort,
    }: PaginationDto & IngredientsFilterDto,
  ): Promise<IngredientsPageDto> {
    const { ingredients, total } = await this.ingredientsService.findPaginated({
      take: pageSize,
      skip: page * pageSize,
      name,
      alcoholic,
      sort,
    });

    return {
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
      ingredients,
    };
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Returns an ingredient' })
  @ApiOkResponse({
    description: 'The ingredient',
    standardSchema: ingredientResponseSchema,
  })
  @ApiNotFoundResponse({
    description: 'No ingredient with the id',
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
  @ApiForbiddenResponse({
    description: 'If the logged in user is not an admin.',
  })
  @ApiOperation({ summary: 'Creates an ingredient' })
  @ApiCreatedResponse({
    description: 'The created ingredient',
    standardSchema: ingredientResponseSchema,
  })
  @SerializeOptions({ schema: ingredientResponseSchema })
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
  @ApiForbiddenResponse({
    description: 'If the logged in user is not an admin.',
  })
  @ApiOkResponse({
    description: 'The updated ingredient',
    standardSchema: ingredientResponseSchema,
  })
  @ApiNotFoundResponse({
    description: 'No ingredient with the id',
  })
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
  @ApiNoContentResponse({ description: 'The ingredient has been deleted' })
  @ApiForbiddenResponse({
    description: 'If the logged in user is not an admin.',
  })
  @ApiNotFoundResponse({ description: 'No ingredient with the id' })
  async delete(@Param('id', { schema: z.uuid() }) id: string) {
    if (!(await this.ingredientsService.remove(id)))
      throw new NotFoundException('Ingredient not found.');
  }

  //TODO: file uplaod
  @Post(':id/image')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @Can(IngredientsPolicy, 'edit')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'The image was saved.' })
  @ApiBody({
    description: 'An image of the ingredient.',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiNotFoundResponse({ description: 'If the ingredient is not found.' })
  @ApiUnprocessableEntityResponse({
    description:
      'If the file is neither a png nor a jpeg or is over 2mb in size.',
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('id', { schema: z.uuid() }) id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 2 * 1024 * 1024 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ) {
    // const res = await this.ingredientsService.update(id, {
    //   image: {
    //     mimeType: file.mimetype,
    //     data: file.buffer,
    //   },
    // });
    // if (res == null) throw new NotFoundException('Ingredient not found.');
    // console.log(JSON.stringify(res));
    // return res;
  }

  // @HttpCode(HttpStatus.NO_CONTENT)
  // @ApiBearerAuth()
  // @ApiNotFoundResponse({ description: 'If the ingredient is not found.' })
  // @Delete(':id/image')
  // @Can(IngredientsPolicy, 'edit')
  // @SerializeOptions({ schema: ingredientResponseSchema })
  // async deleteImage(@Param('id', { schema: z.uuid() }) id: string) {
  //   const res = await this.ingredientsService.update(id, { image: null });
  //   if (res == null) throw new NotFoundException('Ingredient not found.');
  // }
}
