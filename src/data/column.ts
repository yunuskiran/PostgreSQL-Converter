import { Table } from "./table";

export interface Column extends Table {
    name: string;
    typeSchema: string;
    type: string;
    qual: string;
    collate: string;
    isIdentity: boolean;
    isNull: boolean;
    defaultValue: string;
    position: number;
}