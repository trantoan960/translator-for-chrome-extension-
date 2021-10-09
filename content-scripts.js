console.log("Content script is running...", chrome);

let selectionText = "";

const bodyDOM = document.querySelector("body");

function getSelectedText() {
  let selectedText = "";

  // window.getSelection
  if (window.getSelection) {
    selectedText = window.getSelection().toString();
  }
  // document.getSelection
  else if (document.getSelection) {
    selectedText = document.getSelection().toString();
  }
  // document.selection
  else if (document.selection) {
    selectedText = document.selection.createRange().text;
  } else return "";

  return selectedText;
}

function getSelectedTextNode() {
  let selectedText = "";

  // window.getSelection
  if (window.getSelection) {
    selectedText = window.getSelection();
  }
  // document.getSelection
  else if (document.getSelection) {
    selectedText = document.getSelection();
  }
  // document.selection
  else if (document.selection) {
    selectedText = document.selection.createRange();
  } else return "";

  return selectedText;
}

function getRangeSectionText() {
  const selectionTextNode = getSelectedTextNode();

  const getRange = selectionTextNode.getRangeAt(0);
  const selectionRect = getRange.getBoundingClientRect();

  return selectionRect;
}

function renderTooltipTranslator(selectionTextRange, selectionText) {
  const tooltipWrapper = document.createElement("div");
  tooltipWrapper.id = "translator-ext-rhpteam";
  const tooltipIcon = document.createElement("div");
  tooltipIcon.classList.add("translator-ext-icon");
  tooltipIcon.innerHTML = `<svg width="20px" height="20px" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg"><g fill="#fff" fill-rule="evenodd" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" transform="translate(2 2)"><path d="m16.5 8.5v-6c0-1.1045695-.8954305-2-2-2h-6c-1.1045695 0-2 .8954305-2 2v6c0 1.1045695.8954305 2 2 2h6c1.1045695 0 2-.8954305 2-2z"/><path d="m4.5 6.50344846h-2.00001427c-1.1045695 0-2 .8954305-2 2v5.99943324c0 1.1045695.8954305 2 2 2h.00345627l6.00001428-.0103718c1.10321833-.0019065 1.99654372-.8967771 1.99654372-1.999997v-1.9925129"/><g transform="translate(2.502 9.5)"><path d="m2.998 1.003h-3"/><path d="m4.49841597 2.5c-.33333333.33333333-.66666667.66666667-1 1s-1.16666667.83333333-2.5 1.5"/><path d="m.99841597 1.00316806c.33333333 1.16613866.83333333 1.99894398 1.5 2.49841597s1.5.99894398 2.5 1.49841597"/></g><g transform="translate(8.5 2.5)"><path d="m3 0-3 6"/><path d="m3 0 3 6"/><path d="m3 2v4" transform="matrix(0 1 -1 0 7 1)"/></g></g></svg>`;

  tooltipWrapper.appendChild(tooltipIcon);

  // determine top, left of tooltip
  const top = selectionTextRange.top + selectionTextRange.height + 6 + "px";
  const left =
    selectionTextRange.left +
    (selectionTextRange.width / 2 - tooltipWrapper.offsetWidth / 2) +
    "px";

  tooltipWrapper.style.position = "absolute";
  tooltipWrapper.style.background = "green";
  tooltipWrapper.style.cursor = "pointer";
  tooltipWrapper.style.padding = "4px";
  tooltipWrapper.style.top = top;
  tooltipWrapper.style.left = left;

  bodyDOM.appendChild(tooltipWrapper);

  // lang nghe khi ng dung click vao icon transaltor
  if (tooltipWrapper) {
    tooltipWrapper.addEventListener("click", async () => {
      console.log("hihi", selectionText);
      if (selectionText.length > 0) {
        const result = await fetch(
          `http://localhost:3000/api/translator?keywords=${selectionText}&input=en&output=vi`
        );

        const resultJson = await result.json();

        renderTooltipResultTranslator(
          selectionTextRange,
          selectionText,
          resultJson.text
        );
      }
    });
  }
}

function renderTooltipResultTranslator(
  selectionTextRange,
  selectionText,
  selectionTextTranslated
) {
  const tooltipWrapper = document.createElement("div");
  tooltipWrapper.id = "translator-result-ext-rhpteam";
  const tooltipContainer = document.createElement("div");
  tooltipContainer.classList.add("translator-result-ext-container");
  tooltipContainer.innerHTML = `
    <label>
      Input:
      <span>${selectionText}</span>
    </label>
    <br>
    <label>
      Output:
      <span>${selectionTextTranslated}</span>
    </label>
  `;

  tooltipWrapper.appendChild(tooltipContainer);

  // determine top, left of tooltip
  const top = selectionTextRange.top - selectionTextRange.height - 6 + "px";
  const left =
    selectionTextRange.left +
    (selectionTextRange.width / 2 - tooltipWrapper.offsetWidth / 2) +
    "px";

  tooltipWrapper.style.position = "absolute";
  tooltipWrapper.style.background = "white";
  tooltipWrapper.style.cursor = "pointer";
  tooltipWrapper.style.padding = "4px";
  tooltipWrapper.style.top = top;
  tooltipWrapper.style.left = left;

  bodyDOM.appendChild(tooltipWrapper);
}

// lay dk selection text
bodyDOM.addEventListener("mouseup", () => {
  // remove before translated popup/tooltip, BAD WAY
  // TODO: detect click outside, then we turn off tooltip
  // EX: https://stackoverflow.com/questions/152975/how-do-i-detect-a-click-outside-an-element
  const tooltipResult = document.querySelector(
    "div#translator-result-ext-rhpteam"
  );
  if (tooltipResult) tooltipResult.remove();

  selectionText = getSelectedText();

  if (selectionText.length > 0) {
    const selectionTextRange = getRangeSectionText();

    renderTooltipTranslator(selectionTextRange, selectionText);

    setTimeout(() => {
      const tooltipWrapper = document.querySelector(
        "div#translator-ext-rhpteam"
      );

      if (tooltipWrapper) tooltipWrapper.remove();
    }, 3000);
  }
});
