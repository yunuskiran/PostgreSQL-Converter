import { Sequence } from "../data/Sequence";

var items: Array<Sequence>;
export interface ISequenceService {
    add(item: Sequence): void;
}

export class SequenceService implements ISequenceService {
    constructor() {
        if (!items) {
            items = new Array<Sequence>();
        }
    }

    add(item: Sequence): void {
        items.push(item);
    }
}