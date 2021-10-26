# Zotenote

Zotenote is an extension for VSCode that enables easy creation of literature notes from Zotero library entries.

## Features

Zotenote allows you to configure a literature note *template*, or just use the default one.
Then, run `Make literature notes from Zotero` from the Command Palette to view a Zotero
citations picker dialogue. Type the name of the literature you'd like to create a note for,
then press Enter to select. You can select multiple entries. Once you're done, press Enter
again to create the notes and have them displayed in the editor:

<https://user-images.githubusercontent.com/25207558/138964836-50b65865-b44b-4b95-8ca1-55178404114e.mp4>

## Requirements

Zotenote requires the [Better BibTex](https://retorque.re/zotero-better-bibtex/installation/)
extension for Zotero. Zotero must also be opened on your local machine running VSCode in order
to create new literature notes.

## Extension Settings

This extension contributes the following settings:

* `zotenote.templateFile`: The literature note template file, relative to the workspace.
* `zotenote.destination`: The directory in which to save literature notes, relative to the workspace.

## Release Notes

### 1.0.0

Initial release of Zotenote, with customisable templates.
