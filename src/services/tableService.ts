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
        var table: Table = { name: 'undefined', hasLobs: false, schema: { name: 'undefined' } };
        var result = constants.tableExpression.executeReturnArray(line.item);
        if (result) {
            table = { name: result[1], hasLobs: false, schema: { name: result[2] } };
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

    find(table: Table) {
        var item = items.filter(_ => _.name === table.name && _.schema.name === table.schema.name);
        if (!item) {
            return undefined;
        }

        return item[0];
    }

    setHasLobs(table: Table) {
        var item = this.find(table);
        if (item) {
            item.hasLobs = true;
        }
    }
}