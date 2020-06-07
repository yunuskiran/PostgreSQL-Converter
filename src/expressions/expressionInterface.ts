import { Line } from "../data/line";

export interface ExpressionInterface {
    do(line: Line): void;
}