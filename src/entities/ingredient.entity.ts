import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import type { CocktailIngredient } from "./cocktailIngredient.entity.js";

//TODO: change text to varchar
@Entity()
export class Ingredient {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column({type: "text"})
    name: string;
    @Column({type: "text"})
    description: string;
    @Column({type: "bool"})
    alcoholic: boolean;
    @Column({type: "text"})
    relativeUrl: string;

    @OneToMany(
        "CocktailIngredient",
        (cocktailIngredient: CocktailIngredient) => cocktailIngredient.ingredient,
    )
    cocktailIngredients: CocktailIngredient[]
}