import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import type { CocktailCategory } from "./cocktailCategory.entity.js";
import type { CocktailIngredient } from "./cocktailIngredient.entity.js";

@Entity()
export class Cocktail {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column({type: "text"})
    name: string;

    @Column({type: "text"})
    instruction: string;
    @ManyToOne(
        "CocktailCategory",
        (category: CocktailCategory) => category.cocktails,
        {
            onDelete: "RESTRICT"
        }
    )
    category: CocktailCategory

    @OneToMany(
        "CocktailIngredient",
        (ingredient: CocktailIngredient) => ingredient.cocktail, 
        {
            cascade: true
        }
    )
    cocktailIngredients: CocktailIngredient[];
}