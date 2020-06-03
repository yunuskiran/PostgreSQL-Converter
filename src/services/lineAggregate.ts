import { IAggregate } from "../data/IAggregate";
import { Line } from "../data/line";

export class LineAggregate implements IAggregate {
    lines: Array<Line> = new Array<Line>();
    CreateIterator(): import("../data/iterator").IIterator {
        throw new Error("Method not implemented.");
    }

    add(item: Line) {
        this.lines.push(item);
    }

    get(index: number): Line {
        return this.lines[index];
    }

    count(): number {
        return this.lines.length;
    }
}


