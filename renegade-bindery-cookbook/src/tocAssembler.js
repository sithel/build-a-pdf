function buildToc(pdfDoc, newPage, meta, isFolio) {
  const w = newPage.getWidth();
  const h = newPage.getHeight();
  const pageText = "Recipes";  
  let title_x, fontSize, tile_y, lower_title_boundry;
  [title_x, fontSize] = window.center_title_text(w, h, pageText, 0.8, meta);  
  const dumb = window.find_y_for_text(h, fontSize, 0.8, meta);
  tile_y = dumb[0];
  lower_title_boundry = dumb[1];
  newPage.drawText(pageText, {
    x: title_x,
    y: tile_y,
    font: meta.pageNumFont,
    size: fontSize,
    color: meta.color,
    lineHeight: fontSize,
  })
  const sample_list = buildRecipeDataList(meta.fileNames) ;//[["sharks",7],["candy",14],["winter", 666]];
  const height_gap = 2;
  const list_font_size = fontSize / 2;
  renderList(newPage, w, lower_title_boundry, sample_list, list_font_size, height_gap, meta);
}

/**
 * @return an array [ 0 - recipe text,  1 - page number,   2 - bool; should you display page number]
 */
function buildRecipeDataList(fileNames) {
  let running_sum = 1;
  let pre_toc = true;

  const excludedList = ["pdfs/blank_page.pdf","pdfs/super_blank_page.pdf", SPECIAL_TOC_FILENAME_FOLIO, SPECIAL_TOC_FILENAME_QUARTO];
  
  let list = fileNames.map( filename => {
    let recipe = look_up_recipe_by_url(filename)[0];
    let recipe_name = recipe[0] + " -- " +recipe[2];
    let recipe_page = running_sum;
    console.log(" > "+recipe_name+" @ "+recipe_page+" :: "+recipe)
    running_sum += recipe[4];
    if (excludedList.indexOf(filename) >= 0) {
      return [];
    } else {
      return [recipe_name, recipe_page];
    }
  });
  list = list.filter( x => { return x.length > 0; });
  console.log("TOC contents ",list)
  return list 
}
/*
 * @param list = [] of [title, page_loc]
 */
function renderList(page, w, h, list, list_font_size, height_gap, meta) {
  const rows = list.length + (list.length  * height_gap);
  const fontSize = Math.min(list_font_size, h / rows);
  const padding = 20;
  list.forEach( (row, i) => {
    // TODO : push down the max row size to be something reasonable 
    y = i * fontSize + i*fontSize * height_gap + fontSize;
    window.renderRow(page, padding, w, h - y, fontSize, row[0]+" ", row[1], meta);
  })
}

function renderRow(page, padding, w, y, font_size, text, num, meta){
  page.drawText(text, {
    x: padding,
    y: y,
    font: meta.pageNumFont,
    size: font_size,
    color: meta.color,
    lineHeight: font_size,
  })
  if (num == -1)
    return;
  const numTxt = " "+num;
  const numWidth = meta.pageNumFont.widthOfTextAtSize(numTxt, font_size)
  page.drawText(numTxt, {
    x: w - padding - numWidth,
    y: y,
    font: meta.pageNumFont,
    size: font_size,
    color: meta.color,
    lineHeight: font_size,
  })
  const dot_start = padding + meta.pageNumFont.widthOfTextAtSize(text, font_size)
  const error = meta.pageNumFont.widthOfTextAtSize("...", font_size)
  const dot_end = w - padding - numWidth + error/2;
  fill_with_dots(page, y, dot_start, dot_end, font_size, error, meta);
}

function fill_with_dots(page, y, dot_start, dot_end, font_size, error, meta) {
  const starting_count = (dot_end - dot_start)/font_size * 2; 
  const s = new Array(parseInt(starting_count)).fill(".").join(".");

  spin_on_s(s, dot_end - dot_start, font_size, error, meta)
  page.drawText(s, {
    x: dot_start,
    y: y,
    font: meta.pageNumFont,
    size: font_size,
    color: meta.color,
    lineHeight: font_size,
  })
}

function spin_on_s(s, target, font_size, error, meta) {
  const w = meta.pageNumFont.widthOfTextAtSize(s, font_size)
  if (w < (target - error)) {
    new_s = s +"."
    return spin_on_s(new_s, target, font_size, error, meta)
  } else if (w > (target + error)) {
    new_s = s.substring(0,s.length-1)
    return spin_on_s(new_s, target, font_size, error, meta)
  } else {
    return w
  }
}

function find_y_for_text(h, font_size, percentage_up_from_bottom, meta) {
  const fHeight = meta.pageNumFont.heightAtSize(font_size);
  const title_y = h * percentage_up_from_bottom - fHeight / 2;
  const lower_title_boundry = title_y - fHeight;
  console.log("sharks ",title_y,", ",lower_title_boundry)
  return [title_y, lower_title_boundry];
}

function center_title_text(w, h, given_string, width_coverage_percentage, meta) {
  const starting_font_guess = h * 0.05;
  const title_width = w * width_coverage_percentage;
  const fontSize = calcFontSizeToFitText(given_string, starting_font_guess, title_width, meta);
  const text_width = meta.pageNumFont.widthOfTextAtSize(given_string, fontSize)
  const title_x = w / 2 - text_width / 2;
  return [title_x, fontSize];
}

/**
 * @param starting_size - desired font size (only scales down from there)
 * @param max_width  - in pts 
 * @return int step down in font that 
 */
function calcFontSizeToFitText(given_text, starting_size, max_width, meta) {
  let curSize = starting_size 
  while (!_doesTextFit(given_text, curSize, max_width, meta)){
    curSize--;
  }
  return curSize
}

// @return boolean - it fits
function _doesTextFit(given_text, size, max_width, meta) {
  return meta.pageNumFont.widthOfTextAtSize(given_text, size) <= max_width;
}