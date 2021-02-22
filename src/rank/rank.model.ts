import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class Rank extends Model {
    @Column 
    nickname: string;

    @Column 
    score: number;

    @Column 
    stage: number;

    @Column 
    subcha: number;
}