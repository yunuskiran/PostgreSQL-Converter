import { ExpressionInterface } from "./expressionInterface";
import { Line } from "../data/line";
import { ColumnService } from "../services/columnService";

export class ColumnExpression implements ExpressionInterface {
    do(line: Line): void {
        var columnService = new ColumnService();
        var tempLine = columnService.clear(line);
        
    }
}