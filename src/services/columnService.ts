import { Column } from "../data/column";

var items: Array<Column>;
export interface IColumnService {
    add(item: Column): void;
    count(): number;
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

    count(): number {
        return items.length;
    }
}

