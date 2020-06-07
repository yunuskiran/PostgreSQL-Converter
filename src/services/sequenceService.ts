import { Sequence } from "../data/Sequence";

var items: Array<Sequence>;
export interface ISequenceService {
    add(item: Sequence): void;
    clear(item:string):string;
}

export class SequenceService implements ISequenceService {
    constructor() {
        if (!items) {
            items = new Array<Sequence>();
        }
    }
    clear(item: string): string {
        throw new Error("Method not implemented.");
    }

    add(item: Sequence): void {
        items.push(item);
    }
}