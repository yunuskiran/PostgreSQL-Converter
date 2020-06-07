import { View } from "../data/View";

var items: Array<View>;
export interface IViewService {
    add(item: View): void;
    clear(item:string):string;
}

export class ViewService implements IViewService {
    constructor() {
        if (!items) {
            items = new Array<View>();
        }
    }
    clear(item: string): string {
        throw new Error("Method not implemented.");
    }

    add(item: View): void {
        items.push(item);
    }
}