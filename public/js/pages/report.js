import { getSalesReport } from "../api.js";

import {
  dialogsHtml,
  showMessage,
} from "../components/dialogs.js";

import {
  hasPermission,
  today,
  escapeHtml,
} from "../state.js";


// ======================================================
// SALES REPORT
// ======================================================

export function showReport(app, showHome) {
  const canChangeDates = hasPermission("report.date.change");
  const date = today();

  app.innerHTML = `
    <main class="sale-page document-page journalPage">

      <button
        id="reportBackButton"
        class="back-button"
        type="button"
      >
        ← Назад
      </button>

      <div class="saleHeader">
        <h2 class="saleTitle">Отчёт продаж</h2>
      </div>


      <!-- PERIOD -->

      <div class="journalFilter">

        <input
          id="reportFrom"
          type="date"
          class="saleDate"
          value="${date}"
          ${canChangeDates ? "" : "disabled"}
        >

        <input
          id="reportTo"
          type="date"
          class="saleDate"
          value="${date}"
          ${canChangeDates ? "" : "disabled"}
        >

      </div>


      <!-- SHOW BUTTON -->

      <button
        id="reportShowButton"
        class="saleButton documentShowButton"
        type="button"
      >
        Показать
      </button>


      <!-- REPORT TABLE -->

      <table class="saleTable">

        <thead>
          <tr>
            <th>ДОК</th>
            <th>ТОВАР</th>
            <th>ПРОД</th>
          </tr>
        </thead>

        <tbody id="reportRows"></tbody>

      </table>


      <!-- TOTALS -->

      <div class="reportTotals">

        <div class="reportSalesTotal">
          Сумма:
          <span id="reportSalesTotal">0.00</span>
        </div>

        <div
          id="reportBuyTotal"
          class="reportBuyTotal"
        >
          0
        </div>

      </div>


      <!-- LOADING -->

      <div
        id="reportLoading"
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
    document.getElementById("reportFrom");

  const to =
    document.getElementById("reportTo");

  const button =
    document.getElementById("reportShowButton");

  const back =
    document.getElementById("reportBackButton");

  const rows =
    document.getElementById("reportRows");

  const loading =
    document.getElementById("reportLoading");

  const salesTotal =
    document.getElementById("reportSalesTotal");

  const buyTotal =
    document.getElementById("reportBuyTotal");


  // ====================================================
  // STATE
  // ====================================================

  let busy = false;


  // ====================================================
  // LOADING STATE
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
  // DRAW REPORT
  // ====================================================

  function drawReport(data) {

    // --------------------------------------------------
    // TABLE
    // --------------------------------------------------

    rows.innerHTML = data
      .map(
        (item) => `
          <tr>

            <td>
              ${escapeHtml(item.doc)}
            </td>

            <td>
              ${escapeHtml(item.name)}
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


    // --------------------------------------------------
    // SALES TOTAL
    // --------------------------------------------------

    const totalSell = data.reduce(
      (total, item) =>
        total +
        Number(item.sell_price || 0),
      0
    );

    salesTotal.textContent =
      totalSell.toFixed(2);


    // --------------------------------------------------
    // BUY TOTAL
    // --------------------------------------------------

    const totalBuy = data.reduce(
      (total, item) =>
        total +
        Number(item.buy_price || 0),
      0
    );

    // Скрытое отображение:
    //
    // 222.56 → 22256
    // 125.05 → 12505

    buyTotal.textContent =
      String(
        Math.round(totalBuy * 100)
      );
  }


  // ====================================================
  // LOAD REPORT
  // ====================================================

  async function loadReport() {

    if (busy) {
      return;
    }

    if (
      !from.value ||
      !to.value ||
      from.value > to.value
    ) {
      showMessage(
        "Отчёт продаж",
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
        await getSalesReport(
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

      drawReport(data);

    }


    // --------------------------------------------------
    // END LOADING
    // --------------------------------------------------

    setBusy(false);


    // --------------------------------------------------
    // ERROR
    // --------------------------------------------------

    if (!result.success) {

      showMessage(
        "Ошибка отчёта",
        result.error?.message ||
          "Не удалось загрузить отчёт продаж"
      );

    }
  }


  // ====================================================
  // EVENTS
  // ====================================================

  button.addEventListener(
    "click",
    loadReport
  );

  back.addEventListener(
    "click",
    showHome
  );


  // ====================================================
  // FIRST LOAD
  // ====================================================

  loadReport();
}