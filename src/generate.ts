import * as vscode from 'vscode';
import * as constants from './common/constant';
import { Line } from './data/line';
import { LineAggregate } from './services/lineAggregate';


function getText() {
    var text: string = '';
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

function colqualOperation(columnQual: string) {
    if (columnQual) {
        if (columnQual === constants.xml) {
            columnQual = constants.undefined;
        }
        else if (columnQual === constants.max) {
            columnQual = constants.undefined;
        }
        else {
            if (!constants.columnQualExpression.test(columnQual.toString())) {
                columnQual = constants.undefined;
            } else {
                columnQual = constants.columnQualExpression.execute(columnQual, 1);
            }
        }
    }

    return columnQual;
}

function convertNumericToInt(qual: string) {
    var numericRegex = constants.numericExpression;
    if (!numericRegex.test(qual.toString())) {
        return constants.numeric;
    } else {
        var items = numericRegex.executeReturnArray(qual);
        if (items !== null) {
            var precision = items[1];
            if (Number(precision) <= constants.precisionFour) {
                return constants.smallInt;
            } else if (Number(precision) <= constants.precisionNine) {
                return constants.integer;
            } else if (Number(precision) <= constants.precisionEighteen) {
                return constants.bigInt;
            }
        }
    }

    return `${constants.numeric}${qual}`;
}

function convertToNewType(columType: string, columnQual: string, columnName: string,
    tableName: string, schemaName: string) {
    let type: string = '';
    if (columType) {
        if (columTypes.findType(columType)) {
            if ((columnQual && columTypes.findUnqualType(columTypes.findType(columType)) !== null) ||
                !columnQual) {
                type = columTypes.findType(columType);
            } else if (columnQual) {
                type = `${columTypes.findType(columType)}.${columnQual}`;
            }
        } else if (columType === constants.bit && !columnQual) {
            type = constants.boolean;
        } else if (columType === constants.ntext && !columnQual) {
            type = constants.text;
        } else if (columType === constants.numeric) {
            if (!columnQual) {
                type = constants.numeric;
            } else if (constants.columnQualExpresion.test(columnQual.toString())) {
                type = `${constants.numeric}(${columnQual})`;
            } else if (convertNumericToInt(columnQual)) {
                type = convertNumericToInt(columnQual);
            } else {
                type = `${constants.numeric}(${columnQual})`;
            }
        } else if (columType === constants.sysname) {
            type = constants.varchar128;
        } else if (constants.geometryColumnExpression.test(columType.toString())) {
            type = columType.toLowerCase();
        } else if (columType === constants.sqlVariant) {
            type = constants.text;
        } else {
            type = constants.emptyString;
        }

        if (constants.typeColumnExpression.test(columType.toString())) {
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
    var columnQual = columnRegexResult[4];
    var columnCollate = columnRegexResult[5];
    var isIdentity = columnRegexResult[6];
    var columnIsnull = columnRegexResult[7];
    var defaultValue = columnRegexResult[8];
    if (columnTypeSchema) {
        columnType = `${columnTypeSchema}.${columnType}`;
    }
    let hasLobs: boolean = false;
    let tempIsIdentity = false;
    columnQual = colqualOperation(columnQual);
    var tempDefaultValue = '';
    var newType = convertToNewType(columnType, columnQual, columnName, tableName, schemaName);
    if (isIdentity) {
        if (constants.identiyExpression.test(isIdentity)) {
            var identityItems = constants.identiyExpression.executeReturnArray(isIdentity);
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

        var tobeInsertColumn = new Column(
            aa);

        if (columns.indexOf(columns.filter(_ => _.schemaName === schemaName &&
            _.tableName === tableName && _.name === columnName)[0]) <= 0) {
            columns.push(tobeInsertColumn);
        }
    }
}

function addComputedColumToTable(schemaName: string, tableName: string,
    columnRegexResult: string[]) {
    var columnName = columnRegexResult[1];
    var columnType = 'varchar';

    var tobeInsertColumn = new Column({ name: columnName, type: columnType, tableName: tableName, schemaName: schemaName, collate: '', defaultValue: '', hasLobs: false, isIdentity: false, isNull: false, position: 0, qual: '', typeSchema: '' });
    if (columns.indexOf(columns.filter(_ => _.schemaName === schemaName &&
        _.tableName === tableName && _.name === columnName)[0]) <= 0) {
        columns.push(tobeInsertColumn);
    }
}

function storeDefault(value: string, columnType: string) {
    var temp: string = value;
    if (constants.storeDefaultExpression.test(value.toString())) {
        value = constants.storeDefaultExpression.execute(value, 1);
        if (columnType === constants.boolean) {
            if (value === constants.zeroString) {
                temp = constants.falseString;
            } else if (value === constants.oneString) {
                temp = constants.trueString;
            }
        }
    } else if (constants.nullExpression.test(value.toString())) {
        temp = constants.nullString;
    } else if (constants.nExpresison.test(value.toString())) {
        temp = constants.nExpresison.execute(value, 1);
    }

    return temp;
}

function init(outputChannel: vscode.OutputChannel) {
    outputChannel.clear();
    let text = getText();
    text = text.readAndClean();
    var lines = text.split(constants.newLine);
    outputChannel.clear();
    return lines;
}

export async function convertToPSql(outputChannel: vscode.OutputChannel) {
    var lines = init(outputChannel);
    let lineAggregate: LineAggregate = new LineAggregate();
    lines.forEach((_) => {
        var newLine = new Line();
        newLine.item = _;
        lineAggregate.add(newLine);
    });

    var iterator = lineAggregate.CreateIterator();
    while (iterator.hasItem()) {

    }

    if (lines !== null && lines.length > 0) {
        const rangeCalculator = Math.calculate(0, lines.length, 1);
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
                        let constraint = new Constraint(constants.constraintColumnExpression.execute(lines[nextIndex.value], 1), constants.pk, constants.emptyString, schemaName, tableName);
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
                        let uniqueConstraint = new Constraint(constants.uniqueConstraintExpression.execute(lines[nextIndex.value], 1), constants.unique, constants.emptyString, schemaName, tableName);
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
                    } else if (constants.onPrimaryExpression.test(lines[nextIndex.value])) {
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
                //TODO
                var sequenceName = constants.sequenceExpression.execute(lines[nextIndex.value], 2);
                var sequenceStart = 0;
                var sequenceStep = 0;
                var sequenceMin = 0;
                var sequenceMax = 0;
                var sequenceCache = 0;
                nextIndex = rangeCalculator.next();
                SEQUENCE: while (nextIndex.done) {
                    if (constants.sequenceAsExpression.test(lines[nextIndex.value])) {
                        continue;
                    } else if (constants.sequenceStartExpression.test(lines[nextIndex.value])) {
                        sequenceStart = Number(constants.sequenceStartExpression.execute(lines[nextIndex.value], 1));
                    } else if (constants.sequenceIncrementExpresion.test(lines[nextIndex.value])) {
                        sequenceStep = Number(constants.sequenceIncrementExpresion.execute(lines[nextIndex.value], 1));
                    }
                    else if (constants.sequenceMinExpression.test(lines[nextIndex.value])) {
                        sequenceMin = Number(constants.sequenceMinExpression.execute(lines[nextIndex.value], 1));
                    }
                    else if (constants.sequenceMaxExpression.test(lines[nextIndex.value])) {
                        sequenceMax = Number(constants.sequenceMaxExpression.execute(lines[nextIndex.value], 1));
                    } else if (constants.sequenceCacheExpression.test(lines[nextIndex.value])) {
                        if (constants.sequenceCacheExpression.execute(lines[nextIndex.value], 1) !== '') {
                            sequenceCache = 1;
                        } else if (constants.sequenceCacheExpression.execute(lines[nextIndex.value], 2) !== '') {
                            sequenceCache = Number(constants.sequenceCacheExpression.execute(lines[nextIndex.value], 2));
                        } else {
                            sequenceCache = 100;
                        }
                    } else if (constants.goExpression.test(lines[nextIndex.value])) {
                        continue MAIN;
                    }

                    nextIndex = rangeCalculator.next();
                }

                sequences.push(new Sequence(sequenceStart, sequenceMin, sequenceStep, sequenceName, '', '', ''));
            } else if (constants.viewExpression.test(lines[nextIndex.value])) {
                //TODO
                let viewname;
                let supplement;
                let schemaname = 'public';
                if (constants.createViewExpression.test(lines[nextIndex.value])) {
                    let viewInfo = constants.createViewExpression.executeReturnArray(lines[nextIndex.value]);
                    viewname = viewInfo[3];
                    supplement = viewInfo[4];
                    let schemaname;
                    if (viewInfo[2]) {
                        schemaname = viewInfo[2];
                    }
                } else {
                    nextIndex = rangeCalculator.next();
                    if (constants.viewDefinitionExpression.test(lines[nextIndex.value])) {
                        let viewInfo = constants.viewDefinitionExpression.executeReturnArray(lines[nextIndex.value]);
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
