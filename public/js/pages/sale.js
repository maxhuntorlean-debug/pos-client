import {
  getProductByBarcode,
  createSale,
} from "../api.js";

import {
  keyboardHtml,
  initKeyboard,
  showKeyboard,
  hideKeyboard,
} from "../components/keyboard.js";

import {
  dialogsHtml,
  showChoice,
  showConfirm,
  showMessage,
} from "../components/dialogs.js";

import {
  hasPermission,
  today,
  escapeHtml,
} from "../state.js";


// ======================================================
// SALE PAGE
// ======================================================

export function showSale(app, showHome) {
  const canChangeDate = hasPermission("sale.date.change");

  app.innerHTML = `
    <main class="sale-page">

      <button
        id="saleBackButton"
        class="back-button"
        type="button"
      >
        ← Назад
      </button>

      <div class="saleHeader">

        <h2 class="saleTitle">
          Реализация
        </h2>

        <input
          type="date"
          id="docDate"
          class="saleDate"
          value="${today()}"
          ${canChangeDate ? "" : "disabled"}
        >

      </div>

      <div class="saleBarcodeRow">

        <input
          id="saleBarcode"
          class="saleBarcode"
          type="text"
          inputmode="none"
          maxlength="5"
          placeholder="Штрихкод"
          readonly
        >

        <button
          class="productMicButton"
          type="button"
          disabled
        >
          🎤
        </button>

      </div>

      <table class="saleTable">

        <thead>
          <tr>
            <th>Код</th>
            <th>Наименование</th>
            <th>Цена</th>
          </tr>
        </thead>

        <tbody id="saleItems"></tbody>

      </table>

      <div class="saleTotals">

        <div>
          Количество:
          <span id="saleCount">0</span>
          шт.
        </div>

        <div>
          Сумма:
          <span id="saleSum">0.00</span>
        </div>

      </div>

      <button
        id="saleButton"
        class="saleButton"
        type="button"
        disabled
      >
        Продажа
      </button>


      <!-- PRICE EDITOR -->

      <div
        id="pricePanel"
        class="pricePanel"
      >

        <div class="pricePanelTitle">
          Изменить цену
        </div>

        <input
          id="newPrice"
          class="saleBarcode priceInput"
          type="text"
          inputmode="none"
          readonly
        >

      </div>

      ${dialogsHtml()}
      ${keyboardHtml()}

    </main>
  `;


  // ====================================================
  // INIT
  // ====================================================

  initKeyboard();

  const barcode =
    document.getElementById("saleBarcode");

  const itemsBody =
    document.getElementById("saleItems");

  const count =
    document.getElementById("saleCount");

  const sum =
    document.getElementById("saleSum");

  const backButton =
    document.getElementById("saleBackButton");

  const docDate =
    document.getElementById("docDate");

  const saleButton =
    document.getElementById("saleButton");


  // ====================================================
  // STATE
  // ====================================================

  const saleItems = [];

  let lookupSequence = 0;
  let barcodeError = false;
  let selectedIndex = -1;
  let saleSaving = false;


  // ====================================================
  // TOTALS
  // ====================================================

  function updateTotals() {
    count.textContent =
      String(saleItems.length);

    sum.textContent = saleItems
      .reduce(
        (total, item) =>
          total + Number(item.sell_price || 0),
        0
      )
      .toFixed(2);

    saleButton.disabled =
      saleItems.length === 0 ||
      saleSaving;
  }


  // ====================================================
  // DRAW SALE TABLE
  // ====================================================

  function drawSaleTable() {
    itemsBody.innerHTML = saleItems
      .map(
        (product, index) => `
          <tr
            data-index="${index}"
            class="${selectedIndex === index ? "selected" : ""}"
          >
            <td>
              ${escapeHtml(product.barcode)}
            </td>

            <td>
              ${escapeHtml(product.name)}
            </td>

            <td>
              ${Number(product.sell_price || 0).toFixed(2)}
            </td>
          </tr>
        `
      )
      .join("");

    updateTotals();
  }


  // ====================================================
  // PRODUCT SELECTION
  // ====================================================

  function cancelSelection() {
    selectedIndex = -1;
    drawSaleTable();
  }


  function deleteSelected() {
    if (selectedIndex < 0) {
      return;
    }

    saleItems.splice(selectedIndex, 1);

    cancelSelection();
  }


  // ====================================================
  // LOCK SALE
  // ====================================================

  function setSaleLocked(locked) {
    saleButton.disabled =
      locked ||
      saleItems.length === 0 ||
      saleSaving;

    backButton.disabled = locked;
    barcode.disabled = locked;

    docDate.disabled =
      locked ||
      !canChangeDate;
  }


  // ====================================================
  // PRICE EDITOR
  // ====================================================

  function closePricePanel() {
    document
      .getElementById("pricePanel")
      ?.classList.remove(
        "show",
        "keyboardOpen"
      );

    selectedIndex = -1;

    drawSaleTable();
    setSaleLocked(false);
  }


  function savePrice() {
    if (selectedIndex < 0) {
      return;
    }

    const input =
      document.getElementById("newPrice");

    const price =
      Number(input.value);

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return;
    }

    saleItems[selectedIndex].sell_price =
      price;

    drawSaleTable();
  }


  function changePrice() {
    if (selectedIndex < 0) {
      return;
    }

    const input =
      document.getElementById("newPrice");

    const panel =
      document.getElementById("pricePanel");

    // Текущая цена
    input.value =
      saleItems[selectedIndex].sell_price;

    // Показываем редактор
    panel.classList.add(
      "show",
      "keyboardOpen"
    );

    setSaleLocked(true);

    // -----------------------------------------------
    // Выделяем текущую цену полностью
    // -----------------------------------------------

    input.focus();
    input.select();

    // -----------------------------------------------
    // Открываем экранную клавиатуру
    // -----------------------------------------------

    showKeyboard(input, {
      onEnter: savePrice,
      onClose: closePricePanel,
    });
  }


  // ====================================================
  // SALE ITEM CLICK
  // ====================================================

  itemsBody.addEventListener(
    "click",
    (event) => {

      if (
        !hasPermission("sale.item.select") ||
        saleSaving ||
        document
          .getElementById("keyboard")
          ?.classList.contains("show")
      ) {
        return;
      }

      const row =
        event.target.closest(
          "tr[data-index]"
        );

      if (!row) {
        return;
      }

      selectedIndex =
        Number(row.dataset.index);

      drawSaleTable();

      setTimeout(() => {
        showChoice(
          "Выберите действие",
          [
            [
              "Изменить цену",
              changePrice,
            ],

            [
              "Удалить товар",
              () =>
                showConfirm(
                  "Удалить товар?",
                  "Выбранный товар будет удалён",
                  deleteSelected,
                  cancelSelection
                ),
            ],

            [
              "Отмена",
              cancelSelection,
            ],
          ]
        );
      }, 200);
    }
  );


  // ====================================================
  // BARCODE ERROR
  // ====================================================

  function resetBarcodeError() {
    if (!barcodeError) {
      return;
    }

    barcodeError = false;
    barcode.value = "";

    barcode.classList.remove(
      "saleBarcodeNotFound"
    );
  }


  // ====================================================
  // PRODUCT LOOKUP
  // ====================================================

  async function lookupBarcode() {
    const code =
      barcode.value.trim();

    if (code.length !== 5) {
      return;
    }

    hideKeyboard();

    const sequence =
      ++lookupSequence;

    const result =
      await getProductByBarcode(code);

    // Игнорируем устаревший запрос
    if (sequence !== lookupSequence) {
      return;
    }

    if (!result.success) {
      barcodeError = true;

      barcode.value =
        "Код не найден";

      barcode.classList.add(
        "saleBarcodeNotFound"
      );

      return;
    }

    saleItems.push(result.data);

    drawSaleTable();

    barcode.value = "";

    barcode.classList.remove(
      "saleBarcodeNotFound"
    );
  }


  // ====================================================
  // BARCODE EVENTS
  // ====================================================

  barcode.addEventListener(
    "input",
    () => {

      if (barcodeError) {
        return;
      }

      if (barcode.value.length > 5) {
        barcode.value =
          barcode.value.slice(0, 5);
      }

      if (barcode.value.length === 5) {
        lookupBarcode();
      }
    }
  );


  barcode.addEventListener(
    "click",
    () => {

      if (saleSaving) {
        return;
      }

      resetBarcodeError();

      showKeyboard(barcode);
    }
  );


  // ====================================================
  // SAVE SALE
  // ====================================================

  async function saveSale() {
    if (
      saleSaving ||
      saleItems.length === 0
    ) {
      return;
    }

    const now = new Date();

    const saleDoc = {
      sale_date: docDate.value,

      sale_time:
        now.toLocaleTimeString(
          "ru-RU",
          {
            hour12: false,
          }
        ),

      items: saleItems.map(
        (item) => ({
          barcode:
            Number(item.barcode),

          name:
            item.name,

          buy_price:
            Number(
              item.buy_price || 0
            ),

          sell_price:
            Number(
              item.sell_price || 0
            ),
        })
      ),
    };


    // --------------------------------------------------
    // LOCK UI
    // --------------------------------------------------

    saleSaving = true;

    setSaleLocked(true);


    // --------------------------------------------------
    // SEND SALE
    // --------------------------------------------------

    let result;

    try {
      result =
        await createSale(saleDoc);
    } catch {
      result = {
        success: false,
        error: {
          message:
            "Нет связи с сервером",
        },
      };
    }


    // --------------------------------------------------
    // ERROR
    // --------------------------------------------------

    if (!result.success) {
      saleSaving = false;

      setSaleLocked(false);

      showMessage(
        "Ошибка продажи",
        result.error?.message ||
          "Ошибка сохранения продажи"
      );

      return;
    }


    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------

    const saleId =
      result.data?.id;

    saleItems.length = 0;

    selectedIndex = -1;

    barcode.value = "";
    barcodeError = false;

    barcode.classList.remove(
      "saleBarcodeNotFound"
    );

    docDate.value =
      today();

    saleSaving = false;

    drawSaleTable();
    setSaleLocked(false);

    showMessage(
      "Продажа выполнена",
      saleId
        ? `Документ № ${saleId}`
        : "Продажа сохранена",
      showHome
    );
  }


  // ====================================================
  // EVENTS
  // ====================================================

  saleButton.addEventListener(
    "click",
    saveSale
  );


  backButton.addEventListener(
    "click",
    () => {
      hideKeyboard();
      showHome();
    }
  );


  // ====================================================
  // FIRST DRAW
  // ====================================================

  drawSaleTable();
}