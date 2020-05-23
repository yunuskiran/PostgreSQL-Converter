interface String {
    isNullOrEmptyWhiteSpace(prefix: string): boolean;
}

String.prototype.isNullOrEmptyWhiteSpace = function (value: string) {
    return value === undefined || value === null || value.match(/^ *$/) !== null;
};