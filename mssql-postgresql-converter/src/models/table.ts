import { Schema } from "./schema";

export class Table extends Schema {
    tablename: string;

    constructor(tablename: string, schemaname: string) {
        super(schemaname);
        this.tablename = tablename;
    }
}