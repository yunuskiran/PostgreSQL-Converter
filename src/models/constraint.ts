import { Table } from "./table";

export class Constraint extends Table {
    name: string;
    type: string;
    cols: string;
    constructor(name: string, type: string, cols: string, schemaname: string, tablename: string) {
        super(tablename, false, schemaname);
        this.name = name;
        this.type = type;
        this.cols = cols;
    }
}