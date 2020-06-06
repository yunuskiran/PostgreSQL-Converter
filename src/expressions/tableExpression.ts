import { ExpressionInterface } from "./expressionInterface";

export class TableExpression implements ExpressionInterface {
    do(): string {
        return "tableExpression";
    }
}