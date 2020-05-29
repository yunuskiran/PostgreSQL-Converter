import { Schema } from "./schema";

export class View extends Schema {
    name: string;
    supplement: string;
    constructor(name: string, supplement: string, schemaname: string) {
        super(schemaname);
        this.name = name;
        this.supplement = supplement;
    }
}