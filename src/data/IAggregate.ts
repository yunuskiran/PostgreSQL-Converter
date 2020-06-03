import { IIterator } from "./iterator";

export interface IAggregate {
    CreateIterator(): IIterator;
}