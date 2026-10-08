import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import { CocktailsService } from "./cocktails.service.js";
import { Cocktail } from "../entities/cocktail.entity.js";

@Controller("cocktails")
export class CocktailsController {
    constructor(
        private readonly cocktailsService: CocktailsService
    ) {}

    @Get()
    findAll(): Promise<Cocktail[]> {
        return this.cocktailsService.findAll();
    }

    // @Post()
    // create(@Body() body: CreateCocktailDto): Promise<Cocktail> {

    // }

    // @Patch
    // update() {

    // }

    @Delete(":id")
    async delete(@Param('id') id: string) {
        if (!await this.cocktailsService.remove(id))
            throw new HttpException("Cocktail not found.", HttpStatus.NOT_FOUND);
    }
}