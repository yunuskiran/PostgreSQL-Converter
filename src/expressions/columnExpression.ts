import { ExpressionInterface } from "./expressionInterface";

export class ColumnExpression implements ExpressionInterface {
    do(): string {
        return "schemaExpression";
    }
}