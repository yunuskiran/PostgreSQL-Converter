import { ExpressionInterface } from "../expressions/expressionInterface";
import { tableExpression, schemaExpression, columnExpression, sequenceExpression, viewExpression } from "../common/constant";
import { TableExpression } from "../expressions/tableExpression";
import { SchemaExpression } from "../expressions/schemaExpression";
import { ColumnExpression } from "../expressions/columnExpression";
import { SequenceExpression } from "../expressions/sequenceExpression";
import { ViewExpression } from "../expressions/viewExpression";

export class RegexMapper {
    items: Map<RegExp, ExpressionInterface>;
    constructor() {
        this.items = new Map<RegExp, ExpressionInterface>();
        this.items.set(tableExpression, new TableExpression());
        this.items.set(schemaExpression, new SchemaExpression());
        this.items.set(columnExpression, new ColumnExpression());
        this.items.set(sequenceExpression, new SequenceExpression());
        this.items.set(viewExpression, new ViewExpression());
    }

    operate(lineString: string): void {
        for (let key of this.items.keys()) {
            if (key.test(lineString)) {
                if (this.items.get(key) !== null) {
                    this.items.get(key).do();
                }
            }
        }
    }
}