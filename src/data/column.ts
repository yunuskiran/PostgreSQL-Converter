import { Table } from "./table";

export interface Column {
    name: string;
    typeSchema: string;
    type: string;
    qual: string;
    collate: string;
    isIdentity: boolean;
    isNull: boolean;
    defaultValue: string;
    table: Table;
}