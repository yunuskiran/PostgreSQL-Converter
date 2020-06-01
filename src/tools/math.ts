interface Math {
    calculate(begin: number, end: number, step: number): any;
}

Math.calculate = function (begin: number = 0, end: number = Infinity, step: number = 1) {
    let nextIndex = begin;
    let iterationCount = 0;
    const rangeIterator = {
        next: function () {
            let result;
            if (nextIndex < end) {
                result = { value: nextIndex, done: false };
                nextIndex += step;
                iterationCount++;
                return result;
            }
            return { value: iterationCount, done: true };
        }
    };

    return rangeIterator;
};