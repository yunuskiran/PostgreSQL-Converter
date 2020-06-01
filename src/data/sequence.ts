import { Table } from "./table";

export interface Sequence extends Table {
    start: Number;
    min: Number;
    step: Number;
    name: string;
    ownerTable: string;
    ownerColumn: string;
}