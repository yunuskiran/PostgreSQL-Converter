import { Sequence } from "../data/Sequence";
import * as constants from '../common/constant';
import { Column } from "../data/column";


var items: Array<Sequence>;
export interface ISequenceService {
    add(item: Sequence): void;
    clear(item: string): string;
    convertFromIdentity(expression: string, column: Column): Sequence;
}

export class SequenceService implements ISequenceService {
    constructor() {
        if (!items) {
            items = new Array<Sequence>();
        }
    }

    clear(item: string): string {
        throw new Error("Method not implemented.");
    }

    add(item: Sequence): void {
        items.push(item);
    }

    convertFromIdentity(expression: string, column: Column): Sequence {
        var sequence: Sequence = {
            min: 0,
            name: 'undefined',
            step: 0,
            start: 0,
            column: column
        };

        if (constants.identiyExpression.test(expression)) {
            var result = constants.identiyExpression.executeReturnArray(expression);
            if (result) {
                sequence.start = Number(result[1]);
                sequence.step = Number(result[2]);
                sequence.name = `${column.table.name}_${column.name}_seq`.toLowerCase();
                sequence.min = Number(result[1]);
            }
        }

        return sequence;
    }
}