import { ExpressionInterface } from "./expressionInterface";

export class SequenceExpression implements ExpressionInterface {
    do(): string {
        return "sequenceExpression";
    }
}