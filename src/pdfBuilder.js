async function buildThatPdf(fileNames) {
  console.log("Totes going to build that pdf: ",fileNames)

  const pdfDoc = await PDFLib.PDFDocument.create()
  const pages = fileNames.map(fileName => pullAndPlacePdf(pdfDoc, fileName) );
  console.log("Pre promise")
  await Promise.all(pages)
  console.log("Post promise")
  
  makeTheZip(pdfDoc)
}

async function pullAndPlacePdf(pdfDoc, fileName) {
  const sourceBuffer = await fetch(fileName).then((res) => res.arrayBuffer())
  const sourcePdfDoc = await PDFLib.PDFDocument.load(sourceBuffer)
  const sourcePdfPage = sourcePdfDoc.getPages()[0]
  const embeddedPage = await pdfDoc.embedPage(sourcePdfPage)
  const newPage = pdfDoc.addPage()
  newPage.drawPage(embeddedPage, {
    x: 0,
    y: 0,
    xScale: newPage.getWidth() / sourcePdfPage.getWidth(),
    yScale: newPage.getHeight() / sourcePdfPage.getHeight(),
    rotate: PDFLib.degrees(0),
    opacity: 0.75,
  });
  console.log("Rebecca : ", fileName," : w,h ",sourcePdfPage.getWidth(),", ",sourcePdfPage.getHeight()," : sourcePdfPage : ",sourcePdfPage)
  console.log("Rebecca : ", fileName," : w,h ",newPage.getWidth(),", ",newPage.getHeight()," : newPage : ",newPage)
  console.log("Rebecca : ", fileName," : w,h ",embeddedPage.width,", ",embeddedPage.height," : embeddedPage : ",embeddedPage)

}


async function makeTheZip(pdfToSave) {
  console.log("Starting makeTheZip")
  let zip = new JSZip();
  await pdfToSave.save().then(pdfBytes => {
    zip.file('result_file.pdf', pdfBytes);
  });
  console.log(" > we've saved the PDF");
  zip.generateAsync({ type: "blob" }).then(blob => {
    console.log(" >> post generating an async blob?");
    saveAs(blob, "the_result.zip");
  });
}