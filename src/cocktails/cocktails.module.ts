import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CocktailsService } from "./cocktails.service.js";
import { CocktailsController } from "./cocktails.controller.js";

@Module({
    controllers: [ CocktailsController ],
    providers: [ CocktailsService ],
    imports: [ TypeOrmModule.forFeature() ],
})
export class CocktailsModule { }