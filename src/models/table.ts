import { Schema } from "./schema";

export class Table extends Schema {
    tablename: string;
    haslobs:boolean;

    constructor(tablename: string,haslob:boolean, schemaname: string) {
        super(schemaname);
        this.haslobs=haslob;
        this.tablename = tablename;
    }
}