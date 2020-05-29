import { Table } from "./table";

export class Constraint extends Table {
    name: string;
    type: string;
    cols: string;
    constructor(name: string, type: string, cols: string, schemaName: string, tableName: string) {
        super(tableName, false, schemaName);
        this.name = name;
        this.type = type;
        this.cols = cols;
    }
}