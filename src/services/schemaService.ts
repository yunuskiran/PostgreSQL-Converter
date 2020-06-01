import { Schema } from "../data/schema";

var items: Array<Schema>;
export interface ISchemaService {
    add(item: Schema): void;
}

export class SchemaService implements ISchemaService {
    constructor() {
        if (!items) {
            items = new Array<Schema>();
        }
    }

    add(item: Schema): void {
        items.push(item);
    }
}