interface RegExp {
    execute(value: string, index: any): string;
    executeReturnArray(value: string): string[];
}

const stringEmpty = '';
const emptyStringArray: string[] = [];

RegExp.prototype.execute = function (value: string, index: any): string {
    if (this.test(value)) {
        let tempExecuted = this.exec(value);
        if (tempExecuted) {
            return tempExecuted[index];
        }
    }

    return stringEmpty;
};

RegExp.prototype.executeReturnArray = function (value: string): string[] {
    if (this.test(value)) {
        let tempExecuted = this.exec(value);
        if (tempExecuted) {
            return tempExecuted;
        }
    }

    return emptyStringArray;
};