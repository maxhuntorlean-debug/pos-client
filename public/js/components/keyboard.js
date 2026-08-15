let activeInput = null;
let onEnter = null;
let onClose = null;

export function keyboardHtml() {
  return `
    <div id="keyboard" class="keyboard" aria-hidden="true">
      <button class="key" data-key="1">1</button><button class="key" data-key="2">2</button><button class="key" data-key="3">3</button><button class="key keyDelete" data-action="delete">⌫</button>
      <button class="key" data-key="4">4</button><button class="key" data-key="5">5</button><button class="key" data-key="6">6</button><button class="key keyClear" data-action="clear">C</button>
      <button class="key" data-key="7">7</button><button class="key" data-key="8">8</button><button class="key" data-key="9">9</button><button class="key keyOk" data-action="ok">✓</button>
      <button class="key" data-key=".">.</button><button class="key" data-key="0">0</button><button class="key" data-key="00">00</button><button class="key keyClose" data-action="close">✕</button>
    </div>`;
}
function emitInput(){activeInput?.dispatchEvent(new Event("input",{bubbles:true}))}
export function showKeyboard(input,options={}){activeInput=input;onEnter=options.onEnter||null;onClose=options.onClose||null;const keyboard=document.getElementById("keyboard");keyboard?.classList.add("show");keyboard?.setAttribute("aria-hidden","false")}
export function hideKeyboard(){const keyboard=document.getElementById("keyboard");keyboard?.classList.remove("show");keyboard?.setAttribute("aria-hidden","true");const closeAction=onClose;activeInput=null;onEnter=null;onClose=null;closeAction?.()}
export function initKeyboard(){const keyboard=document.getElementById("keyboard");if(!keyboard)return;keyboard.addEventListener("click",event=>{const button=event.target.closest("button");if(!button||!activeInput)return;if(button.dataset.key!==undefined){activeInput.value+=button.dataset.key;emitInput();return}switch(button.dataset.action){case"delete":activeInput.value=activeInput.value.slice(0,-1);emitInput();break;case"clear":activeInput.value="";emitInput();break;case"ok":{const enterAction=onEnter;enterAction?.();hideKeyboard();break}case"close":hideKeyboard();break}})}
