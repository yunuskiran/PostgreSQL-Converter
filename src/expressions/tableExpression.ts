import { ExpressionInterface } from "./expressionInterface";
import { TableService } from "../services/tableService";
import { Line } from "../data/line";

export class TableExpression implements ExpressionInterface {
    do(line: Line): void {
        var tableService = new TableService();
        line = tableService.clear(line);
        var tempTable = tableService.convert(line);
        tableService.add(tempTable);
    }
}