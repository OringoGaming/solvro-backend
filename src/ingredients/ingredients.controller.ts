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
  Put,
  Query,
  SerializeOptions,
  StreamableFile,
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
  ApiConflictResponse,
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
import {
  IngredientsFilterDto,
  ingredientsFilterSchema,
} from './dto/ingredientsFilter.dto.js';

@ApiTags('ingredients')
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Returns a page of ingredients' })
  @ApiOkResponse({
    description: 'The amount of pages and the ingredients in the page',
    standardSchema: ingredientsPageSchema,
  })
  @SerializeOptions({ schema: ingredientsPageSchema })
  async page(
    @Query({
      schema: z.intersection(paginationSchema, ingredientsFilterSchema),
    })
    {
      pageSize,
      page,
      name,
      description,
      alcoholic,
      sort,
      sortDir,
    }: PaginationDto & IngredientsFilterDto,
  ): Promise<IngredientsPageDto> {
    const { ingredients, total } = await this.ingredientsService.findPaginated({
      take: pageSize,
      skip: page * pageSize,
      name,
      description,
      alcoholic,
      sort,
      sortDir,
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
  @Can(IngredientsPolicy, 'edit')
  @HttpCode(HttpStatus.CREATED)
  @SerializeOptions({ schema: ingredientResponseSchema })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Creates an ingredient' })
  @ApiCreatedResponse({
    description: 'The created ingredient',
    standardSchema: ingredientResponseSchema,
  })
  @ApiForbiddenResponse({
    description: 'If the logged in user is not an admin.',
  })
  @ApiConflictResponse({
    description: "The ingredient's name is already taken.",
  })
  create(
    @Body({ schema: createIngredientSchema })
    body: CreateIngredientDto,
  ): Promise<IngredientResponseDto> {
    return this.ingredientsService.create(body);
  }

  @Patch(':id')
  @Can(IngredientsPolicy, 'edit')
  @SerializeOptions({ schema: ingredientResponseSchema })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Updates an ingredient' })
  @ApiConflictResponse({
    description: "The ingredient's name is already taken.",
  })
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
  @ApiConflictResponse({ description: 'The ingredient is used by cocktails.' })
  @ApiNoContentResponse({ description: 'The ingredient has been deleted' })
  @ApiForbiddenResponse({
    description: 'If the logged in user is not an admin.',
  })
  @ApiNotFoundResponse({ description: 'No ingredient with the id' })
  async delete(@Param('id', { schema: z.uuid() }) id: string) {
    if (!(await this.ingredientsService.remove(id)))
      throw new NotFoundException('Ingredient not found.');
  }

  @Put(':id/image')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @Can(IngredientsPolicy, 'edit')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseInterceptors(FileInterceptor('file'))
  @ApiNoContentResponse({ description: 'The image was saved.' })
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
  @ApiOperation({ summary: 'Uploads an ingredient image.' })
  @ApiNotFoundResponse({ description: 'If the ingredient is not found.' })
  @ApiUnprocessableEntityResponse({
    description:
      'If the file is neither a png nor a jpeg or is over 2mb in size.',
  })
  async upload(
    @Param('id', { schema: z.uuid() }) id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /^image\/(png|jpeg)$/ })
        .addMaxSizeValidator({ maxSize: 2 * 1024 * 1024 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ) {
    if (
      !(await this.ingredientsService.updateImage(id, {
        mimeType: file.mimetype,
        data: file.buffer,
      }))
    )
      throw new NotFoundException('Ingredient not found.');
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiNoContentResponse({
    description: 'If the image was deleted successfully.',
  })
  @ApiNotFoundResponse({
    description:
      'If the ingredient is not found or the ingredient does not have an image.',
  })
  @ApiOperation({ summary: 'Deletes an ingredient image.' })
  @Delete(':id/image')
  @Can(IngredientsPolicy, 'edit')
  async deleteImage(@Param('id', { schema: z.uuid() }) id: string) {
    const res = await this.ingredientsService.updateImage(id);
    if (!res) throw new NotFoundException('Image or ingredient not found.');
  }

  @HttpCode(HttpStatus.OK)
  @ApiNotFoundResponse({
    description:
      'If the ingredient does not have an image or it does not exist. ',
  })
  @ApiOkResponse({ description: 'The image of the ingredient.' })
  @Public()
  @ApiOperation({ summary: 'Gets the ingredient image.' })
  @Get(':id/image')
  async getImage(
    @Param('id', { schema: z.uuid() }) id: string,
  ): Promise<StreamableFile> {
    const image = await this.ingredientsService.findImage(id);
    if (image === null)
      throw new NotFoundException(
        'Ingredient does not exist or it does not have an image.',
      );

    return new StreamableFile(image.data, {
      type: image.mimeType,
    });
  }
}
