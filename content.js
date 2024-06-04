let left_position = 0;
let top_position = 0;
const kurdishPersianArabicAlphabet = [
  'ا', 'ب', 'پ', 'ت', 'ج', 'چ', 'ح', 'خ', 'د', 'ر', 'ز', 'ژ', 'س', 'ش', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'ه', 'و', 'ی', 'ێ', 'ە'
];

const kurdishLatinAlphabet = [
  'A', 'B', 'C', 'Ç', 'D', 'E', 'Ê', 'F', 'G', 'H', 'I', 'Î', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'Ş', 'T', 'U', 'Û', 'V', 'W', 'X', 'Y', 'Z',
  'a', 'b', 'c', 'ç', 'd', 'e', 'ê', 'f', 'g', 'h', 'i', 'î', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 'ş', 't', 'u', 'û', 'v', 'w', 'x', 'y', 'z'
];

document.addEventListener('mouseup', function (event) {
  let highlighted_text = window.getSelection().toString();
  if (highlighted_text.length > 0) {
    let rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
    showIcon(rect, highlighted_text);
  }
});

document.addEventListener('click', function (event) {
  // Check if the click happened outside of the icon or the popup
  if (!event.target.closest('#lookupIcon') && !event.target.closest('#lookupPopup')) {
    remove_popup();
  }
});

function showIcon(rect,highlighted_text) {
  remove_icon();
  let icon = document.createElement('div');
  icon.id = 'lookupIcon';
  icon.style.position = 'absolute';

  left_position = `${rect.left + window.scrollX}px`;
  top_position = `${rect.top + window.scrollY + rect.height}px`;

  icon.style.left = `${rect.right + window.scrollX}px`;
  icon.style.top = `${rect.top + window.scrollY}px`;

  icon.style.width = '25px';
  icon.style.height = '25px';

  icon.style.backgroundImage = `url(${chrome.runtime.getURL('icons/icon16.png')})`;
  icon.style.backgroundSize = 'cover';
  icon.style.cursor = 'pointer';
  icon.addEventListener('click', function () {
    showPopup(highlighted_text);
    icon.remove(); // Remove the icon after clicking it
  });
  document.body.appendChild(icon);
}


function showPopup(highlighted_text) {
  //Remove any other before adding a new one.
  remove_popup();

  // Declare and create popup
  let popup_element = document.createElement('div');
  popup_element.id = 'lookupPopup';

  // Check what script are we dealing with, Central Kurdish or Northern Kurdish
  let script_type = detectScript(highlighted_text);

  // Based on the detected script, show the options related to the specific script. 
  if (script_type === "PAS"){
    popup_element.style.direction="ltr";
    popup_element.style.textAlign="left";
    popup_element.appendChild(addPASRadioOptions(highlighted_text,script_type));
  } else if (script_type === "LAS"){
    popup_element.style.direction="rtl";
    popup_element.style.textAlign="right";
    popup_element.appendChild(addLASRadioOptions(highlighted_text,script_type));
  }
  // Convert the highlighted text based on the detected script
  transliterated_text = transliterate(highlighted_text, script_type, "diacritical");

  // Add a div to contain the transliterated text 
  let transliteration_text_div = document.createElement('div');
  transliteration_text_div.id = "transliterated_text_div";
  transliteration_text_div.addEventListener("click", function(event) {
    event.preventDefault(); // Prevents the default action
    event.stopPropagation(); // Stops the event from propagating
  });
  transliteration_text_div.style.pointerEvents = "none";

  
  // Add a P element make it contain the  transliterated text 
  let tratransliterated_text_element = document.createElement('p');
  tratransliterated_text_element.id= "transliterated_element";
  tratransliterated_text_element.innerHTML = transliterated_text;
  
  // Append the P element to the container div transliteration_text_div
  transliteration_text_div.appendChild(tratransliterated_text_element);


  // Append the transliteration_text_div element to the container div lookupPopup
  popup_element.appendChild(transliteration_text_div);

  // Change position of the lookupPopup
  popup_element.style.left = left_position;
  popup_element.style.top = top_position;
  
  // Append the lookupPopup to the page.
  document.body.appendChild(popup_element);
}

// Shows the options related to converting script from Central Kurdish (Persian-Arabic) to Northern Kurdish (Hawar/Latin) script.
function addPASRadioOptions(highlighted_text,script_type) {
  const container = document.createElement('div');
  container.id= "PAS-options-container";
  setting_element = document.createElement('span');
  setting_element.innerHTML = "<b>Guhartina tîpên (ڕ,ڵ,ح,غ): </b>";
  container.appendChild(setting_element);
  const options_list = ["diacritical", "digraph", "reduced"];
  const options_label = ["(ř ɫ ḧ ẍ)", "(rr ll hh gh)","(r l h x)"]
  options_list.forEach((option, i) => {
      // Create a new checkbox input element
      const radioButton = document.createElement('input');
      radioButton.type = 'radio';
      radioButton.id = `PAS-${option}`;  // Generate a unique ID
      radioButton.name = "PAS-options";
      radioButton.value = option;
      if (option === 'diacritical'){
        radioButton.checked = true;
      }
      radioButton.addEventListener('click', function () {
        transliterated_text = transliterate(highlighted_text, script_type, option);
        (document.getElementById("transliterated_element")).innerHTML = transliterated_text;
    });

    // Create a label for the checkbox
    const label = document.createElement('label');
    label.htmlFor = radioButton.id;
    label.appendChild(document.createTextNode(options_label[i]));
    container.appendChild(radioButton);
    container.appendChild(label);
  });
  return container;
}

// Shows the options related to converting script from Northern Kurdish (Hawar/Latin) to Central Kurdish (Persian-Arabic) script.
function addLASRadioOptions(highlighted_text, script_type) {
  const container = document.createElement('div');
  container.id= "LAS-options-container";
  setting_element = document.createElement('span');
  setting_element.innerHTML = "<b>(ch gh hh sh ll rr) بکرێن بە: </b>";
  container.appendChild(setting_element);
  const options_list = ["diacritical", "digraph"];
  const options_label = ["(چ غ ح ش ڵ ڕ)", "(جه‍ گه‍ هه‍ سه‍ لل رر)"]
  options_list.forEach((option, i) => {
    // Create a new checkbox input element
    const radioButton = document.createElement('input');
    radioButton.type = 'radio';
    radioButton.id = `LAS-${option}`;  // Generate a unique ID
    radioButton.name = "LAS-options";
    radioButton.value = option;
    if (option === 'diacritical'){
      radioButton.checked = true;
    }
    radioButton.addEventListener('click', function () {
      transliterated_text = transliterate(highlighted_text, script_type, option);
      (document.getElementById("transliterated_element")).innerHTML = transliterated_text;
    });

    // Create a label for the checkbox
    const label = document.createElement('label');
    label.htmlFor = radioButton.id;
    label.appendChild(document.createTextNode(options_label[i]));
    container.appendChild(radioButton);
    container.appendChild(label);
  });
  return container;
}


function remove_icon() {
  icon = document.getElementById('lookupIcon');
  if (icon) {
    icon.remove();
  }
}
function remove_popup() {
  popup = document.getElementById('lookupPopup');
  if (popup) {
    popup.remove();
  }
}

//  We use this function to determine the script. It's not always accurate, but it's a rough estimation since not all Kurdish websites use the correct 
//   language code (ISO639-3) tag in html <html lang="">. ckb for Central Kurdish or kmr for Northern Kurdish.
function detectScript(highlighted_text) {
  const persianArabicSet = new Set(kurdishPersianArabicAlphabet);
  const latinSet = new Set(kurdishLatinAlphabet);
 
  let persianArabicCounter = 0;
  let latinCounter = 0;
  for (let char of highlighted_text) {
    if (persianArabicSet.has(char)) {
      persianArabicCounter =persianArabicCounter + 1;
    }
    if (latinSet.has(char)) {
      latinCounter = latinCounter+ 1;
    }
  }
  // PAS : Persian-Arabic-based script (Central Kurdish or Northern Kurdish written in this scrip
  // LAS : Latin-based script aka Hawar script (therefore Northern Kurdish) 
  return persianArabicCounter > latinCounter ? "PAS" : "LAS";
}

function transliterate(highlighted_text, script_type, option="diacritical") {
  if (script_type === "PAS") {
    // Persian-Arabic to Latin
    output = TransliterateAr2La(highlighted_text, option);
    output = ChangeCase(output, "sentence");

  } else if (script_type === "LAS") {
    //Latin to Arabic
    output = TransliterateLa2Ar(highlighted_text.toLowerCase(), option);
  }
  return output;
}
