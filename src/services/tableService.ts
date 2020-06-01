import { Table } from "../data/table";
var items: Array<Table>;
export interface ITableService {
    add(item: Table): void;
}

export class TableService implements ITableService {
    constructor() {
        if (!items) {
            items = new Array<Table>();
        }
    }

    add(item: Table): void {
        items.push(item);
    }

}