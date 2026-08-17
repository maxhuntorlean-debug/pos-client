import { createProduct } from "../api.js";

import {
  keyboardHtml,
  initKeyboard,
  showKeyboard,
  hideKeyboard,
} from "../components/keyboard.js";

import {
  dialogsHtml,
  showMessage,
} from "../components/dialogs.js";


// ======================================================
// CREATE PRODUCT
// ======================================================

export function showIncome(app, showHome) {

  // ====================================================
  // PAGE
  // ====================================================

  app.innerHTML = `
    <main class="sale-page document-page incomePage">

      <!-- BACK -->

      <button
        id="incomeBackButton"
        class="back-button"
        type="button"
      >
        ← Назад
      </button>


      <!-- TITLE -->

      <div class="incomeHeader">
        <h2 class="saleTitle">
          Создание товара
        </h2>
      </div>


      <!-- NAME -->

      <div class="incomeNameBlock">

        <label
          class="incomeLabel"
          for="incomeName"
        >
          Наименование
        </label>

        <div class="incomeNameRow">

          <input
            id="incomeName"
            class="incomeNameInput"
            type="text"
            autocomplete="off"
            placeholder="Введите наименование"
          >

          <button
            id="incomeMicButton"
            class="incomeMicButton"
            type="button"
            disabled
          >
            🎤
          </button>

        </div>

      </div>


      <!-- PRICES -->

      <div class="incomePrices">

        <div class="incomePriceBlock">

          <label
            class="incomeLabel"
            for="incomeBuyPrice"
          >
            Закупочная цена
          </label>

          <input
            id="incomeBuyPrice"
            class="incomePriceInput"
            type="text"
            inputmode="none"
            value="0.00"
            readonly
          >

        </div>


        <div class="incomePriceBlock">

          <label
            class="incomeLabel"
            for="incomeSellPrice"
          >
            Цена продажи
          </label>

          <input
            id="incomeSellPrice"
            class="incomePriceInput"
            type="text"
            inputmode="none"
            value="0.00"
            readonly
          >

        </div>

      </div>


      <!-- CREATE -->

      <button
        id="incomeCreateButton"
        class="saleButton incomeCreateButton"
        type="button"
        disabled
      >
        Создать товар
      </button>


      <!-- LOADING -->

      <div
        id="incomeLoading"
        class="loadingOverlay"
        aria-hidden="true"
      >
        <div class="loadingSpinner"></div>
      </div>


      ${dialogsHtml()}
      ${keyboardHtml()}

    </main>
  `;


  // ====================================================
  // KEYBOARD
  // ====================================================

  initKeyboard();


  // ====================================================
  // ELEMENTS
  // ====================================================

  const backButton =
    document.getElementById("incomeBackButton");

  const nameInput =
    document.getElementById("incomeName");

  const buyInput =
    document.getElementById("incomeBuyPrice");

  const sellInput =
    document.getElementById("incomeSellPrice");

  const createButton =
    document.getElementById("incomeCreateButton");

  const loading =
    document.getElementById("incomeLoading");


  // ====================================================
  // STATE
  // ====================================================

  let saving = false;


  // ====================================================
  // PRICE
  // ====================================================

  function parsePrice(value) {
    const normalized = String(value ?? "")
      .trim()
      .replace(",", ".");

    const price = Number(normalized);

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return null;
    }

    return price;
  }


  // ====================================================
  // BUTTON STATE
  // ====================================================

  function updateCreateButton() {
    const name = nameInput.value.trim();

    const buyPrice =
      parsePrice(buyInput.value);

    const sellPrice =
      parsePrice(sellInput.value);

    createButton.disabled =
      saving ||
      !name ||
      buyPrice === null ||
      sellPrice === null;
  }


  // ====================================================
  // BUSY
  // ====================================================

  function setBusy(value) {
    saving = value;

    loading.classList.toggle(
      "show",
      value
    );

    loading.setAttribute(
      "aria-hidden",
      value ? "false" : "true"
    );

    backButton.disabled = value;
    nameInput.disabled = value;
    buyInput.disabled = value;
    sellInput.disabled = value;

    updateCreateButton();
  }


  // ====================================================
  // RESET
  // ====================================================

  function resetForm() {
    nameInput.value = "";
    buyInput.value = "0.00";
    sellInput.value = "0.00";

    updateCreateButton();
  }


  // ====================================================
  // PRICE KEYBOARD
  // ====================================================

  function openPriceKeyboard(input) {
    if (saving) {
      return;
    }

    input.focus();

    // Выделяем всю текущую цену.
    // Первая введённая цифра заменит 0.00.

    input.select();

    showKeyboard(input, {

      onEnter: () => {
        updateCreateButton();

        if (input === buyInput) {
          setTimeout(() => {
            openPriceKeyboard(sellInput);
          }, 100);
        } else {
          hideKeyboard();
        }
      },

      onClose: () => {
        updateCreateButton();
      },
    });
  }


  // ====================================================
  // PRICE EVENTS
  // ====================================================

  buyInput.addEventListener(
    "click",
    () => {
      openPriceKeyboard(buyInput);
    }
  );


  sellInput.addEventListener(
    "click",
    () => {
      openPriceKeyboard(sellInput);
    }
  );


  buyInput.addEventListener(
    "input",
    updateCreateButton
  );


  sellInput.addEventListener(
    "input",
    updateCreateButton
  );


  // ====================================================
  // NAME
  // ====================================================

  nameInput.addEventListener(
    "input",
    updateCreateButton
  );


  // ====================================================
  // CREATE PRODUCT
  // ====================================================

  async function saveProduct() {
    if (saving) {
      return;
    }

    const name =
      nameInput.value.trim();

    const buyPrice =
      parsePrice(buyInput.value);

    const sellPrice =
      parsePrice(sellInput.value);


    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (!name) {
      showMessage(
        "Создание товара",
        "Введите наименование товара"
      );

      return;
    }


    if (buyPrice === null) {
      showMessage(
        "Создание товара",
        "Введите закупочную цену"
      );

      return;
    }


    if (sellPrice === null) {
      showMessage(
        "Создание товара",
        "Введите цену продажи"
      );

      return;
    }


    // --------------------------------------------------
    // SAVE
    // --------------------------------------------------

    hideKeyboard();

    setBusy(true);

    let result;

    try {
      result = await createProduct({
        name,
        buy_price: buyPrice,
        sell_price: sellPrice,
      });
    } catch {
      result = {
        success: false,
        error: {
          message: "Нет связи с сервером",
        },
      };
    }

    setBusy(false);


    // --------------------------------------------------
    // ERROR
    // --------------------------------------------------

    if (!result.success) {
      showMessage(
        "Ошибка создания товара",
        result.error?.message ||
          "Не удалось создать товар"
      );

      return;
    }


    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------

    const barcode =
      result.data?.barcode;

    resetForm();

    showMessage(
      "Товар создан",
      barcode
        ? `Штрихкод: ${barcode}`
        : "Товар успешно создан"
    );
  }


  // ====================================================
  // CREATE
  // ====================================================

  createButton.addEventListener(
    "click",
    saveProduct
  );


  // ====================================================
  // BACK
  // ====================================================

  backButton.addEventListener(
    "click",
    () => {
      if (saving) {
        return;
      }

      hideKeyboard();
      showHome();
    }
  );


  // ====================================================
  // INITIAL
  // ====================================================

  updateCreateButton();
}