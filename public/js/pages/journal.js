import { getSalesJournal } from "../api.js";

import {
  dialogsHtml,
  showMessage,
} from "../components/dialogs.js";

import {
  hasPermission,
  today,
  escapeHtml,
  formatDate,
} from "../state.js";


// ======================================================
// SALES JOURNAL
// ======================================================

export function showJournal(
  app,
  showHome,
  showSaleDocument
) {
  // ----------------------------------------------------
  // PERMISSIONS
  // ----------------------------------------------------

  const canChangeDates =
    hasPermission("journal.date.change");

  const canOpenDocument =
    hasPermission("journal.document.open");

  const date = today();


  // ====================================================
  // PAGE
  // ====================================================

  app.innerHTML = `
    <main class="sale-page document-page journalPage">

      <button
        id="journalBackButton"
        class="back-button"
        type="button"
      >
        ← Назад
      </button>


      <!-- HEADER -->

      <div class="saleHeader">
        <h2 class="saleTitle">
          Журнал продаж
        </h2>
      </div>


      <!-- PERIOD -->

      <div class="journalFilter">

        <input
          id="journalFrom"
          type="date"
          class="saleDate"
          value="${date}"
          ${canChangeDates ? "" : "disabled"}
        >

        <input
          id="journalTo"
          type="date"
          class="saleDate"
          value="${date}"
          ${canChangeDates ? "" : "disabled"}
        >

      </div>


      <!-- SHOW BUTTON -->

      <button
        id="journalShowButton"
        class="saleButton documentShowButton"
        type="button"
      >
        Показать
      </button>


      <!-- JOURNAL TABLE -->

      <table class="saleTable">

        <thead>
          <tr>
            <th>Дата</th>
            <th>Документ</th>
            <th>Сумма</th>
          </tr>
        </thead>

        <tbody id="journalRows"></tbody>

      </table>


      <!-- LOADING -->

      <div
        id="journalLoading"
        class="loadingOverlay"
        aria-hidden="true"
      >
        <div class="loadingSpinner"></div>
      </div>


      ${dialogsHtml()}

    </main>
  `;


  // ====================================================
  // ELEMENTS
  // ====================================================

  const from =
    document.getElementById("journalFrom");

  const to =
    document.getElementById("journalTo");

  const button =
    document.getElementById("journalShowButton");

  const back =
    document.getElementById("journalBackButton");

  const rows =
    document.getElementById("journalRows");

  const loading =
    document.getElementById("journalLoading");


  // ====================================================
  // STATE
  // ====================================================

  let busy = false;


  // ====================================================
  // BUSY STATE
  // ====================================================

  function setBusy(value) {
    busy = value;

    loading.classList.toggle(
      "show",
      value
    );

    loading.setAttribute(
      "aria-hidden",
      value ? "false" : "true"
    );

    button.disabled = value;
    back.disabled = value;

    from.disabled =
      value || !canChangeDates;

    to.disabled =
      value || !canChangeDates;
  }


  // ====================================================
  // DRAW JOURNAL
  // ====================================================

  function drawJournal(data) {
    rows.innerHTML = data
      .map(
        (sale) => `
          <tr
            data-sale-id="${escapeHtml(sale.id)}"
            class="${
              canOpenDocument
                ? "journalRow journalRowOpen"
                : "journalRow"
            }"
          >

            <td>
              ${escapeHtml(
                formatDate(sale.sale_date)
              )}
            </td>

            <td>
              ${escapeHtml(sale.id)}
            </td>

            <td>
              ${Number(
                sale.sum || 0
              ).toFixed(2)}
            </td>

          </tr>
        `
      )
      .join("");
  }


  // ====================================================
  // LOAD JOURNAL
  // ====================================================

  async function loadJournal() {
    if (busy) {
      return;
    }


    // --------------------------------------------------
    // VALIDATE PERIOD
    // --------------------------------------------------

    if (
      !from.value ||
      !to.value ||
      from.value > to.value
    ) {
      showMessage(
        "Журнал продаж",
        "Некорректный период"
      );

      return;
    }


    // --------------------------------------------------
    // START LOADING
    // --------------------------------------------------

    setBusy(true);

    let result;

    try {
      result =
        await getSalesJournal(
          from.value,
          to.value
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
    // SUCCESS
    // --------------------------------------------------

    if (result.success) {
      const data =
        Array.isArray(result.data)
          ? result.data
          : [];

      drawJournal(data);
    }


    // --------------------------------------------------
    // FINISH LOADING
    // --------------------------------------------------

    setBusy(false);


    // --------------------------------------------------
    // ERROR
    // --------------------------------------------------

    if (!result.success) {
      showMessage(
        "Ошибка журнала",
        result.error?.message ||
          "Не удалось загрузить журнал продаж"
      );
    }
  }


  // ====================================================
  // OPEN SALE DOCUMENT
  // ====================================================

  rows.addEventListener(
    "click",
    (event) => {

      // ------------------------------------------------
      // Проверяем permission
      // ------------------------------------------------

      if (
        busy ||
        !canOpenDocument
      ) {
        return;
      }


      // ------------------------------------------------
      // Находим строку документа
      // ------------------------------------------------

      const row =
        event.target.closest(
          "tr[data-sale-id]"
        );

      if (!row) {
        return;
      }


      // ------------------------------------------------
      // Получаем ID документа
      // ------------------------------------------------

      const saleId =
        Number(row.dataset.saleId);

      if (
        !Number.isInteger(saleId) ||
        saleId <= 0
      ) {
        return;
      }


      // ------------------------------------------------
      // Открываем документ
      // ------------------------------------------------

      if (
        typeof showSaleDocument ===
        "function"
      ) {        
        showSaleDocument(saleId);
      }
    }
  );


  // ====================================================
  // EVENTS
  // ====================================================

  button.addEventListener(
    "click",
    loadJournal
  );


  back.addEventListener(
    "click",
    showHome
  );


  // ====================================================
  // FIRST LOAD
  // ====================================================

  loadJournal();
}