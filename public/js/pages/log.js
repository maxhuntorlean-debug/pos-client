import { getEvents } from "../api.js";

import {
  dialogsHtml,
  showMessage,
} from "../components/dialogs.js";

import {
  today,
  escapeHtml,
} from "../state.js";


// ======================================================
// EVENT LOG
// ======================================================

export function showLog(app, showHome) {
  const date = today();

  app.innerHTML = `
    <main class="sale-page document-page logPage">

      <!-- BACK -->

      <button
        id="logBackButton"
        class="back-button"
        type="button"
      >
        ← Назад
      </button>


      <!-- HEADER -->

      <div class="saleHeader">
        <h2 class="saleTitle">
          Журнал событий
        </h2>
      </div>


      <!-- PERIOD -->

      <div class="journalFilter">

        <input
          id="logFrom"
          type="date"
          class="saleDate"
          value="${date}"
        >

        <input
          id="logTo"
          type="date"
          class="saleDate"
          value="${date}"
        >

      </div>


      <!-- SHOW -->

      <button
        id="logShowButton"
        class="saleButton documentShowButton"
        type="button"
      >
        Показать
      </button>


      <!-- TABLE -->

      <table class="saleTable logTable">

        <thead>
          <tr>
            <th>Дата / время</th>
            <th>Событие</th>
          </tr>
        </thead>

        <tbody id="logRows"></tbody>

      </table>


      <!-- LOADING -->

      <div
        id="logLoading"
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
    document.getElementById("logFrom");

  const to =
    document.getElementById("logTo");

  const button =
    document.getElementById("logShowButton");

  const back =
    document.getElementById("logBackButton");

  const rows =
    document.getElementById("logRows");

  const loading =
    document.getElementById("logLoading");


  // ====================================================
  // STATE
  // ====================================================

  let busy = false;


  // ====================================================
  // EVENT NAMES
  // ====================================================

  const eventNames = {
    PRODUCT_CREATE: "Создан товар",
    SALE_CREATE: "Продажа",
    SALE_UPDATE: "Изменена продажа",
  };


  function formatEvent(type) {
    return eventNames[type] || type || "";
  }


  // ====================================================
  // DATE / TIME
  // D1 CURRENT_TIMESTAMP хранится в UTC
  // ====================================================

  function parseDate(value) {
    if (!value) {
      return null;
    }

    const source =
      String(value).trim();

    const parsed =
      new Date(
        source.replace(" ", "T") + "Z"
      );

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return null;
    }

    return parsed;
  }


  // ====================================================
  // DETAILS PARSER
  // ====================================================

  function parseDetails(value) {
    const result = {};

    String(value ?? "")
      .split(";")
      .forEach((part) => {

        const index =
          part.indexOf("=");

        if (index < 0) {
          return;
        }

        const key =
          part
            .slice(0, index)
            .trim();

        const val =
          part
            .slice(index + 1)
            .trim();

        result[key] = val;
      });

    return result;
  }


  // ====================================================
  // FORMAT DETAILS
  // ====================================================

  function formatDetails(event) {
    const details =
      parseDetails(
        event.details
      );


    // --------------------------------------------------
    // SALE CREATE / UPDATE
    // --------------------------------------------------

    if (
      event.event_type === "SALE_CREATE" ||
      event.event_type === "SALE_UPDATE"
    ) {
      const parts = [];


      // DOCUMENT

      if (details.sale_id) {
        parts.push(
          `Документ №${details.sale_id}`
        );
      }


      // SUM

      if (details.sum) {
        const sum =
          Number(details.sum);

        parts.push(
          Number.isFinite(sum)
            ? `сумма ${sum.toFixed(2)}`
            : `сумма ${details.sum}`
        );
      }


      // ITEMS

      if (details.items) {
        parts.push(
          `позиций ${details.items}`
        );
      }


      return parts.join(" · ");
    }


    // --------------------------------------------------
    // PRODUCT CREATE
    // --------------------------------------------------

    if (
      event.event_type === "PRODUCT_CREATE"
    ) {
      const parts = [];


      // BARCODE

      if (details.barcode) {
        parts.push(
          `Код ${details.barcode}`
        );
      }


      // NAME

      if (details.name) {
        parts.push(
          details.name
        );
      }


      // BUY PRICE

      if (details.buy_price) {
        const buyPrice =
          Number(details.buy_price);

        parts.push(
          Number.isFinite(buyPrice)
            ? `приход ${buyPrice.toFixed(2)}`
            : `приход ${details.buy_price}`
        );
      }


      // SELL PRICE

      if (details.sell_price) {
        const sellPrice =
          Number(details.sell_price);

        parts.push(
          Number.isFinite(sellPrice)
            ? `продажа ${sellPrice.toFixed(2)}`
            : `продажа ${details.sell_price}`
        );
      }


      return parts.join(" · ");
    }


    // --------------------------------------------------
    // UNKNOWN EVENT
    // --------------------------------------------------

    return String(
      event.details ?? ""
    );
  }


  // ====================================================
  // BUSY
  // ====================================================

  function setBusy(value) {
    busy = value;

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

    button.disabled = value;
    back.disabled = value;

    from.disabled = value;
    to.disabled = value;
  }


  // ====================================================
  // DRAW
  // ====================================================

  function drawEvents(data) {

    // --------------------------------------------------
    // EMPTY
    // --------------------------------------------------

    if (!data.length) {
      rows.innerHTML = `
        <tr>
          <td
            colspan="2"
            class="logEmpty"
          >
            Событий нет
          </td>
        </tr>
      `;

      return;
    }


    // --------------------------------------------------
    // ROWS
    // --------------------------------------------------

    rows.innerHTML =
      data.map((event) => {

        const parsed =
          parseDate(
            event.created_at
          );


        // ----------------------------------------------
        // DATE
        // ----------------------------------------------

        let eventDate = "";

        if (parsed) {
          eventDate =
            parsed.toLocaleDateString(
              "ru-RU",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }
            );
        }


        // ----------------------------------------------
        // TIME
        // ----------------------------------------------

        let eventTime = "";

        if (parsed) {
          eventTime =
            parsed.toLocaleTimeString(
              "ru-RU",
              {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }
            );
        }


        // ----------------------------------------------
        // EVENT
        // ----------------------------------------------

        const eventName =
          formatEvent(
            event.event_type
          );


        // ----------------------------------------------
        // DETAILS
        // ----------------------------------------------

        const details =
          formatDetails(event);


        // ----------------------------------------------
        // HTML
        // ----------------------------------------------

        return `
          <tr>

            <!-- DATE / TIME / USER -->

            <td class="logInfo">

              <div class="logDate">
                ${escapeHtml(eventDate)}
              </div>

              <div class="logTime">
                ${escapeHtml(eventTime)}
              </div>

              <div class="logUsername">
                ${escapeHtml(
                  event.username ?? ""
                )}
              </div>

            </td>


            <!-- EVENT / DETAILS -->

            <td class="logEvent">

              <div class="logEventName">
                ${escapeHtml(eventName)}
              </div>

              ${
                details
                  ? `
                    <div class="logEventDetails">
                      ${escapeHtml(details)}
                    </div>
                  `
                  : ""
              }

            </td>

          </tr>
        `;
      }).join("");
  }


  // ====================================================
  // LOAD LOG
  // ====================================================

  async function loadLog() {

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
        "Журнал событий",
        "Некорректный период"
      );

      return;
    }


    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------

    setBusy(true);


    // --------------------------------------------------
    // REQUEST
    // --------------------------------------------------

    let result;

    try {

      result =
        await getEvents(
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

      drawEvents(data);
    }


    // --------------------------------------------------
    // UNLOCK
    // --------------------------------------------------

    setBusy(false);


    // --------------------------------------------------
    // ERROR
    // --------------------------------------------------

    if (!result.success) {
      showMessage(
        "Ошибка журнала",
        result.error?.message ||
          "Не удалось загрузить журнал событий"
      );
    }
  }


  // ====================================================
  // SHOW BUTTON
  // ====================================================

  button.addEventListener(
    "click",
    loadLog
  );


  // ====================================================
  // BACK
  // ====================================================

  back.addEventListener(
    "click",
    showHome
  );


  // ====================================================
  // INITIAL LOAD
  // ====================================================

  loadLog();
}