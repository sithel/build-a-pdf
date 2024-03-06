# build-a-pdf
An attempt at making a configurable book on the fly.... 

_"PDF Potluck"_


# Notes to me... 
Don't forget, this is how to launch the server for local testing

```
$ python -m SimpleHTTPServer 8000
```

# TODOs

### Doc Creation

Need to allow users to define height/width (in pts) of result PDF. Include buttons to auto-set values for Folio on Letter, Folio on A4, Quarto on Letter, Quarto on A4

Include diagram of margins and where they come from

### Generated Doc Content

Need to include free-form text Header option

Need to scale header text to fit in the space provided!

Need to generate Tabel of Contents

Need to allow users the ability to set header gap & page number font size

### PDF Creation

Need to define PDF object:

Currently have something like `['Landscape (3 pages)', 'pdfs/landscape.pdf', 'six', new Set(['c'])]`. Now proposing:

```
{
  title_min: 'Short Title',   \\ for use in ToC & Headers
  desc: 'Free form text to describe contents',  \\ ?? where in the UI does this show? Mouse over?
  pdf_url:  'pdfs/file_name.pdf',
  page_count: 3,
  author_doc: 'Clever Pattern Press',   \\ for use in ToC (should be short)
  author_potluck: 'six',      \\ for use in PDF Potluck UI
  tags: new Set(['a','b','c']),
  target_size: 'folio',       \\ other option is 'quarto' (for now!)
  print_color: 'b&w',         \\ other options: minimal_color, full_color
}
```

With each PDF listed under a Category.

### Tags & Categories

Need to settle on Tags & Categories list.

Need to re-write elements so that Categories & Page Size & Print Levels are high level "suppress"

Need to audit Tags so that they're 'AND' logic to show

### Non-Functioanl UI Cleanup

How to lay out the page??

- Intro / Details (possibly not on this page? Put on main Renegade page?)
- Doc designing / signing size section
- Source Page list section (input)
- Book Page list section (output)
- Preview
- Tag filter list
- Page positioning section
- Header content section

### Google Form

!! Need to make it !! Need to link to it !!

