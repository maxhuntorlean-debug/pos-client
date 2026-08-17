import {
  getSale,
  getProductByBarcode,
  updateSale,
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
  escapeHtml,
  formatDate,
} from "../state.js";


// ======================================================
// SALE DOCUMENT
// ======================================================

export function showSaleDocument(
  app,
  saleId,
  showJournal
) {

  // ====================================================
  // PERMISSION
  // ====================================================

  const canEdit =
    hasPermission("sale.edit");


  // ====================================================
  // PAGE
  // ====================================================

  app.innerHTML = `
    <main class="sale-page document-page">

      <button
        id="documentBackButton"
        class="back-button"
        type="button"
      >
        ← Назад
      </button>


      <!-- HEADER -->

      <div class="saleHeader">

        <h2
          id="documentTitle"
          class="saleTitle"
        >
          Документ
        </h2>

        <input
          id="documentDate"
          type="text"
          class="saleDate"
          value=""
          readonly
          disabled
        >

      </div>


      <!-- BARCODE -->

      <div class="saleBarcodeRow">

        <input
          id="documentBarcode"
          class="saleBarcode"
          type="text"
          inputmode="none"
          maxlength="5"
          placeholder="Штрихкод"
          readonly
          ${canEdit ? "" : "disabled"}
        >

        <button
          id="documentMicButton"
          class="productMicButton"
          type="button"
          disabled
        >
          🎤
        </button>

      </div>


      <!-- ITEMS -->

      <table class="saleTable">

        <thead>
          <tr>
            <th>Код</th>
            <th>Наименование</th>
            <th>Цена</th>
          </tr>
        </thead>

        <tbody id="documentItems"></tbody>

      </table>


      <!-- TOTALS -->

      <div class="saleTotals">

        <div>
          Количество:
          <span id="documentCount">
            0
          </span>
          шт.
        </div>

        <div>
          Сумма:
          <span id="documentSum">
            0.00
          </span>
        </div>

      </div>


      ${
        canEdit
          ? `
            <button
              id="documentSaveButton"
              class="saleButton"
              type="button"
              disabled
            >
              Перезаписать
            </button>
          `
          : ""
      }


      <!-- PRICE EDITOR -->

      ${
        canEdit
          ? `
            <div
              id="documentPricePanel"
              class="pricePanel"
            >

              <div class="pricePanelTitle">
                Изменить цену
              </div>

              <input
                id="documentNewPrice"
                class="saleBarcode priceInput"
                type="text"
                inputmode="none"
                readonly
              >

            </div>
          `
          : ""
      }


      <!-- LOADING -->

      <div
        id="documentLoading"
        class="loadingOverlay show"
        aria-hidden="false"
      >
        <div class="loadingSpinner"></div>
      </div>


      ${dialogsHtml()}

      ${canEdit ? keyboardHtml() : ""}

    </main>
  `;


  // ====================================================
  // KEYBOARD
  // ====================================================

  if (canEdit) {
    initKeyboard();
  }


  // ====================================================
  // ELEMENTS
  // ====================================================

  const backButton =
    document.getElementById(
      "documentBackButton"
    );

  const title =
    document.getElementById(
      "documentTitle"
    );

  const date =
    document.getElementById(
      "documentDate"
    );

  const barcode =
    document.getElementById(
      "documentBarcode"
    );

  const itemsBody =
    document.getElementById(
      "documentItems"
    );

  const count =
    document.getElementById(
      "documentCount"
    );

  const sum =
    document.getElementById(
      "documentSum"
    );

  const loading =
    document.getElementById(
      "documentLoading"
    );

  const saveButton =
    document.getElementById(
      "documentSaveButton"
    );


  // ====================================================
  // STATE
  // ====================================================

  const saleItems = [];

  let selectedIndex = -1;

  let lookupSequence = 0;

  let barcodeError = false;

  let loadingDocument = false;

  let saving = false;

  let changed = false;


  // ====================================================
  // TOTALS
  // ====================================================

  function updateTotals() {

    count.textContent =
      String(saleItems.length);

    const total =
      saleItems.reduce(
        (value, item) =>
          value +
          Number(
            item.sell_price || 0
          ),
        0
      );

    sum.textContent =
      total.toFixed(2);


    if (saveButton) {
      saveButton.disabled =
        saving ||
        loadingDocument ||
        !changed ||
        saleItems.length === 0;
    }
  }


  // ====================================================
  // DRAW TABLE
  // ====================================================

  function drawTable() {

    itemsBody.innerHTML =
      saleItems
        .map(
          (item, index) => `
            <tr
              data-index="${index}"
              class="${
                selectedIndex === index
                  ? "selected"
                  : ""
              }"
            >

              <td>
                ${escapeHtml(
                  item.barcode
                )}
              </td>

              <td>
                ${escapeHtml(
                  item.name
                )}
              </td>

              <td>
                ${Number(
                  item.sell_price || 0
                ).toFixed(2)}
              </td>

            </tr>
          `
        )
        .join("");

    updateTotals();
  }


  // ====================================================
  // LOADING
  // ====================================================

  function setLoading(value) {

    loadingDocument = value;

    loading.classList.toggle(
      "show",
      value
    );

    loading.setAttribute(
      "aria-hidden",
      value
        ? "false"
        : "true"
    );

    backButton.disabled =
      value || saving;

    if (canEdit) {
      barcode.disabled =
        value || saving;
    }

    updateTotals();
  }


  // ====================================================
  // EDIT LOCK
  // ====================================================

  function setEditLocked(locked) {

    if (!canEdit) {
      return;
    }

    barcode.disabled =
      locked;

    backButton.disabled =
      locked;

    if (saveButton) {
      saveButton.disabled =
        locked ||
        !changed ||
        saleItems.length === 0;
    }
  }


  // ====================================================
  // MARK CHANGED
  // ====================================================

  function markChanged() {

    changed = true;

    updateTotals();
  }


  // ====================================================
  // LOAD DOCUMENT
  // ====================================================

  async function loadDocument() {

    const id =
      Number(saleId);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      setLoading(false);

      showMessage(
        "Документ",
        "Некорректный номер документа",
        showJournal
      );

      return;
    }


    setLoading(true);

    let result;

    try {

      result =
        await getSale(id);

    } catch {

      result = {
        success: false,
        error: {
          message:
            "Нет связи с сервером",
        },
      };

    }


    setLoading(false);


    if (!result.success) {

      showMessage(
        "Ошибка документа",
        result.error?.message ||
          "Не удалось загрузить документ",
        showJournal
      );

      return;
    }


    const sale =
      result.data;


    // --------------------------------------------------
    // HEADER
    // --------------------------------------------------

    title.textContent =
      `Документ №${sale.id}`;

    date.value =
      formatDate(
        sale.sale_date
      );


    // --------------------------------------------------
    // ITEMS
    // --------------------------------------------------

    saleItems.length = 0;

    const items =
      Array.isArray(sale.items)
        ? sale.items
        : [];

    for (const item of items) {

      saleItems.push({
        barcode:
          item.barcode,

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
      });

    }


    selectedIndex = -1;

    changed = false;

    drawTable();
  }


  // ====================================================
  // READ ONLY MODE
  // ====================================================

  if (!canEdit) {

    backButton.addEventListener(
      "click",
      showJournal
    );

    loadDocument();

    return;
  }


  // ====================================================
  // CANCEL SELECTION
  // ====================================================

  function cancelSelection() {

    selectedIndex = -1;

    drawTable();
  }


  // ====================================================
  // DELETE ITEM
  // ====================================================

  function deleteSelected() {

    if (selectedIndex < 0) {
      return;
    }

    saleItems.splice(
      selectedIndex,
      1
    );

    selectedIndex = -1;

    markChanged();

    drawTable();
  }


  // ====================================================
  // PRICE PANEL
  // ====================================================

  function closePricePanel() {

    document
      .getElementById(
        "documentPricePanel"
      )
      ?.classList.remove(
        "show",
        "keyboardOpen"
      );

    selectedIndex = -1;

    drawTable();

    setEditLocked(false);
  }


  // ====================================================
  // SAVE NEW PRICE
  // ====================================================

  function savePrice() {

    if (selectedIndex < 0) {
      return;
    }

    const input =
      document.getElementById(
        "documentNewPrice"
      );

    const price =
      Number(input.value);

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return;
    }


    saleItems[
      selectedIndex
    ].sell_price = price;

    markChanged();

    drawTable();
  }


  // ====================================================
  // CHANGE PRICE
  // ====================================================

  function changePrice() {

    if (selectedIndex < 0) {
      return;
    }

    const input =
      document.getElementById(
        "documentNewPrice"
      );

    const panel =
      document.getElementById(
        "documentPricePanel"
      );


    input.value =
      Number(
        saleItems[
          selectedIndex
        ].sell_price || 0
      ).toFixed(2);


    panel.classList.add(
      "show",
      "keyboardOpen"
    );

    setEditLocked(true);


    // Выделяем всю цену

    input.focus();

    input.select();


    showKeyboard(
      input,
      {
        onEnter:
          savePrice,

        onClose:
          closePricePanel,
      }
    );
  }


  // ====================================================
  // ITEM CLICK
  // ====================================================

  itemsBody.addEventListener(
    "click",
    (event) => {

      if (
        saving ||
        loadingDocument ||
        document
          .getElementById(
            "keyboard"
          )
          ?.classList.contains(
            "show"
          )
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
        Number(
          row.dataset.index
        );

      drawTable();


      setTimeout(
        () =>
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
          ),
        200
      );
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
  // LOOKUP BARCODE
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


    let result;

    try {

      result =
        await getProductByBarcode(
          code
        );

    } catch {

      result = {
        success: false,
        error: {
          message:
            "Нет связи с сервером",
        },
      };

    }


    if (
      sequence !==
      lookupSequence
    ) {
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


    // --------------------------------------------------
    // ADD PRODUCT
    // --------------------------------------------------

    saleItems.push({
      barcode:
        result.data.barcode,

      name:
        result.data.name,

      buy_price:
        Number(
          result.data.buy_price || 0
        ),

      sell_price:
        Number(
          result.data.sell_price || 0
        ),
    });


    barcode.value = "";

    barcode.classList.remove(
      "saleBarcodeNotFound"
    );

    markChanged();

    drawTable();
  }


  // ====================================================
  // BARCODE INPUT
  // ====================================================

  barcode.addEventListener(
    "input",
    () => {

      if (barcodeError) {
        return;
      }


      if (
        barcode.value.length > 5
      ) {
        barcode.value =
          barcode.value.slice(
            0,
            5
          );
      }


      if (
        barcode.value.length === 5
      ) {
        lookupBarcode();
      }
    }
  );


  // ====================================================
  // BARCODE CLICK
  // ====================================================

  barcode.addEventListener(
    "click",
    () => {

      if (
        saving ||
        loadingDocument
      ) {
        return;
      }

      resetBarcodeError();

      showKeyboard(
        barcode
      );
    }
  );


  // ====================================================
  // SAVE DOCUMENT
  // ====================================================

  async function saveDocument() {

    if (
      saving ||
      loadingDocument ||
      !changed ||
      saleItems.length === 0
    ) {
      return;
    }


    const id =
      Number(saleId);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return;
    }


    // --------------------------------------------------
    // DATA
    // --------------------------------------------------

    const items =
      saleItems.map(
        (item) => ({
          barcode:
            Number(
              item.barcode
            ),

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
      );


    // --------------------------------------------------
    // LOCK
    // --------------------------------------------------

    saving = true;

    hideKeyboard();

    setEditLocked(true);


    // --------------------------------------------------
    // REQUEST
    // --------------------------------------------------

    let result;

    try {

      result =
        await updateSale(
          id,
          items
        );

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

      saving = false;

      setEditLocked(false);

      showMessage(
        "Ошибка документа",
        result.error?.message ||
          "Не удалось перезаписать документ"
      );

      return;
    }


    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------

    saving = false;

    changed = false;

    setEditLocked(false);

    updateTotals();


    showMessage(
      "Документ сохранён",
      `Документ №${id} перезаписан`
    );
  }


  // ====================================================
  // SAVE BUTTON
  // ====================================================

  saveButton.addEventListener(
    "click",
    saveDocument
  );


  // ====================================================
  // BACK
  // ====================================================

  backButton.addEventListener(
    "click",
    () => {

      hideKeyboard();

      showJournal();
    }
  );


  // ====================================================
  // LOAD
  // ====================================================

  loadDocument();
}