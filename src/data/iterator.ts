import { Line } from "./line";

export interface IIterator {
    hasItem(): boolean;
    next(): Line;
    current(): Line;
}