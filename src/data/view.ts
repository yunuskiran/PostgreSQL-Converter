import { Schema } from "./schema";

export class View extends Schema {
    name: string;
    supplement: string;
    constructor(name: string, supplement: string, schemaName: string) {
        super(schemaName);
        this.name = name;
        this.supplement = supplement;
    }
}