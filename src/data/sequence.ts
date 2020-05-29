import { Schema } from "./schema";

export class Sequence extends Schema {
    start: Number;
    min: Number;
    step: Number;
    name: String;
    ownerTable: String;
    ownerColumn: String;

    constructor(start: Number, min: Number, step: Number, name: String, ownerTable: String, ownerColumn: String, schemaName: String) {
        super(schemaName);
        this.start = start;
        this.min = min;
        this.step = step;
        this.name = name;
        this.ownerTable = ownerTable;
        this.ownerColumn = ownerColumn;
    }
}