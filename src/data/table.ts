import { Schema } from "./schema";

export interface Table extends Schema {
    name: string;
    hasLobs: boolean;
}