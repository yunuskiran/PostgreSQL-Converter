import { Columns } from "./Columns";

export class Table {
    name: string;
    columns: Array<Columns>;

    constructor(name: string, columns: Columns[]) {
        this.name = name;
        this.columns = columns;
    }
}