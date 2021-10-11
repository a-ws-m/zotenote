// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const got = require('got');
import * as vscode from 'vscode';

const bibtexUrl = "http://127.0.0.1:23119/better-bibtex/cayw?format=translate&translator=csljson";

type BibJson = { [key: string]: string };

async function connectToCayw(): Promise<[BibJson] | void> {
	try {
		return await got(bibtexUrl).json();
	}
	catch (error: any) {
		console.error("Failed to get response from Zotero: %j", error?.message ?? "No error message.");
		vscode.window.showErrorMessage("Could not connect to Zotero, is it running?");
	}
}

function formatTemplate(template: string, bibJson: BibJson) {
	// Format the desired template with bibliographic information

}

function makeLiteratureNotes() {
	// Show the Zotero citations picker
	connectToCayw().then(
		response => {
			if (response) {
				console.log(response);
				const bibJson = response;
			}
			else { return; }
		}
	);
	// Parse CSL JSON

	// Create new note
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "zotenote" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('zotenote.makeLiteratureNotes', makeLiteratureNotes);

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
