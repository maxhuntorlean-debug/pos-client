export function dialogsHtml() {
  return `
    <div id="choiceOverlay" class="dialogOverlay" aria-hidden="true"><div class="dialogBox"><div id="choiceTitle" class="dialogTitle"></div><div id="choiceButtons" class="dialogButtons"></div></div></div>
    <div id="confirmOverlay" class="dialogOverlay" aria-hidden="true"><div class="dialogBox"><div id="confirmTitle" class="dialogTitle"></div><div id="confirmText" class="dialogText"></div><div class="dialogButtons dialogButtonsRow"><button id="confirmYes" class="dialogButton" type="button">Да</button><button id="confirmNo" class="dialogButton" type="button">Нет</button></div></div></div>
    <div id="messageOverlay" class="dialogOverlay" aria-hidden="true"><div class="dialogBox"><div id="messageTitle" class="dialogTitle"></div><div id="messageText" class="dialogText"></div><div class="dialogButtons"><button id="messageOk" class="dialogButton" type="button">OK</button></div></div></div>`;
}

export function showChoice(title, choices) {
  const overlay = document.getElementById("choiceOverlay"), titleElement = document.getElementById("choiceTitle"), buttons = document.getElementById("choiceButtons"); if (!overlay || !titleElement || !buttons) return;
  titleElement.textContent = title; buttons.innerHTML = "";
  choices.forEach(([text, action]) => { const button = document.createElement("button"); button.type = "button"; button.className = "dialogButton"; button.textContent = text; button.addEventListener("click", () => { overlay.classList.remove("show"); overlay.setAttribute("aria-hidden", "true"); if (typeof action === "function") action(); }); buttons.appendChild(button); });
  overlay.classList.add("show"); overlay.setAttribute("aria-hidden", "false");
}

export function showConfirm(title, text, onYes, onNo = null) {
  const overlay = document.getElementById("confirmOverlay"), titleElement = document.getElementById("confirmTitle"), textElement = document.getElementById("confirmText"), yes = document.getElementById("confirmYes"), no = document.getElementById("confirmNo"); if (!overlay || !titleElement || !textElement || !yes || !no) return;
  titleElement.textContent = title; textElement.textContent = text;
  const close = () => { overlay.classList.remove("show"); overlay.setAttribute("aria-hidden", "true"); };
  yes.onclick = () => { close(); if (typeof onYes === "function") onYes(); }; no.onclick = () => { close(); if (typeof onNo === "function") onNo(); };
  overlay.classList.add("show"); overlay.setAttribute("aria-hidden", "false");
}

export function showMessage(title, text, onOk = null) {
  const overlay = document.getElementById("messageOverlay"), titleElement = document.getElementById("messageTitle"), textElement = document.getElementById("messageText"), ok = document.getElementById("messageOk"); if (!overlay || !titleElement || !textElement || !ok) return;
  titleElement.textContent = title; textElement.textContent = text;
  ok.onclick = () => { overlay.classList.remove("show"); overlay.setAttribute("aria-hidden", "true"); if (typeof onOk === "function") onOk(); };
  overlay.classList.add("show"); overlay.setAttribute("aria-hidden", "false");
}
