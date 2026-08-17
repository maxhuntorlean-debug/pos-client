let activeInput = null;
let onEnter = null;
let onClose = null;
let replaceOnNextInput = false;


// ======================================================
// KEYBOARD HTML
// ======================================================

export function keyboardHtml() {
  return `
    <div id="keyboard" class="keyboard" aria-hidden="true">

      <button class="key" data-key="1">1</button>
      <button class="key" data-key="2">2</button>
      <button class="key" data-key="3">3</button>
      <button class="key keyDelete" data-action="delete">⌫</button>

      <button class="key" data-key="4">4</button>
      <button class="key" data-key="5">5</button>
      <button class="key" data-key="6">6</button>
      <button class="key keyClear" data-action="clear">C</button>

      <button class="key" data-key="7">7</button>
      <button class="key" data-key="8">8</button>
      <button class="key" data-key="9">9</button>
      <button class="key keyOk" data-action="ok">✓</button>

      <button class="key" data-key=".">.</button>
      <button class="key" data-key="0">0</button>
      <button class="key" data-key="00">00</button>
      <button class="key keyClose" data-action="close">✕</button>

    </div>
  `;
}


// ======================================================
// INPUT EVENT
// ======================================================

function emitInput() {
  activeInput?.dispatchEvent(
    new Event("input", {
      bubbles: true,
    })
  );
}


// ======================================================
// ADD KEY
// ======================================================

function addKey(key) {
  if (!activeInput) {
    return;
  }

  // Если значение было выделено —
  // первая цифра полностью заменяет его.
  if (replaceOnNextInput) {
    activeInput.value = key;
    replaceOnNextInput = false;
  } else {
    // Все последующие цифры добавляем справа.
    activeInput.value += key;
  }

  emitInput();
}


// ======================================================
// DELETE LAST CHARACTER
// ======================================================

function deleteLast() {
  if (!activeInput) {
    return;
  }

  // После удаления режим замены больше не нужен.
  replaceOnNextInput = false;

  activeInput.value =
    activeInput.value.slice(0, -1);

  emitInput();
}


// ======================================================
// CLEAR
// ======================================================

function clearInput() {
  if (!activeInput) {
    return;
  }

  activeInput.value = "";
  replaceOnNextInput = false;

  emitInput();
}


// ======================================================
// SHOW KEYBOARD
// ======================================================

export function showKeyboard(input, options = {}) {
  activeInput = input;

  onEnter = options.onEnter || null;
  onClose = options.onClose || null;

  // Проверяем, выделено ли всё значение.
  replaceOnNextInput =
    input.value.length > 0 &&
    input.selectionStart === 0 &&
    input.selectionEnd === input.value.length;

  const keyboard =
    document.getElementById("keyboard");

  keyboard?.classList.add("show");

  keyboard?.setAttribute(
    "aria-hidden",
    "false"
  );
}


// ======================================================
// HIDE KEYBOARD
// ======================================================

export function hideKeyboard() {
  const keyboard =
    document.getElementById("keyboard");

  keyboard?.classList.remove("show");

  keyboard?.setAttribute(
    "aria-hidden",
    "true"
  );

  const closeAction = onClose;

  activeInput = null;
  onEnter = null;
  onClose = null;
  replaceOnNextInput = false;

  closeAction?.();
}


// ======================================================
// INIT KEYBOARD
// ======================================================

export function initKeyboard() {
  const keyboard =
    document.getElementById("keyboard");

  if (!keyboard) {
    return;
  }

  keyboard.addEventListener(
    "click",
    (event) => {
      const button =
        event.target.closest("button");

      if (!button || !activeInput) {
        return;
      }


      // =================================================
      // NUMBER / DOT
      // =================================================

      if (button.dataset.key !== undefined) {
        addKey(button.dataset.key);
        return;
      }


      // =================================================
      // ACTIONS
      // =================================================

      switch (button.dataset.action) {

        case "delete":
          deleteLast();
          break;


        case "clear":
          clearInput();
          break;


        case "ok": {
          const enterAction = onEnter;

          enterAction?.();

          hideKeyboard();

          break;
        }


        case "close":
          hideKeyboard();
          break;
      }
    }
  );
}