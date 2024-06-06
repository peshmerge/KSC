/*
Part of an somehow an ugly work-around to remove the popup when the user 
outside the popup. 
*/

var popupCount = 0;

// Initialize the count.
window.onload = function () {
  popupCount = 0;
};
/*
For both scripts, I included only the letters that make them distinguishable 
from Arabic and Persian in the case of Central Kurdish, and from other 
latin-based scripts in the case of Northern Kurdish. 
This is again a work-around to avoid displaying the popup on websites where non
Kurdish texts are being highlighted. 

A better solution would be checking the html language code reference attribute
 <html lang=""> which in case of Kurdish could be either
 <html lang="ku"> Kurdish as general (ISO 639-1)
 <html lang="kmr"> Northern kurdish (ISO 639-3)
 <html lang="ckb"> Central Kurdish (ISO 639-3) 

 However, not all Kurdish websites are using this attribute correctly.
*/
const kurdishPersianArabicAlphabet = [
  'ا', 'پ', 'چ', 'ژ', 'ک', 'گ', 'ل', 'ێ', 'ە', 'ڵ', 'ئـ', 'وو', 'ڕ', '	ۆ'
];

const kurdishLatinAlphabet = [
  'Ç', 'Ê', 'Î', 'Ş', 'Û',
  'ç', 'ê', 'î', 'ş', 'û',
];

// Limit the rate of function execution
function debounce(fn, delay) {
  let timer = null;
  return function () {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
};

function showFloatingText(timeout) {
  removeElementByID('floating-text');
  var floatingDiv = document.createElement('div');
  floatingDiv.id = "floatingText";
  floatingDiv.className = "floatingText";
  floatingDiv.textContent = "Copied!";

  // Apply CSS using J
  floatingDiv.style.direction = "ltr";
  floatingDiv.style.position = 'fixed';
  floatingDiv.style.top = '50%';
  floatingDiv.style.left = '50%';
  floatingDiv.style.transform = 'translate(-50%, -50%)';
  floatingDiv.style.backgroundColor = 'rgba(255, 187, 0, 0.8)';
  floatingDiv.style.color = 'white';
  floatingDiv.style.padding = '10px';
  floatingDiv.style.borderRadius = '5px';
  floatingDiv.style.fontSize = '24px';
  floatingDiv.style.zIndex = '100000';
  floatingDiv.style.opacity = '0';
  floatingDiv.style.display = 'none';
  floatingDiv.style.transition = 'opacity 1s ease-in-out';
  document.body.appendChild(floatingDiv);
  floatingDiv.style.display = 'block';
  void floatingDiv.offsetWidth;
  floatingDiv.style.opacity = '1';
  setTimeout(
    () => {
      floatingDiv.style.opacity = '0';
      setTimeout(() => {
        removeElementByID('floating-text');
      }, 1000);
    }, timeout
  );
}
// Show the popup and transliterate the highlighted text on selectionChange event.
document.addEventListener("selectionchange", debounce(function (event) {
  let selection = document.getSelection ? document.getSelection().toString() :
    document.selection.createRange().toString();
  if (selection.length > 0) {
    // addFloatingTextDiv();
    let rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
    popupCount = 1;
    showPopup(rect, selection);
  }
}, 10));

// Ugly work-around (hack) to remove the popup when the user click outside. 
document.addEventListener('click', function (event) {
  if (popupCount == 0) {
    removeElementByID('transliteration-popup');
  } else {
    popupCount = 0;
  }
});


function showPopup(rect, highlighted_text) {
  //Remove any other before adding a new one.
  removeElementByID('transliteration-popup');

  // Declare and create popup
  let popup_element = document.createElement('div');
  popup_element.id = 'transliteration-popup';

  // Check what script are we dealing with, Central Kurdish or Northern Kurdish
  let script_type = detectScript(highlighted_text);
  // Based on the detected script, show the options related to the specific script. 
  if (script_type === "PAS") {
    popup_element.style.direction = "ltr";
    popup_element.style.textAlign = "left";
    popup_element.appendChild(addPASRadioOptions(highlighted_text, script_type));
  } else if (script_type === "LAS") {
    popup_element.style.direction = "rtl";
    popup_element.style.textAlign = "right";
    popup_element.appendChild(addLASRadioOptions(highlighted_text, script_type));
  } else {
    return;
  }
  // Convert the highlighted text based on the detected script
  transliterated_text = transliterate(
    highlighted_text,
    script_type,
    "diacritical"
  );

  // Add a div to contain the transliterated text 
  let transliteration_text_div = document.createElement('div');
  transliteration_text_div.id = "transliterated_text_div";

  transliteration_text_div.style.pointerEvents = "none";


  // Add a P element make it contain the  transliterated text 
  let tratransliterated_text_element = document.createElement('p');
  tratransliterated_text_element.id = "transliterated_element";
  tratransliterated_text_element.innerHTML = transliterated_text;

  // Append the P element to the container div transliteration_text_div
  transliteration_text_div.appendChild(tratransliterated_text_element);


  // Append to the container div transliterationPopup
  popup_element.appendChild(transliteration_text_div);

  // Change position of the transliterationPopup
  popup_element.style.left = `${rect.left + window.scrollX}px`;
  popup_element.style.top = `${rect.top + window.scrollY + rect.height + 10}px`;

  popup_element.addEventListener("click", function (event) {
    popupCount = 1;
    navigator.clipboard.writeText(
      tratransliterated_text_element.innerText
    ).then(function () {
      showFloatingText(2000);
    }).catch(function (error) {
      console.error('Failed to copy seelcted text: ', error);
    });

  });

  popup_element.addEventListener("selectionchange", function (event) {
    popupCount = 1;
    event.preventDefault();
  });

  // Append the transliterationPopup to the page.
  document.body.appendChild(popup_element);
}

/*
Shows the options related to converting script from 
Central Kurdish (Persian-Arabic) to Northern Kurdish (Hawar/Latin) script.
*/
function addPASRadioOptions(highlighted_text, script_type) {
  const container = document.createElement('div');
  container.id = "PAS-options-container";
  setting_element = document.createElement('span');
  setting_element.innerHTML = "<b>Guhartina tîpên (ڕ,ڵ,ح,غ): </b>";
  container.appendChild(setting_element);
  const options_list = ["diacritical", "digraph", "reduced"];
  const options_label = ["(ř ɫ ḧ ẍ)", "(rr ll hh gh)", "(r l h x)"]
  options_list.forEach((option, i) => {
    // Create a new checkbox input element
    const radioButton = document.createElement('input');
    radioButton.type = 'radio';
    radioButton.id = `PAS-${option}`;  // Generate a unique ID
    radioButton.name = "PAS-options";
    radioButton.value = option;
    if (option === 'diacritical') {
      radioButton.checked = true;
    }
    radioButton.addEventListener('click', function () {
      transliterated_text = transliterate(highlighted_text, script_type, option);
      (
        document.getElementById("transliterated_element")
      ).innerHTML = transliterated_text;
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

/*
Shows the options related to converting script from 
Northern Kurdish (Hawar/Latin) to Central Kurdish (Persian-Arabic) script.
*/
function addLASRadioOptions(highlighted_text, script_type) {
  const container = document.createElement('div');
  container.id = "LAS-options-container";
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
    if (option === 'diacritical') {
      radioButton.checked = true;
    }
    radioButton.addEventListener('click', function () {
      transliterated_text = transliterate(
        highlighted_text, script_type, option);
      (
        document.getElementById(
          "transliterated_element"
        )).innerHTML = transliterated_text;
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

function removeElementByID(elemetnID) {
  elementToRemove = document.getElementById(elemetnID);
  if (elementToRemove) {
    elementToRemove.remove();
  }
}

/* 
We use this function to determine the script. See explanation above! 
*/
function detectScript(highlighted_text) {
  const persianArabicSet = new Set(kurdishPersianArabicAlphabet);
  const latinSet = new Set(kurdishLatinAlphabet);
  // console.log(highlighted_text);
  let persianArabicCounter = 0;
  let latinCounter = 0;
  for (let char of highlighted_text) {
    if (persianArabicSet.has(char)) {
      persianArabicCounter = persianArabicCounter + 1;
    }
    if (latinSet.has(char)) {
      latinCounter = latinCounter + 1;
    }
  }
  if (persianArabicCounter > latinCounter) {
    // PAS : Persian-Arabic-based script (Central Kurdish) 
    // or Northern Kurdish written in this script.

    return "PAS";
  } else if (persianArabicCounter < latinCounter) {
    // LAS : Latin-based script aka Hawar script (therefore Northern Kurdish) 
    return "LAS";
  }
  return;
}

// The actual transliterate function that uses functions from Kurdinus.js
function transliterate(highlighted_text, script_type, option = "diacritical") {
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