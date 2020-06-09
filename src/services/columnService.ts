import { Column } from "../data/column";
import { Line } from "../data/line";
import { TableService } from "./tableService";
import * as constants from '../common/constant';
import { Table } from "../data/table";
import { ColumnTypes } from "../data/columntypes";
import { SequenceService } from "./sequenceService";

var items: Array<Column>;
var columnTypes: ColumnTypes;
export interface IColumnService {
    add(item: Column): void;
    count(): number;
    clear(item: Line): Line;
    convert(item: Line): Column;
}

export class ColumnService implements IColumnService {
    constructor() {
        if (!items) {
            items = new Array<Column>();
        }

        columnTypes = new ColumnTypes();
    }

    convert(line: Line): Column {
        var tableService: TableService = new TableService();
        var table = tableService.lastOrDefault();
        var column: Column = {
            name: 'undefined',
            typeSchema: 'undefined',
            type: 'undefined',
            qual: 'undefined',
            collate: 'undefined',
            isIdentity: false,
            isNull: false,
            defaultValue: '',
            table: table
        };

        var result = constants.columnExpression.executeReturnArray(line.item);
        if (result) {
            column.name = result[1];
            column.typeSchema = result[2];
            column.qual = this.qual(result[4]);
            column.type = this.toType(this.type(column.typeSchema, result[3]), column.qual);
            column.collate = result[5];
            column.isIdentity = this.isIdentity(result[6], table);
            column.isNull = this.isNull(result[7]);
            column.defaultValue = column.isIdentity ? `nextval('${this.format_identifier(table.schema.name.toLowerCase())}.${table.name}_${column.name}_seq')` : '';

            if (column.isIdentity) {
                var sequenceService = new SequenceService();
                var sequence = sequenceService.convertFromIdentity(result[6], column);
                sequenceService.add(sequence);
            }

            if (column.type === 'bytea' || column.type === 'ntext') {
                tableService.setHasLobs(table);
            }
        }

        return column;
    }

    clear(line: Line): Line {
        line.item = line.item.toLowerCase();
        return line;
    }

    add(item: Column): void {
        items.push(item);
    }

    count(): number {
        return items.length;
    }

    isIdentity(expression: string, table: Table): boolean {
        var isIdentity = false;
        if (expression) {
            if (constants.identiyExpression.test(expression)) {
                var identityItems = constants.identiyExpression.executeReturnArray(expression);
                if (identityItems !== null) {
                    isIdentity = true;
                }
            }
        }

        return isIdentity;
    }

    isNull(expression: string): boolean {
        return expression === constants.notNull;
    }

    type(typeSchema: string, expression: string): string {
        if (typeSchema) {
            return `${typeSchema}.${expression}`;
        }

        return expression;
    }

    qual(expression: string): string {
        var temp = '';
        if (expression) {
            if (expression === constants.xml) {
                temp = constants.undefined;
            }
            else if (expression === constants.max) {
                temp = constants.undefined;
            }
            else {
                if (!constants.columnQualExpression.test(expression.toString())) {
                    temp = constants.undefined;
                } else {
                    temp = constants.columnQualExpression.execute(expression, 1);
                }
            }
        }

        return temp;
    }

    format_identifier(item: string): string {
        var value = item.replace('"', '');
        return `"${value}"`;
    }

    //TODO:REFACTOR
    toType(type: string, qual: string) {
        let tempType: string = '';
        if (type) {
            if (columnTypes.findType(type)) {
                if ((qual && columnTypes.findUnqualType(columnTypes.findType(type)) !== null) || !qual) {
                    tempType = columnTypes.findType(type);
                } else if (qual) {
                    tempType = `${columnTypes.findType(type)}.${qual}`;
                }
            } else if (type === constants.bit && !qual) {
                tempType = constants.boolean;
            } else if (type === constants.ntext && !qual) {
                tempType = constants.text;
            } else if (type === constants.numeric) {
                if (!qual) {
                    tempType = constants.numeric;
                } else if (constants.columnQualExpresion.test(qual.toString())) {
                    tempType = `${constants.numeric}(${qual})`;
                } else if (this.convertNumericToInt(qual)) {
                    tempType = this.convertNumericToInt(qual);
                } else {
                    tempType = `${constants.numeric}(${qual})`;
                }
            } else if (type === constants.sysname) {
                tempType = constants.varchar128;
            } else if (constants.geometryColumnExpression.test(type.toString())) {
                tempType = type.toLowerCase();
            } else if (type === constants.sqlVariant) {
                tempType = constants.text;
            } else {
                tempType = constants.emptyString;
            }

            if (constants.typeColumnExpression.test(type.toString())) {
                tempType = `${tempType}.[]`;
            }
        }

        return tempType;
    }

    convertNumericToInt(qual: string) {
        var numericRegex = constants.numericExpression;
        if (!numericRegex.test(qual.toString())) {
            return constants.numeric;
        } else {
            var items = numericRegex.executeReturnArray(qual);
            if (items !== null) {
                var precision = items[1];
                if (Number(precision) <= constants.precisionFour) {
                    return constants.smallInt;
                } else if (Number(precision) <= constants.precisionNine) {
                    return constants.integer;
                } else if (Number(precision) <= constants.precisionEighteen) {
                    return constants.bigInt;
                }
            }
        }

        return `${constants.numeric}${qual}`;
    }
}

