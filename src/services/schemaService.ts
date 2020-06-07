import { Schema } from "../data/schema";

var items: Array<Schema>;
export interface ISchemaService {
    add(item: Schema): void;
    clear(item:string):string;
}

export class SchemaService implements ISchemaService {
    constructor() {
        if (!items) {
            items = new Array<Schema>();
        }
    }
    
    clear(item: string): string {
        throw new Error("Method not implemented.");
    }

    add(item: Schema): void {
        items.push(item);
    }
}