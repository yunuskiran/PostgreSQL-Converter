import * as vscode from 'vscode';

function getText() {
    var text: string = "";
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document;
        const selection = editor.selection;
        if (document) {
            if (!selection.isEmpty) {
                text = document.getText(selection);
            } else {
                text = document.getText();
            }
        }
    }

    return text;
}

function readAndClean(text: string) {
    //Remove \r from windows output
    text = text.replace(/(\r)/gm, "");

    //If we are in comment, we look for */, and we remove everything until */
    if (text.match(/(\/\*[^*]*\*\/)|(\/\/[^*]*)/g)) {
        text = text.replace(/(\/\*[^*]*\*\/)|(\/\/[^*]*)/g, '');
        text = text + "\n";
    }
    return text;
}

function calculateRange(start = 0, end = Infinity, step = 1) {
    let nextIndex = start;
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
}

export async function convertToPSql(outputChannel: vscode.OutputChannel) {
    debugger;
    outputChannel.clear();
    let text = getText();
    text = readAndClean(text);
    var lines = text.split('\n');
    outputChannel.clear();
    if (lines !== null && lines.length > 0) {
        const rangeCalculator = calculateRange(0, lines.length, 1);
        let nextIndex = rangeCalculator.next();
        MAIN: while (!nextIndex.done) {
            var tableRegex = /^CREATE TABLE \[(.*)\]\.\[(.*)\]\s*\(/;
            if (tableRegex.test(lines[nextIndex.value])) {
                var tableRegexResult = tableRegex.exec(lines[nextIndex.value]);
                var schemaname = tableRegexResult[1].toString();
                var tablename = tableRegexResult[2].toString();
                outputChannel.appendLine(schemaname+tablename);
                nextIndex = rangeCalculator.next();
                TABLE: while (!nextIndex.done) {
                    var columnRegex = /^\t\[(.*)\] (?:\[(.*)\]\.)?\[(.*)\]\s*(\(.+?\))?(?: COLLATE (\S+))?( IDENTITY\s*\(\d+,\s*\d+\))?(?: ROWGUIDCOL ?)? (?:NOT FOR REPLICATION )?(?:SPARSE +)?(NOT NULL|NULL)(?:\s+CONSTRAINT \[.*\])?(?:\s+DEFAULT \((.*)\))?(?:,|$)?/;
                    if (columnRegex.test(lines[nextIndex.value])) {
                        var columnRegexResult = columnRegex.exec(lines[nextIndex.value]);
                        var columnname = columnRegexResult[1];
                        var coltypeschema = columnRegexResult[2];
                        var coltype = columnRegexResult[3];
                        var colqual = columnRegexResult[4];
                        var colcollate = columnRegexResult[5];
                        var isidentity = columnRegexResult[6];
                        var colisnull = columnRegexResult[7];
                        var defaultval = columnRegexResult[8];
                        outputChannel.appendLine(columnname+coltypeschema+coltype+colqual+colcollate+isidentity+colisnull+defaultval);
                    }
                    nextIndex = rangeCalculator.next();
                }
            }
            nextIndex = rangeCalculator.next();
        }
    }

    outputChannel.show();


}

