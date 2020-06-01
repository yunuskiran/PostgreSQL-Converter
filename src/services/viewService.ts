import { View } from "../data/View";

var items: Array<View>;
export interface IViewService {
    add(item: View): void;
}

export class ViewService implements IViewService {
    constructor() {
        if (!items) {
            items = new Array<View>();
        }
    }

    add(item: View): void {
        items.push(item);
    }
}