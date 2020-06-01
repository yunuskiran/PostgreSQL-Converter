import { Constraint } from "../data/constraint";

var items: Array<Constraint>;
export interface IConstraintService {
    add(item: Constraint): void;
}

export class ConstraintService implements IConstraintService {
    constructor() {
        if (!items) {
            items = new Array<Constraint>();
        }
    }

    add(item: Constraint): void {
        items.push(item);
    }
}