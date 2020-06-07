import { Table } from "../data/table";
import { Line } from "../data/line";
import * as constants from '../common/constant';

var items: Array<Table>;
export interface ITableService {
    add(item: Table): void;
    clear(item: Line): Line;
    convert(item: Line): Table;
    lastOrDefault(): Table;
}

export class TableService implements ITableService {
    constructor() {
        if (!items) {
            items = new Array<Table>();
        }
    }

    convert(line: Line): Table {
        var table: Table = { name: 'undefined', schema: { name: 'undefined' } };
        var result = constants.tableExpression.executeReturnArray(line.item);
        if (result) {
            table = { name: result[1], schema: { name: result[2] } };
        }

        return table;
    }

    clear(line: Line): Line {
        line.item = line.item.toLowerCase();
        return line;
    }

    add(item: Table): void {
        items.push(item);
    }

    lastOrDefault(): Table {
        return items[items.length - 1];
    }
}