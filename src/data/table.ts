import { Schema } from "./schema";

export interface Table {
    name: string;
    hasLobs: boolean;
    schema: Schema;
}