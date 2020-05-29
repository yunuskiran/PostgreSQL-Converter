import * as vscode from 'vscode';
import { Columns } from './data/columns';
import { ColumnTypes } from './data/columntypes';
import { Sequence } from './data/sequence';
import { Constraint } from './data/constraint';
import { Schema } from './data/schema';
import * as constants from './common/constant';

var columns: Array<Columns>;
var columTypes: ColumnTypes;
var sequences: Array<Sequence>;
var constraints: Array<Constraint>;
var schemas: Array<Schema>;

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
            if (!constants.columnQualExpression.test(colQual.toString())) {
                colQual = "UNDEFINED";
            } else {
                colQual = constants.columnQualExpression.execute(colQual, 1);
            }
        }
    }

    return colQual;
}

function convertNumericToInt(qual: string) {
    var numericRegex = /^(\d+),\s*(\d+)$/;
    if (!numericRegex.test(qual.toString())) {
        return 'numeric';
    } else {
        var items = numericRegex.executeReturnArray(qual);
        if (items !== null) {
            var precision = items[1];
            if (Number(precision) <= 4) {
                return 'smallint';
            } else if (Number(precision) <= 9) {
                return 'integer';
            } else if (Number(precision) <= 18) {
                return 'bigint';
            }
        }
    }

    return `numeric${qual}`;
}

function convertToNewType(columType: string, colQual: string, columnName: string,
    tableName: string, schemaName: string) {
    let type: string = '';
    let colQualRegex = /\d+,\s*0/;
    if (columType) {
        if (columTypes.findType(columType)) {
            if ((colQual && columTypes.findUnqualType(columTypes.findType(columType)) !== null) ||
                !colQual) {
                type = columTypes.findType(columType);
            } else if (colQual) {
                type = `${columTypes.findType(columType)}.${colQual}`;
            }
        } else if (columType === 'bit' && !colQual) {
            type = 'boolean';
        } else if (columType === 'ntext' && !colQual) {
            type = "text";
        } else if (columType === 'numeric') {
            if (!colQual) {
                type = 'numeric';
            } else if (colQualRegex.test(colQual.toString())) {
                type = `numeric(${colQual})`;
            } else if (convertNumericToInt(colQual)) {
                type = convertNumericToInt(colQual);
            } else {
                type = `numeric(${colQual})`;
            }
        } else if (columType === 'sysname') {
            type = 'varchar(128)';
        } else if (/^geography$|^geometry$/i.test(columType.toString())) {
            type = columType.toLowerCase();
        } else if (columType === 'sql_varian') {
            type = 'text';
        } else {
            type = '';
        }

        if (/^(\S+)\.(\S+)$/.test(columType.toString())) {
            type = `${type}.[]`;
        }
    }

    return type;
}

function format_identifier(item: string) {
    var value = item.replace('"', '');
    return `"${value}"`;
}


function addColumnToTable(schemaName: string, tableName: string,
    columnRegexResult: string[]) {
    var columnName = columnRegexResult[1];
    var columnTypeSchema = columnRegexResult[2];
    var columnType = columnRegexResult[3];
    var colQual = columnRegexResult[4];
    var colCollate = columnRegexResult[5];
    var isIdentity = columnRegexResult[6];
    var colIsnull = columnRegexResult[7];
    var defaultValue = columnRegexResult[8];
    if (columnTypeSchema) {
        columnType = `${columnTypeSchema}.${columnType}`;
    }
    let hasLobs: boolean = false;
    let tempIsIdentity = false;
    colQual = colqualOperation(colQual);
    var tempDefaultValue = '';
    var newType = convertToNewType(columnType, colQual, columnName, tableName, schemaName);
    if (isIdentity) {
        if (/IDENTITY\s*\((\d+),\s*(\d+)\)/.test(isIdentity)) {
            var identityItems = /IDENTITY\s*\((\d+),\s*(\d+)\)/.executeReturnArray(isIdentity);
            if (identityItems !== null) {
                let startSequence = identityItems[1];
                let stepSequence = identityItems[2];
                let sequenceName = `${tableName}_${columnName}_seq`.toLowerCase();
                defaultValue = `nextval('${format_identifier(schemaName.toLowerCase())}.${sequenceName.toLowerCase()}')`;
                sequences.push(new Sequence(Number(startSequence), Number(startSequence),
                    Number(stepSequence), sequenceName, tableName, columnName, schemaName));
                hasLobs = newType === 'bytea' || newType === 'ntext';
                tempIsIdentity = true;
            }
        }

        if (defaultValue) {
            tempDefaultValue = storeDefault(defaultValue, columnType);
        }

        var tobeInsertColumn = new Columns(
            columnName,
            columnTypeSchema,
            newType,
            colQual,
            colCollate,
            tempIsIdentity,
            colIsnull === 'NOT NULL',
            tempDefaultValue,
            0,
            tableName,
            hasLobs,
            schemaName);

        if (columns.indexOf(columns.filter(_ => _.schemaName === schemaName &&
            _.tableName === tableName && _.name === columnName)[0]) <= 0) {
            columns.push(tobeInsertColumn);
        }
    }

    function addComputedColumToTable(schemaName: string, tableName: string,
        columnRegexResult: string[]) {
        var columnName = columnRegexResult[1];
        var columnType = 'varchar';

        var tobeInsertColumn = new Columns(
            columnName,
            '',
            columnType,
            '',
            '',
            false,
            false,
            '',
            0,
            tableName,
            false,
            schemaName);

        if (columns.indexOf(columns.filter(_ => _.schemaName === schemaName &&
            _.tableName === tableName && _.name === columnName)[0]) <= 0) {
            columns.push(tobeInsertColumn);
        }
    }

    function storeDefault(value: string, columnType: string) {
        var temp: string = value;
        if (/^\(?(\d+(\.\d+)?)\)?$/.test(value.toString())) {
            value = /^\(?(\d+(\.\d+)?)\)?$/.execute(value, 1);
            if (columnType === 'boolean') {
                if (value === '0') {
                    temp = 'false';
                } else if (value === '1') {
                    temp = 'true';
                }
            }
        } else if (/^NULL$/.test(value.toString())) {
            temp = 'NULL';
        } else if (/^N?'(.*)'$/.test(value.toString())) {
            temp = /^N?'(.*)'$/.execute(value, 1);
        }

        return temp;
    }

    export async function convertToPSql(outputChannel: vscode.OutputChannel) {
        debugger;
        columTypes = new ColumnTypes();
        columns = new Array<Columns>();
        sequences = new Array<Sequence>();
        constraints = new Array<Constraint>();
        schemas = new Array<Schema>();
        outputChannel.clear();
        let text = getText();
        text = readAndClean(text);
        var lines = text.split('\n');
        outputChannel.clear();
        if (lines !== null && lines.length > 0) {
            const rangeCalculator = calculateRange(0, lines.length, 1);
            let nextIndex = rangeCalculator.next();
            MAIN: while (!nextIndex.done) {
                if (constants.tableExpression.test(lines[nextIndex.value])) {
                    var tableRegexResult = constants.tableExpression.executeReturnArray(lines[nextIndex.value]);
                    var schemaName = tableRegexResult[1];
                    var tableName = tableRegexResult[2];
                    nextIndex = rangeCalculator.next();
                    TABLE: while (!nextIndex.done) {
                        if (constants.columnExpression.test(lines[nextIndex.value])) {
                            addColumnToTable(schemaName, tableName,
                                constants.columnExpression.executeReturnArray(lines[nextIndex.value]));
                        } else if (constants.computedColumnExpression.test(lines[nextIndex.value])) {
                            addComputedColumToTable(schemaName, tableName,
                                constants.columnExpression.executeReturnArray(lines[nextIndex.value]));
                        } else if (constants.constraintColumnExpression.test(lines[nextIndex.value])) {
                            let constraint = new Constraint(constants.constraintColumnExpression.execute(lines[nextIndex.value], 1), 'PK', '', schemaName, tableName);
                            while (!nextIndex.done) {
                                if (/^\)/.test(lines[nextIndex.value])) {
                                    constraints.push(constraint);
                                    nextIndex = rangeCalculator.next();
                                    continue TABLE;
                                }

                                if (constants.constraintColumnExpression.test(lines[nextIndex.value])) {
                                    //TODO
                                    //constraint.cols = constants.constraintColumnExpression.test(lines[nextIndex.value])[1];
                                }
                            }
                        } else if (constants.uniqueConstraintExpression.test(lines[nextIndex.value])) {
                            let uniqueConstraint = new Constraint(constants.uniqueConstraintExpression.execute(lines[nextIndex.value], 1), 'UNIQUE', '', schemaName, tableName);
                            while (!nextIndex.done) {
                                if (/^\)/.test(lines[nextIndex.value])) {
                                    constraints.push(uniqueConstraint);
                                    nextIndex = rangeCalculator.next();
                                    continue TABLE;
                                }

                                if (constants.constraintColumnExpression.test(lines[nextIndex.value])) {
                                    //TODO
                                    //constraints.cols = constants.constraintColumnExpression.test(lines[nextIndex.value])[1];
                                }
                            }
                        } else if (/^\) ON \[PRIMARY\]/.test(lines[nextIndex.value])) {
                            continue MAIN;
                        }
                        else {
                            //STOP();
                        }
                        nextIndex = rangeCalculator.next();
                    }
                } else if (constants.schemaExpression.test(lines[nextIndex.value])) {
                    schemas.push(new Schema(constants.schemaExpression.execute(lines[nextIndex.value], 0)));
                } else if (constants.sequenceExpression.test(lines[nextIndex.value])) {
                    var sequenceName = constants.sequenceExpression.execute(lines[nextIndex.value], 2);
                    var sequenceStart = 0;
                    var sequenceStep = 0;
                    var sequenceMin = 0;
                    var sequenceMax = 0;
                    var sequenceCache = 0;
                    nextIndex = rangeCalculator.next();
                    SEQUENCE: while (nextIndex.done) {
                        if (/^\s*AS \[.*\]\s*$/.test(lines[nextIndex.value])) {
                            continue;
                        } else if (/^\s*START WITH (\d+)\s*$/.test(lines[nextIndex.value])) {
                            sequenceStart = Number(/^\s*START WITH (\d+)\s*$/.execute(lines[nextIndex.value], 1));
                        } else if (/^\s*INCREMENT BY (\d+)\s*$/.test(lines[nextIndex.value])) {
                            sequenceStep = Number(/^\s*INCREMENT BY (\d+)\s*$/.execute(lines[nextIndex.value], 1));
                        }
                        else if (/^\s*MINVALUE (-?\d+)\s*$/.test(lines[nextIndex.value])) {
                            sequenceMin = Number(/^\s*MINVALUE (-?\d+)\s*$/.execute(lines[nextIndex.value], 1));
                        }
                        else if (/^\s*MAXVALUE (-?\d+)\s*$/.test(lines[nextIndex.value])) {
                            sequenceMax = Number(/^\s*MAXVALUE (-?\d+)\s*$/.execute(lines[nextIndex.value], 1));
                        } else if (/^\s*(NO)?CACHE( \d+)?\s*$/.test(lines[nextIndex.value])) {
                            if (/^\s*(NO)?CACHE( \d+)?\s*$/.execute(lines[nextIndex.value], 1) !== '') {
                                sequenceCache = 1;
                            } else if (/^\s*(NO)?CACHE( \d+)?\s*$/.execute(lines[nextIndex.value], 2) !== '') {
                                sequenceCache = Number(/^\s*(NO)?CACHE( \d+)?\s*$/.execute(lines[nextIndex.value], 2));
                            } else {
                                sequenceCache = 100;
                            }
                        } else if (/^GO$/.test(lines[nextIndex.value])) {
                            continue MAIN;
                        }

                        nextIndex = rangeCalculator.next();
                    }

                    sequences.push(new Sequence(sequenceStart, sequenceMin, sequenceStep, sequenceName, '', '', ''));
                } else if (constants.viewExpression.test(lines[nextIndex.value])) {
                    let viewname;
                    let supplement;
                    let schemaname = 'public';
                    if (/^\s*(create\s*view)\s*(?:\[(\S+)\]\.)?\[(.*?)\]\s*(.*)$/i.test(lines[nextIndex.value])) {
                        let viewInfo = /^\s*(create\s*view)\s*(?:\[(\S+)\]\.)?\[(.*?)\]\s*(.*)$/i.executeReturnArray(lines[nextIndex.value]);
                        viewname = viewInfo[3];
                        supplement = viewInfo[4];
                        let schemaname;
                        if (viewInfo[2]) {
                            schemaname = viewInfo[2];
                        }
                    } else {
                        nextIndex = rangeCalculator.next();
                        if (/^\s*(?:\[(\S+)\]\.)?\[(.*?)\]\s*(.*)$/.test(lines[nextIndex.value])) {
                            let viewInfo = /^\s*(?:\[(\S+)\]\.)?\[(.*?)\]\s*(.*)$/.executeReturnArray(lines[nextIndex.value]);
                            viewname = viewInfo[2];
                            if (viewInfo[1]) {
                                schemaname = viewInfo[1];
                            }
                            supplement = viewInfo[3];
                        }
                        else {
                            console.log('where is view sorry! :)');
                        }
                    }
                }
                nextIndex = rangeCalculator.next();
            }
        }

        columns.forEach(_ => {
            outputChannel.appendLine(_.name);
            outputChannel.appendLine(_.tableName);
            outputChannel.appendLine(_.schemaName);
        });

        outputChannel.show();
    }
}

