interface String {
    isNullOrEmptyWhiteSpace(prefix: string): boolean;
}

String.prototype.isNullOrEmptyWhiteSpace = function () {
    return this === undefined || this === null || this.match(/^ *$/) !== null;
};