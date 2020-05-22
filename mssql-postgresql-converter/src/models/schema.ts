import { Table } from "./table";

export class Schema {
    name: string;
    tables: Array<Table>;

    constructor(name: string, tables: Table[]) {
        this.name = name;
        this.tables = tables;
    }
}