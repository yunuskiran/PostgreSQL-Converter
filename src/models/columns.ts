import { Table } from "./table";

export class Columns extends Table {
    name: string;
    typeSchema: string;
    type: string;
    qual: string;
    collate: string;
    isIdentity: boolean;
    isNull: boolean;
    defaultValue: string;
    position: number;

    constructor(name: string, typeSchema: string, type: string, qual: string,
        collate: string, isIdentity: boolean, isNull: boolean, defaultValue: string, position: number, tablename: string, haslobs: boolean, schemaname: string) {
        super(tablename, haslobs, schemaname);
        this.name = name;
        this.typeSchema = typeSchema;
        this.type = type;
        this.qual = qual;
        this.collate = collate;
        this.isIdentity = isIdentity;
        this.isNull = isNull;
        this.defaultValue = defaultValue;
        this.position = position;
    }
}