import { Column } from "../data/column";
var items: Array<Column>;
export interface IColumnService {
    add(item: Column): void;
}

export class ColumnService implements IColumnService {
    constructor() {
        if (!items) {
            items = new Array<Column>();
        }
    }

    add(item: Column): void {
        items.push(item);
    }

}