import { ExpressionInterface } from "./expressionInterface";

export class ViewExpression implements ExpressionInterface {
    do(): string {
        return "viewExpression";
    }
}