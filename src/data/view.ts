import { Schema } from "./schema";

export interface View extends Schema {
    name: string;
    supplement: string;
}