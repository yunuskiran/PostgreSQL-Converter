import { IIterator } from "../data/iterator";
import { LineAggregate } from "./lineAggregate";
import { Line } from "../data/line";

export class LineIterator implements IIterator {
    lineAggregate: LineAggregate;
    currentIndex: number = 0;

    constructor(lineAggregate: LineAggregate) {
        this.lineAggregate = lineAggregate;
    }

    next(): Line {
        var line: Line = new Line();
        if (this.hasItem()) {
            line = this.lineAggregate.get(this.currentIndex++);
        }

        return line;
    }

    current(): Line {
        return this.lineAggregate.get(this.currentIndex);
    }

    hasItem(): boolean {
        return this.currentIndex < this.lineAggregate.count();
    }



}