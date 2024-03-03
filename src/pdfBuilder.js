async function buildThatPdf(fileNames, isPreview) {
  console.log("Totes going to build that pdf: ",fileNames)

  const pdfDoc = await PDFLib.PDFDocument.create()
  const meta = {
    pageNumFont : await pdfDoc.embedFont(PDFLib.StandardFonts.TimesRoman),
    color : PDFLib.rgb(0,0,0),
    holdForHeader: 30,
    size: 24,
    hPagePlacement: document.getElementById("horizontal_page_positioning").value,
    vPagePlacement: document.getElementById("vertical_page_positioning").value,
    rectoHeader:  document.getElementById("recto_header").value,
    versoHeader:  document.getElementById("verso_header").value,
    title: "Renegade PDF Potluck 2024"
  }

  const pages = fileNames.map(fileName => pullAndPlacePdf(pdfDoc, fileName, meta));
  await Promise.all(pages)
  
  if (isPreview) {
    showPreview(pdfDoc)
  } else {
    makeTheZip(pdfDoc)
  }
}

async function pullAndPlacePdf(pdfDoc, fileName, meta) {
  const sourceBuffer = await fetch(fileName).then((res) => res.arrayBuffer())
  const sourcePdfDoc = await PDFLib.PDFDocument.load(sourceBuffer)
  sourcePdfDoc.getPages().forEach((sourcePdfPage,i) => embedAndPlacePage(pdfDoc, sourcePdfPage,
   {fileName: fileName, sourcePageNumber: i, ...meta}));
}

async function embedAndPlacePage(pdfDoc, sourcePdfPage, meta) {
  const embeddedPage = await pdfDoc.embedPage(sourcePdfPage)
  const newPage = pdfDoc.addPage()
  const pageNumber = pdfDoc.getPageCount()
  console.log("===========["+meta.fileName+"]")
  console.log("   ["+meta.sourcePageNumber+"]   newpage (",newPage.getWidth(),", ",newPage.getHeight(),")    embeddedPage (",embeddedPage.width,", ",embeddedPage.height,") ")

  var isRecto = pageNumber % 2 == 1
  var scale = Math.min(newPage.getWidth() / sourcePdfPage.getWidth(), (newPage.getHeight() - meta.holdForHeader) / sourcePdfPage.getHeight())
  var vgap = newPage.getHeight() - meta.holdForHeader - sourcePdfPage.getHeight()*scale
  var hgap = newPage.getWidth() - sourcePdfPage.getWidth() * scale
  switch(meta.hPagePlacement){
    case 'inner': var x = (isRecto) ? 0 : hgap;     break;
    case 'center': var x = hgap/2.0;                break;
    case 'outer': var x = (isRecto) ? hgap : 0;     break;
  }
  newPage.drawPage(embeddedPage, { x: x, y: vgap/2.0, xScale: scale, yScale: scale});
  drawHeader(newPage, {isRecto: isRecto, pageNumber: pageNumber, scale: scale, vgap: vgap, hgap: hgap, ...meta})
}

function drawHeader(newPage, meta) {
  // TODO : page number should return the end/start of text? for header to abut it?
  drawPageNumber(newPage, meta)
  drawHeaderText(newPage, meta)
}

function drawHeaderText(newPage, meta) {
  switch( (meta.isRecto) ? meta.rectoHeader : meta.versoHeader) {
    case 'section': var pageText = meta.fileName;    break;
    case 'nothing': var pageText = "";          break;
    case 'title': var pageText = meta.title;    break;
  }
  const textWidth = meta.pageNumFont.widthOfTextAtSize(pageText, meta.size)
  const textHeight = meta.pageNumFont.heightAtSize(meta.size)
  var vgap = meta.holdForHeader - textHeight
  var xgap = newPage.getWidth() - textWidth
  newPage.drawText(pageText, {
    x: xgap/2.0,
    y: newPage.getHeight() - textHeight - meta.vgap/2,
    font: meta.pageNumFont,
    size: meta.size,
    color: meta.color,
    lineHeight: meta.size,
  })
}

function drawPageNumber(newPage, meta) {
  const pageNumText = meta.pageNumber + ""
  const pageNumWidth = meta.pageNumFont.widthOfTextAtSize(pageNumText, meta.size)
  const pageNumHeight = meta.pageNumFont.heightAtSize(meta.size)
  var vgap = meta.holdForHeader - pageNumHeight
  var padding = 2
  var x = (meta.isRecto) ? newPage.getWidth() - pageNumWidth - padding : padding
  newPage.drawText(pageNumText, {
    x: x,
    y: newPage.getHeight() - pageNumHeight - vgap/2,
    font: meta.pageNumFont,
    size: meta.size,
    color: meta.color,
    lineHeight: meta.size,
  })
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
      previewFrame.style.width = `450px`;
      previewFrame.style.height = `600px`;
      previewFrame.style.display = '';
  previewFrame.src = pdfDataUri;
  window.scrollTo(0, document.body.scrollHeight);
}