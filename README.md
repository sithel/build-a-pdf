# build-a-pdf
An attempt at making a configurable book on the fly.... 

_"PDF Potluck"_


# Notes to me... 
Don't forget, this is how to launch the server for local testing

```
$ python -m SimpleHTTPServer 8000
```

# Completed Features

- Output PDF (definable height/width)
  - has helpful pre-sets
  - has info diagram
- Generated Doc Content
  - customizable page number size
  - customizable gap between header & content


# TODOs

### Generated Doc Content

Need to include free-form text Header option

Need to scale header text to fit in the space provided!

Need to vertically center content w/o headers


### Tags & Categories

Need to settle on Tags list.

Need to re-write elements so that Categories & Page Size & Print Levels are high level "suppress"

Need to audit Tags so that they're 'AND' logic to show


## PDF Creation

Would be nice define PDF object:

Currently have an array, notes from code:

```
    // 0 = display name
    // 1 = PDF url
    // 2 = user name
    // 3 = tags
    // 4 = page count
    // 5 = isFolio
    // 6 = hasColor
...
      ['Hard Crack', 'pdfs/six_sugar.pdf', 'six', new Set(), 1, true, false],
```

But at some point it'd be nice if it was:

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

(though... maybe overkill? The array is working just fine for now... Array is certainly easier to export from a spreadsheet... )

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

