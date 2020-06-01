interface String {
    isNullOrEmptyWhiteSpace(): boolean;
    readAndClean(): string;
}

String.prototype.isNullOrEmptyWhiteSpace = function () {
    return this === undefined || this === null || this.match(/^ *$/) !== null;
};

String.prototype.readAndClean = function () {
    let _ = this.replace(/(\r)/gm, '');
    if (/(\/\*[^*]*\*\/)|(\/\/[^*]*)/g.test(_)) {
        _ = _.replace(/(\/\*[^*]*\*\/)|(\/\/[^*]*)/g, '');
        _ = `${_}\\n`;
    }
    return _;
};