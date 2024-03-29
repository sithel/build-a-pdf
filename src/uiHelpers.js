function buildPdfEntries(entries, value, el1) {
  entries.forEach( d => {
    console.log("Looking at : ",d);
    var row = document.createElement("div")
    row.innerHTML = `
          <div class="dot-box">
          `
+ tags.reduce( (acc, t) => { return acc+`
  <div class="dot tag-`+t.value+` `+ifTag(d[3], t.value, 'has-tag-')+`"></div>
  `}, "") + `
          </div>
          <div class="item-frame">
            <div class="deleter" onClick="deleteMe(this)">[X]</div>
            <div class="handle"></div>
            <div class="colors full `+((d[6]) ? 'has-color' : '')+`"></div>
            <div class="colors black"></div>
            <div class="frame folio `+((d[5]) ? 'selected-size' : '')+`"></div>
            <div class="frame quarto `+((!d[5]) ? 'selected-size' : '')+`"></div>
            <div class="title">`+d[0]+`</div>
            <div class="author">`+d[2]+`</div>
            <div class="category">`+value+` : `+Array.from(d[3]).join(" ")+`</div>
            <div class="page_count">`+d[4]+`</div>
          </div>
    `
    row.setAttribute("class", ["list-group-item","category-"+value, ifTag(d[3], 'a', 'tag-'),ifTag(d[3], 'b', 'tag-'),ifTag(d[3], 'c', 'tag-'),ifTag(d[3], 'a', 'show-tag-'),ifTag(d[3], 'b', 'show-tag-'),ifTag(d[3], 'c', 'show-tag-')].join(" "),)
    row.setAttribute("data-id", d[1])
    el1.appendChild(row)
  })
}
function ifTag(tags, value, newTag) {
  return (tags.has(value)) ? newTag+value : ''
}

function buildHeader(value, label, el1) {
    var row = document.createElement("div")
    row.setAttribute("class", "list-group-item ignore-elements column-header")
    row.setAttribute("data-id", "column_"+value)
    row.innerHTML = "<span>"+label+"</span><div class='toggle' data-is-expanded=true data-value='"+value+"' onClick='toggleColumnGroup(this)'>[-]</div>"
    el1.appendChild(row)
}

function toggleColumnGroup(el) {
  console.log(el)
  var value = el.getAttribute('data-value')
  var isExpanded = el.getAttribute('data-is-expanded') == 'true'
  el.innerHTML = (isExpanded) ? "[+]" : "[-]"
  el.setAttribute('data-is-expanded', !isExpanded)
  console.log("Updated "+value+" to "+!isExpanded)
  window.reb = document.getElementsByClassName("category-"+value)
  Array.from(document.getElementsByClassName("category-"+value)).forEach(e => { 
    (isExpanded)? e.classList.add("hide-category") : e.classList.remove("hide-category")
  })
}


function toggleTag(el) {
  var value = el.getAttribute('data-value')
  console.log("Poking at ["+value+"]  : ",document.getElementsByClassName("has-tag-"+value)," with ",el.checked," :: ",el)
  Array.from(document.getElementsByClassName("tag-"+value)).forEach(e => {
    (el.checked)? e.classList.add("show-tag-"+value) : e.classList.remove("show-tag-"+value)
  })
}

function versoChange(dropDown) {
  var textField = document.getElementById("verso_custom_header")
  if(dropDown.value == "custom")
    textField.style.display = "inline-block";
  else 
    textField.style.display = "none";
}

function rectoChange(dropDown) {
  var textField = document.getElementById("recto_custom_header")
  if(dropDown.value == "custom")
    textField.style.display = "inline-block";
  else 
    textField.style.display = "none";
}







