import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import type { Cocktail } from "./cocktail.entity.js";

@Entity()
export class CocktailCategory {
    @PrimaryGeneratedColumn("increment")
    id: number;
    @Column({type: "text"})
    name: string;
    @Column({type: "text"})
    description: string;
    
    @OneToMany(
        "Cocktail", (cocktail: Cocktail) => cocktail.category,
    )
    cocktails: Cocktail[];
}