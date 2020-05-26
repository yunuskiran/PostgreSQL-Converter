import { Schema } from "./schema";

export class Sequence extends Schema {
    start: number;
    min: number;
    step: number;
    name: string;
    ownertable: string;
    onwercolumn: string;

    constructor(start: number, min: number, step: number, name: string, ownertable: string, ownercolumn: string, schemaname:string) {
        super(schemaname);
        this.start = start;
        this.min = min;
        this.step = step;
        this.name = name;
        this.ownertable = ownertable;
        this.onwercolumn = ownercolumn;
    }
}