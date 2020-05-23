import * as vscode from 'vscode';
import { Columns } from './models/columns';
import { ColumnTypes } from './models/columntypes';

const tableRegex = /^CREATE TABLE \[(.*)\]\.\[(.*)\]\s*\(/;
const columnRegex = /^\t\[(.*)\] (?:\[(.*)\]\.)?\[(.*)\]\s*(\(.+?\))?(?: COLLATE (\S+))?( IDENTITY\s*\(\d+,\s*\d+\))?(?: ROWGUIDCOL ?)? (?:NOT FOR REPLICATION )?(?:SPARSE +)?(NOT NULL|NULL)(?:\s+CONSTRAINT \[.*\])?(?:\s+DEFAULT \((.*)\))?(?:,|$)?/;
const colQualRegex = /\((\d+(?:,\s*\d+)?)\)/;
var columns: Array<Columns>;
var columTypes: ColumnTypes;
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

function colqualOperation(colQual: string) {
    if (colQual) {
        if (colQual === "xml") {
            colQual = "UNDEFINED";
        }
        else if (colQual === '(max)') {
            colQual = "UNDEFINED";
        }
        else {
            if (!colQualRegex.test(colQual)) {
                colQual = "UNDEFINED";
            } else {
                colQual = colQualRegex.exec(colQual)[1];
            }
        }
    }

    return colQual;
}

function convertNumericToInt(qual: string) {
    var numericRegex = /^(\d+),\s*(\d+)$/;
    if (!numericRegex.test(qual)) {
        return 'numeric';
    } else {
        var items = numericRegex.exec(qual);
        var precision = items[1];
        if (Number(precision) <= 4) {
            return 'smallint';
        } else if (Number(precision) <= 9) {
            return 'integer';
        } else if (Number(precision) <= 18) {
            return 'bigint';
        }
    }

    return `numeric${qual}`;

}

function convertToNewType(coltype: string, colQual: string, columnName: string,
    tableName: string, schemaName: string) {
    let type: string = '';
    let colQualRegex = /\d+,\s*0/;
    if (coltype) {
        if (columTypes.findType(coltype)) {
            if ((colQual && columTypes.findUnqualType(columTypes.findType(coltype)) !== null) ||
                !colQual) {
                type = columTypes.findType(coltype);
            } else if (colQual) {
                type = `${columTypes.findType(coltype)}.${colQual}`;
            }
        } else if (coltype === 'bit' && !colQual) {
            type = 'boolean';
        } else if (coltype === 'ntext' && !colQual) {
            type = "text";
        } else if (coltype === 'numeric') {
            if (!colQual) {
                type = 'numeric';
            } else if (colQualRegex.test(colQual)) {
                type = `numeric(${colQual})`;
            } else if (convertNumericToInt(colQual)) {
                type = convertNumericToInt(colQual);
            } else {
                type = `numeric(${colQual})`;
            }
        } else if (coltype === 'sysname') {
            type = 'varchar(128)';
        } else if (/^geography$|^geometry$/i.test(coltype)) {
            type = coltype.toLowerCase();
        } else if (coltype === 'sql_varian') {
            type = 'text';
        } else {
            type = '';
        }

        if (/^(\S+)\.(\S+)$/.test(coltype)) {
            type = `${type}.[]`;
        }
    }

    return type;
}


function addColumnToTable(schemaname: string, tablename: string,
    columnRegexResult: RegExpExecArray) {
    var columnname = columnRegexResult[1];
    var coltypeschema = columnRegexResult[2];
    var coltype = columnRegexResult[3];
    var colQual = columnRegexResult[4];
    var colcollate = columnRegexResult[5];
    var isidentity = columnRegexResult[6];
    var colisnull = columnRegexResult[7];
    var defaultval = columnRegexResult[8];
    if (coltypeschema) {
        coltype = `${coltypeschema}.${coltype}`;
    }

    colQual = colqualOperation(colQual);
    var newType = convertToNewType(coltype, colQual, columnname, tablename, schemaname);
    if(isidentity){
        if(/IDENTITY\s*\((\d+),\s*(\d+)\)/.test(isidentity)){
            var identityItems=/IDENTITY\s*\((\d+),\s*(\d+)\)/.exec(isidentity);
            let startSequence= identityItems[1];
            let stepSequence= identityItems[2];
            let sequenceName=`${tablename}_${columnname}_seq`.toLowerCase();
            
        }   
    }
    
    var tobeInsertColumn = new Columns(
        columnname,
        coltypeschema,
        newType,
        colQual,
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
    columTypes = new ColumnTypes();
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

