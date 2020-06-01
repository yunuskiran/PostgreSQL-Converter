'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';


// The module 'azdata' contains the Azure Data Studio extensibility API
// This is a complementary set of APIs that add SQL / Data-specific functionality to the app
// Import the module and reference it with the alias azdata in your code below

import * as azdata from 'azdata';
import { convertToPSql } from './generate';

var outputChannel = vscode.window.createOutputChannel("PostgreSql Converter");

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "mssql-postgresql-converter" is now active!');
    context.subscriptions.push(vscode.commands.registerCommand('extension.generateScripts', () => {
        convertToPSql(outputChannel);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.showCurrentConnection', () => {
        azdata.connection.getCurrentConnection().then(connection => {
            let connectionId = connection ? connection.connectionId : 'No connection found!';
            vscode.window.showInformationMessage(connectionId);
        }, error => {
            console.info(error);
        });
    }));
}

// this method is called when your extension is deactivated
export function deactivate() {
}