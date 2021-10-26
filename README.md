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

## Template file format

There are two ways of including bibliographic information in the template file,
which I will refer to as *replacement fields* (because they're replaced in the
formatted literature note file):

* `${attribute:}` will be replaced with `attribute: <the bibliographic attribute>`.
* `${attribute}` will be replaced with `<the bibliographic attribute>`.

If the `attribute` is missing from the imported data, the replacement field is
removed. If its on its own line, the line will be deleted.

Valid `attribute`s are any Better BibTex CSLJSON field, plus some special convenience
`attributes`:

* `${author}` or `${authors}` produces a space-separated list of the authors.
* `${date}` produces the date in `YYYY-MM-DD` format.

You can see an example of the `attribute`s available by selecting an item in
Zotero, Right Click > Export, then choose `Format: Better CSL JSON`. The
resulting file will look something like this:

```json
[{
  "id": "schwenkerConstructingSelfLabeledMaterials2020",
  "abstract": "//static.cambridge.org/content/id/urn%3Acambridge.org%3Aid%3Aarticle%3AS1431927620023806/resource/name/firstPage-S1431927620023806a.jpg",
  "accessed": {
    "date-parts": [
      [2020, 12, 4]
    ]
  },
  "author": [{
    "family": "Schwenker",
    "given": "Eric"
  }, {
    "family": "Jiang",
    "given": "Weixin"
  }, {
    "family": "Spreadbury",
    "given": "Trevor"
  }, {
    "family": "O'Brien",
    "given": "Sarah"
  }, {
    "family": "Ferrier",
    "given": "Nicola"
  }, {
    "family": "Cossairt",
    "given": "Oliver"
  }, {
    "family": "Chan",
    "given": "Maria"
  }],
  "container-title": "Microscopy and Microanalysis",
  "DOI": "10.1017/S1431927620023806",
  "ISSN": "1431-9276, 1435-8115",
  "issue": "S2",
  "issued": {
    "date-parts": [
      [2020, 8]
    ]
  },
  "language": "en",
  "page": "3096-3097",
  "publisher": "Cambridge University Press",
  "source": "Cambridge University Press",
  "title": "Constructing Self-Labeled Materials Imaging Datasets from Open Access Scientific Journals with EXSCLAIM!",
  "type": "article-journal",
  "URL": "https://www.cambridge.org/core/journals/microscopy-and-microanalysis/article/constructing-selflabeled-materials-imaging-datasets-from-open-access-scientific-journals-with-exsclaim/7549DC118103BEA2591447961289D23E#article",
  "volume": "26"
}]
```

The format of each entry in this format is `"attribute": value`, and the
`attribute` (sans quotes) is what should be used in the replacement field.
Note that the `attribute` is case sensitive: `${DOI}` will work, but `${doi}`
will not.

## Release Notes

### 1.0.0

Initial release of Zotenote, with customisable templates.
