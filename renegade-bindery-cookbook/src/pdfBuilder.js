async function buildThatPdf(fileNames, isPreview) {
  console.log("Totes going to build that pdf: ",fileNames)

  const padding = parseInt(document.getElementById("header_padding").value)
  const fontSize = parseInt(document.getElementById("page_number_font_size").value)

  const exportWidth = parseInt(document.getElementById("exported_width").value)
  const exportHeight = parseInt(document.getElementById("exported_height").value)
  
  const pdfDoc = await PDFLib.PDFDocument.create()

  const headerFontEnum = document.getElementById("hearer_toc_font").value

  if (headerFontEnum == "TimesRoman") {
    var headerFont = await pdfDoc.embedFont(PDFLib.StandardFonts.TimesRoman)
  } else if (headerFontEnum == "Courier") {
    var headerFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Courier)
  } else if (headerFontEnum == "Helvetica") {
    var headerFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica)
  } else if (headerFontEnum == "ComicSans") {
    pdfDoc.registerFontkit(window.fontkit);
    var headerFont = await pdfDoc.embedFont(await fetch('assets/ComicSans.ttf').then(res => res.arrayBuffer()));
  } else {
    pdfDoc.registerFontkit(window.fontkit);
    var headerFont = await pdfDoc.embedFont(await fetch('assets/GEORGIA.TTF').then(res => res.arrayBuffer()));
  }

  const meta = {
    pageNumFont : headerFont,
    color : PDFLib.rgb(0,0,0),
    headerPadding: padding,
    holdForHeader: fontSize + padding,
    size: fontSize,
    dimensions: [exportWidth, exportHeight],
    hPagePlacement: document.getElementById("horizontal_page_positioning").value,
    vPagePlacement: document.getElementById("vertical_page_positioning").value,
    rectoHeader:  document.getElementById("recto_header").value,
    versoHeader:  document.getElementById("verso_header").value,
    rectoCustomHeader: document.getElementById("recto_custom_header").value,
    versoCustomHeader: document.getElementById("verso_custom_header").value,
    title: "Renegade PDF Potluck 2024",
    debugOutline: document.getElementById("debug_box_outline").checked
  }

  meta.fileNames = fileNames
  for(let fileName of fileNames) {
    await addPdfContent(pdfDoc, fileName, meta);
  }
  
  if (isPreview) {
    showPreview(pdfDoc)
  } else {
    makeTheZip(pdfDoc)
  }
}

async function addPdfContent(pdfDoc, fileName, meta) {
  if (fileName == SPECIAL_TOC_FILENAME_FOLIO || fileName == SPECIAL_TOC_FILENAME_QUARTO) {
    window.addToC(pdfDoc, fileName, meta);
  } else {
    await pullAndPlacePdf(pdfDoc, fileName, meta);
  }
}

async function addToC(pdfDoc, fileName, meta) {
  meta.newPageBuilder = function() {
    return pdfDoc.addPage(meta.dimensions);
  }
  const newPage = meta.newPageBuilder()
  buildToc(pdfDoc, newPage, meta, fileName == SPECIAL_TOC_FILENAME_FOLIO);
}

async function pullAndPlacePdf(pdfDoc, fileName, meta) {
  const sourceBuffer = await fetch(fileName).then((res) => res.arrayBuffer())
  const sourcePdfDoc = await PDFLib.PDFDocument.load(sourceBuffer)
  await Promise.all(sourcePdfDoc.getPages().map((sourcePdfPage,i) => embedAndPlacePage(pdfDoc, sourcePdfPage,
   {fileName: fileName, sourcePageNumber: i, ...meta})));
}

async function embedAndPlacePage(pdfDoc, sourcePdfPage, meta) {
  const embeddedPage = await pdfDoc.embedPage(sourcePdfPage)
  const newPage = pdfDoc.addPage(meta.dimensions)
  const pageNumber = pdfDoc.getPageCount()
  console.log("===========["+meta.fileName+"]")
  const entry = look_up_recipe_by_url(meta.fileName)[0]

  var isRecto = pageNumber % 2 == 1

  const page_top = drawHeader(newPage, {
    recipe: entry, 
    isRecto: isRecto, 
    pageNumber: pageNumber, 
    scale: scale, 
    vgap: vgap, 
    hgap: hgap, 
    ...meta})
  // newPage.getHeight() - meta.holdForHeader (previous)
  var scale = Math.min(newPage.getWidth() / sourcePdfPage.getWidth(), page_top / sourcePdfPage.getHeight())
  var vgap = page_top - sourcePdfPage.getHeight()*scale
  var hgap = newPage.getWidth() - sourcePdfPage.getWidth() * scale
  switch(meta.hPagePlacement){
    case 'inner': var x = (isRecto) ? 0 : hgap;     break;
    case 'center': var x = hgap/2.0;                break;
    case 'outer': var x = (isRecto) ? hgap : 0;     break;
  }
  switch(meta.vPagePlacement){
    case 'top': var y = vgap;         break;
    case 'center': var y = vgap/2.0;  break;
    case 'bottom': var y = 0;         break;
  }
  newPage.drawPage(embeddedPage, { x: x, y: y, xScale: scale, yScale: scale});
  if (meta.debugOutline) {
    newPage.drawRectangle({
      x: x,
      y: y,
      width: sourcePdfPage.getWidth() * scale,
      height: sourcePdfPage.getHeight() * scale,
      borderWidth: 2,
      borderColor: meta.color,
      color: meta.color,
      opacity: 0.0,
      borderOpacity: 0.75,
    })
  }
}

/**
 * @return y - max height PDF should reach to
 */
function drawHeader(newPage, meta) {
  if (no_header_urls.indexOf(meta.fileName) >= 0) {
    console.log("Skipping headers for ",meta.fileName)
    return newPage.getHeight()
  }
  let y, x;
  [y, x] = drawPageNumber(newPage, meta)
  let header_y = drawHeaderText(newPage, meta, y, x) - meta.headerPadding
  //console.log(" drawHeader : "+header_y+" vs "+newPage.getHeight()+" - "+(meta.size*1.25)+" or "+meta.headerPadding)
  return header_y
}

function drawHeaderText(newPage, meta, num_y, num_x) {
  switch( (meta.isRecto) ? meta.rectoHeader : meta.versoHeader) {
    case 'section': var pageText = meta.recipe[0];    break;
    case 'nothing': var pageText = "";                break;
    case 'title': var pageText = meta.title;          break;
    case 'author': var pageText = meta.recipe[2];     break;
    case 'custom': var pageText = (meta.isRecto) ? meta.rectoCustomHeader : meta.versoCustomHeader;     break;
  }
  const textWidth = meta.pageNumFont.widthOfTextAtSize(pageText, meta.size)
  const textHeight = meta.pageNumFont.heightAtSize(meta.size)
  var vgap = meta.holdForHeader - textHeight
  var xgap = (meta.isRecto) ? num_x - textWidth : newPage.getWidth() - textWidth - num_x
  const y = newPage.getHeight() - meta.size*1.25
  newPage.drawText(pageText, {
    x: (meta.isRecto) ? xgap/2.0 : xgap/2.0 + num_x,
    y: y,
    font: meta.pageNumFont,
    size: meta.size,
    color: meta.color,
    lineHeight: meta.size,
  })
  return y
}

/**
 * @return [y (lower left) of text, x (edge of text closest to center span)]
 */
function drawPageNumber(newPage, meta) {
  const pageNumText = meta.pageNumber + ""
  const pageNumWidth = meta.pageNumFont.widthOfTextAtSize(pageNumText, meta.size)
  const pageNumHeight = meta.pageNumFont.heightAtSize(meta.size)
  var vgap = meta.holdForHeader - pageNumHeight
  var padding = 2
  var x = (meta.isRecto) ? newPage.getWidth() - pageNumWidth - padding : padding
  var y = newPage.getHeight() - meta.size*1.25 // pageNumHeight - vgap/2,
  newPage.drawText(pageNumText, {
    x: x,
    y: y,
    font: meta.pageNumFont,
    size: meta.size,
    color: meta.color,
    lineHeight: meta.size,
  })
  return [y, (meta.isRecto) ? x : x + pageNumWidth]
}

async function makeTheZip(pdfToSave) {
  let zip = new JSZip();
  await pdfToSave.save().then(pdfBytes => {
    zip.file('result_file.pdf', pdfBytes);
  });
  zip.generateAsync({ type: "blob" }).then(blob => {
    saveAs(blob, "the_result.zip");
  });
}

async function showPreview(resultPDF){
  const pdfDataUri = await resultPDF.saveAsBase64({ dataUri: true });
  const viewerPrefs = resultPDF.catalog.getOrCreateViewerPreferences();
  viewerPrefs.setHideToolbar(false);
  viewerPrefs.setHideMenubar(false);
  viewerPrefs.setHideWindowUI(false);
  viewerPrefs.setFitWindow(true);
  viewerPrefs.setCenterWindow(true);
  viewerPrefs.setDisplayDocTitle(true);
  const previewFrame = document.getElementById('pdf');
  previewFrame.parentNode.style.display = '';
  previewFrame.src = pdfDataUri;
  window.scrollTo(0, document.body.scrollHeight);
}