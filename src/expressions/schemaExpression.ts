import { ExpressionInterface } from "./expressionInterface";

export class SchemaExpression implements ExpressionInterface {
    do(): string {
        return "schemaExpression";
    }
}