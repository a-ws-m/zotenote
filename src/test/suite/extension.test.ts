import * as assert from 'assert';
import * as path from 'path';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as zotenote from '../../extension';

const testsRoot = path.resolve(__dirname, '..');
const dataRoot = path.resolve(testsRoot, "..", "..", "src", "test", "static");
const bibRoot = path.resolve(dataRoot, "csljson");
const expectedRoot = path.resolve(dataRoot, "expected_files");
const templateRoot = path.resolve(dataRoot, "templates");

const bibNames = ["1-paper-one-author.json", "2-paper-multiple-authors.json", "3-book.json"];
const templateNames = ["mix-n-match", "default"];

/*
* Test that the given template is formatted correctly with the given bibliographic information.
*/
async function testTemplateMatch(templateFile: string | undefined, bibFile: string, expectedFile: string) {
	let template: string;
	if (templateFile) {
		const templatePath = path.resolve(templateRoot, templateFile);
		const templateUri = vscode.Uri.file(templatePath);
		console.log(templatePath);
		template = await zotenote.readTemplate(templateUri);
	} else {
		template = await zotenote.readTemplate();
	}
	const bibPath = vscode.Uri.file(path.resolve(bibRoot, bibFile));
	const expectedPath = vscode.Uri.file(expectedFile);

	if (!template) { throw new Error("Couldn't read template"); }

	const bibJson = await vscode.workspace.fs.readFile(bibPath).then(
		data => {
			return JSON.parse(data.toString())[0];
		}
	);
	if (!bibJson) { throw new Error("Couldn't read BibJson."); }
	console.log(bibJson);

	const formattedTemplate = zotenote.formatTemplate(template, bibJson);

	const expected = await vscode.workspace.fs.readFile(expectedPath).then(
		expectedData => {
			return expectedData.toString();
		}
	);

	assert.strictEqual(formattedTemplate, expected);
}

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	for (let bibIdx = 0; bibIdx < bibNames.length; bibIdx++) {
		let bibName = bibNames[bibIdx];
		for (let templateIdx = 0; templateIdx < templateNames.length; templateIdx++) {
			let templateName = templateNames[templateIdx];
			let expectedName = path.resolve(expectedRoot, templateName, `${templateName}-${bibIdx + 1}.md`);
			let templateFile = templateName === "default" ? undefined : templateName + ".md";

			test(
				`Template matching: ${templateName}, ${bibName}`, () => testTemplateMatch(templateFile, bibName, expectedName)
			);
		}
	}
});
