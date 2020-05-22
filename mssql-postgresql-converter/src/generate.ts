import * as vscode from 'vscode';
import { Columns } from './models/columns';

const tableRegex = /^CREATE TABLE \[(.*)\]\.\[(.*)\]\s*\(/;
const columnRegex = /^\t\[(.*)\] (?:\[(.*)\]\.)?\[(.*)\]\s*(\(.+?\))?(?: COLLATE (\S+))?( IDENTITY\s*\(\d+,\s*\d+\))?(?: ROWGUIDCOL ?)? (?:NOT FOR REPLICATION )?(?:SPARSE +)?(NOT NULL|NULL)(?:\s+CONSTRAINT \[.*\])?(?:\s+DEFAULT \((.*)\))?(?:,|$)?/;
var columns: Array<Columns>;
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
    text = text.replace(/(\r)/gm, "");
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

function addColumnToTable(schemaname: string, tablename: string,
    columnRegexResult: RegExpExecArray) {
    var columnname = columnRegexResult[1];
    var coltypeschema = columnRegexResult[2];
    var coltype = columnRegexResult[3];
    var colqual = columnRegexResult[4];
    var colcollate = columnRegexResult[5];
    var isidentity = columnRegexResult[6];
    var colisnull = columnRegexResult[7];
    var defaultval = columnRegexResult[8];
    var tobeInsertColumn = new Columns(
        columnname,
        coltypeschema,
        coltype,
        colqual,
        colcollate,
        isidentity === "true",
        colisnull === "true",
        defaultval, 0, tablename, schemaname);

    if (columns.indexOf(columns.filter(_ => _.schemaname === schemaname &&
        _.tablename === tablename && _.name === columnname)[0]) <= 0) {
        columns.push(tobeInsertColumn);
    }
}

export async function convertToPSql(outputChannel: vscode.OutputChannel) {
    debugger;
    columns = new Array<Columns>();
    outputChannel.clear();
    let text = getText();
    text = readAndClean(text);
    var lines = text.split('\n');
    outputChannel.clear();
    if (lines !== null && lines.length > 0) {
        const rangeCalculator = calculateRange(0, lines.length, 1);
        let nextIndex = rangeCalculator.next();
        MAIN: while (!nextIndex.done) {
            if (tableRegex.test(lines[nextIndex.value])) {
                var tableRegexResult = tableRegex.exec(lines[nextIndex.value]);
                var schemaname = tableRegexResult[1];
                var tablename = tableRegexResult[2];
                nextIndex = rangeCalculator.next();
                TABLE: while (!nextIndex.done) {
                    if (columnRegex.test(lines[nextIndex.value])) {
                        addColumnToTable(schemaname, tablename,
                            columnRegex.exec(lines[nextIndex.value]));
                    }
                    nextIndex = rangeCalculator.next();
                }
            }
            nextIndex = rangeCalculator.next();
        }
    }

    columns.forEach(_ => {
        outputChannel.appendLine(_.name);
        outputChannel.appendLine(_.tablename);
        outputChannel.appendLine(_.schemaname);
    });

    outputChannel.show();


}

