import { Constraint } from "../data/constraint";

var items: Array<Constraint>;
export interface IConstraintService {
    add(item: Constraint): void;
    clear(item:string):string;
}

export class ConstraintService implements IConstraintService {
    constructor() {
        if (!items) {
            items = new Array<Constraint>();
        }
    }
    clear(item: string): string {
        throw new Error("Method not implemented.");
    }

    add(item: Constraint): void {
        items.push(item);
    }
}