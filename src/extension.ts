// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const got = require('got');
import { read } from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

const bibtexUrl = "http://127.0.0.1:23119/better-bibtex/cayw?format=translate&translator=csljson";
const fallbackTemplate = "---\ntype: literature\n${date:}\n${DOI:}\n${ISBN:}\n${URL:}\n---\n\n# ${title}\n";

type BibJson = { [key: string]: any };

function getUriFromConfig(property: string, ...addendum: string[]): vscode.Uri | void {
	const config = vscode.workspace.getConfiguration("zotenote");
	const configVal: string = config[property];
	if (!configVal) { return; }
	if (path.isAbsolute(configVal)) {
		return vscode.Uri.file(configVal);
	} else {
		const workspaces = vscode.workspace.workspaceFolders;
		if (!workspaces) {
			vscode.window.showErrorMessage("Please open the workspace in which to save literature notes.");
			return;
		}
		return vscode.Uri.joinPath(workspaces[0].uri, configVal, ...addendum);
	}
}

function reportError(error: any) {
	let errMessage = error?.message;
	if (!errMessage) {
		errMessage = "Error making literature note";
	}
	console.log(errMessage);
	vscode.window.showErrorMessage(errMessage);
}

async function connectToCayw(): Promise<[BibJson] | void> {
	try {
		return await got(bibtexUrl).json();
	}
	catch (error: any) {
		reportError(error);
	}
}

/*
* Read the template file, or fallback onto the default.
*/
export async function readTemplate(templateUri?: vscode.Uri): Promise<string> {
	if (!templateUri) { return fallbackTemplate; }
	let data: string | undefined;
	return vscode.workspace.fs.readFile(templateUri).then(
		buffer => {
			data = buffer.toString();
			return data;
		},
		reason => reportError(reason)
	);
}

/*
* Confirm that bibtex has generated a citation key
*/
function validateBibJson(bibJson: BibJson): void {
	if (!bibJson?.id) {
		throw new Error(`No citation key found for ${bibJson?.title}`);
	}
}

function formatDate(bibJson: BibJson): string {
	const date: number[] = bibJson["issued"]["date-parts"][0];
	let dateStrs: string[] = [];
	date.forEach(datePart => {
		const strPart = String(datePart);
		if (strPart.length > 1) {
			dateStrs.push(strPart);
		} else {
			dateStrs.push("0" + strPart);
		}
	});
	return dateStrs.join("-");
}

function formatAuthors(bibJson: BibJson): string {
	const authors: [{ family: string, given: string }] = bibJson.author;
	const authorStrings = authors.map(names => `${names.family.replace(/\s/g, "_")},${names.given.replace(/\s/g, "_")}`);
	return authorStrings.join(" ");
}

/*
* Get the replacement string for an abbreviation
*/
function getReplacementString(abbrev: string, bibJson: BibJson, preWhiteSpace?: string, postWhiteSpace?: string): string {
	// Determine what to start our substitution with
	let substitution = preWhiteSpace ? preWhiteSpace : "";
	if (abbrev.endsWith(":")) {
		substitution += abbrev + " ";
		abbrev = abbrev.slice(0, -1);
	}

	const bibField = bibJson[abbrev];
	if (!bibField && !["date", "authors"].includes(abbrev)) {
		/* No match:
		* If wrapped by spaces, return one space.
		* If wrapped by a space and a newline, return a newline.
		* If wrapped by newlines, return one newline.
		* If wrapped by just one of either space, return an empty string.
		*/
		if (preWhiteSpace && postWhiteSpace) {
			if (preWhiteSpace === postWhiteSpace) {
				return preWhiteSpace;
			}
			return "\n";
		}
		return "";
	}

	switch (abbrev) {
		case "author":
		case "authors":
			substitution += formatAuthors(bibJson);
			break;
		case "date":
			substitution += formatDate(bibJson);
			break;
		default:
			substitution += bibField;
	}
	if (postWhiteSpace) {
		substitution += postWhiteSpace;
	}
	return substitution;
}

export function formatTemplate(template: string, bibJson: BibJson): string {
	// Format the desired template with bibliographic information
	const templateLineRegex = /(\n?)^\$\{(.+)\}$(\n?)/gm;
	const templateRegex = /(\s?)\$\{(.+)\}(\s?)/gm;

	[templateLineRegex, templateRegex].forEach(pattern => {
		template = template.replace(pattern, (_matchString, preWhiteSpace, abbrev, postWhiteSpace) => {
			return getReplacementString(abbrev, bibJson, preWhiteSpace, postWhiteSpace);
		});
	});
	return template;
}

export async function writeNote(buffer: string, bibJson: BibJson) {
	const fname = bibJson.id + ".md";
	const destUri = getUriFromConfig("destination", fname);
	if (!destUri) { return; }
	try {
		await vscode.workspace.fs.writeFile(destUri, Buffer.from(buffer));
		vscode.workspace.openTextDocument(destUri).then(
			doc => vscode.window.showTextDocument(doc)
		);
	} catch (error) {
		reportError(error);
	}
}

async function makeLiteratureNotes() {
	// Load in the template
	const templateUri = getUriFromConfig("templateFile");
	let template: string;
	if (!templateUri) {
		template = await readTemplate();
	}
	else {
		template = await readTemplate(templateUri);
	}
	if (!template) { return; }

	// Show the Zotero citations picker
	connectToCayw().then(
		response => {
			if (response) {
				// console.log(response);
				// Parse CSL JSON
				response.forEach(bibJson => {
					try {
						validateBibJson(bibJson);
					} catch (error: any) {
						reportError(error);
						return;
					}
					// Format template
					let formattedTemplate = formatTemplate(template, bibJson);
					// console.log(formattedTemplate);
					// Create new note
					writeNote(formattedTemplate, bibJson);
				});
			}
			else { return; }
		}
	);
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log("Zotenote activated");

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('zotenote.makeLiteratureNotes', makeLiteratureNotes);

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }