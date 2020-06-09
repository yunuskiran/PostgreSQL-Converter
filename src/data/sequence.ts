import { Column } from "./column";

export interface Sequence {
    start: Number;
    min: Number;
    step: Number;
    name: string;
    column: Column;
}