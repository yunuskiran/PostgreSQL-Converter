import { Schema } from "./schema";

export class Table extends Schema {
    tableName: string;
    hasLobs: boolean;

    constructor(tableName: string, hasLobs: boolean, schemaName: string) {
        super(schemaName);
        this.hasLobs = hasLobs;
        this.tableName = tableName;
    }
}