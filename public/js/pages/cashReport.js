import {
  getCashReport,
} from "../api.js";

import {
  dialogsHtml,
  showMessage,
} from "../components/dialogs.js";

import {
  escapeHtml,
  formatDate,
  today,
} from "../state.js";


// ======================================================
// ELITKA OPERATION LABELS
// ======================================================

const OPERATION_LABELS = {
  SALES: "Реализация",
  TERMINAL: "Терминал",
  WITHDRAWAL: "Съём",
  SUGAR: "Расход сахар и пр.",
  OTHER: "Расход прочие",
  SALARY: "Зарплата",
};


// ======================================================
// ELITKA OPERATION ORDER
// ======================================================

const OPERATION_ORDER = [
  "SALES",
  "TERMINAL",
  "WITHDRAWAL",
  "SUGAR",
  "OTHER",
  "SALARY",
];


// ======================================================
// MONTH PERIOD
// ======================================================

function getCurrentMonthPeriod() {

  // today() уже возвращает дату по Europe/Kyiv

  const current =
    today();

  const [
    year,
    month,
  ] =
    current.split("-");


  const firstDay =
    `${year}-${month}-01`;


  const lastDayNumber =
    new Date(
      Number(year),
      Number(month),
      0
    ).getDate();


  const lastDay =
    `${year}-${month}-${String(
      lastDayNumber
    ).padStart(2, "0")}`;


  return {
    from: firstDay,
    to: lastDay,
  };
}


// ======================================================
// MONEY
// ======================================================

function money(value) {

  const number =
    Number(value);


  if (!Number.isFinite(number)) {
    return "0.00";
  }


  return number.toLocaleString(
    "ru-RU",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
}


// ======================================================
// SIGNED MONEY
// ======================================================

function signedMoney(value) {

  const number =
    Number(value);


  if (!Number.isFinite(number)) {
    return "0.00";
  }


  if (number > 0) {

    return `+${money(number)}`;

  }


  if (number < 0) {

    return `−${money(
      Math.abs(number)
    )}`;

  }


  return money(0);
}


// ======================================================
// PAGE
// ======================================================

export function showCashReport(
  app,
  showHome
) {

  const period =
    getCurrentMonthPeriod();


  // ====================================================
  // PAGE
  // ====================================================

  app.innerHTML = `
    <main
      class="sale-page document-page cashReportPage"
    >

      <button
        id="cashReportBack"
        class="back-button"
        type="button"
      >
        ← Назад
      </button>


      <div class="saleHeader">

        <h2 class="saleTitle">
          Отчёт Элитка
        </h2>

      </div>


      <!-- =============================================
           PERIOD
           ============================================= -->

      <div class="cashReportPeriod">

        <label class="cashReportDateField">

          <span>
            С
          </span>

          <input
            id="cashReportFrom"
            class="saleDate"
            type="date"
            value="${period.from}"
          >

        </label>


        <label class="cashReportDateField">

          <span>
            По
          </span>

          <input
            id="cashReportTo"
            class="saleDate"
            type="date"
            value="${period.to}"
          >

        </label>

      </div>


      <button
        id="cashReportShow"
        class="saleButton documentShowButton"
        type="button"
      >
        Показать
      </button>


      <!-- =============================================
           REPORT
           ============================================= -->

      <div
        id="cashReportContent"
        class="cashReportContent"
      ></div>


      <!-- =============================================
           LOADING
           ============================================= -->

      <div
        id="cashReportLoading"
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

  const back =
    document.getElementById(
      "cashReportBack"
    );


  const from =
    document.getElementById(
      "cashReportFrom"
    );


  const to =
    document.getElementById(
      "cashReportTo"
    );


  const showButton =
    document.getElementById(
      "cashReportShow"
    );


  const content =
    document.getElementById(
      "cashReportContent"
    );


  const loading =
    document.getElementById(
      "cashReportLoading"
    );


  // ====================================================
  // STATE
  // ====================================================

  let busy =
    false;


  // ====================================================
  // BUSY
  // ====================================================

  function setBusy(value) {

    busy =
      value;


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


    showButton.disabled =
      value;


    from.disabled =
      value;


    to.disabled =
      value;


    back.disabled =
      value;
  }


  // ====================================================
  // NORMALIZE GROUPS
  // ====================================================

  function normalizeGroups(groups) {

    const source =
      Array.isArray(groups)
        ? groups
        : [];


    const map =
      new Map();


    for (const group of source) {

      map.set(
        String(
          group.operation_type ||
          ""
        ),
        group
      );

    }


    // Показываем все известные группы,
    // даже если за период сумма равна нулю.

    const result =
      OPERATION_ORDER.map(
        (operationType) => {

          const group =
            map.get(
              operationType
            );


          return {
            operation_type:
              operationType,

            total:
              Number(
                group?.total || 0
              ),

            operations:
              Array.isArray(
                group?.operations
              )
                ? group.operations
                : [],
          };

        }
      );


    // Если когда-нибудь сервер отдаст
    // новый неизвестный тип операции,
    // мы его тоже не потеряем.

    for (const group of source) {

      const operationType =
        String(
          group.operation_type ||
          ""
        );


      if (
        !OPERATION_ORDER.includes(
          operationType
        )
      ) {

        result.push({
          operation_type:
            operationType,

          total:
            Number(
              group.total || 0
            ),

          operations:
            Array.isArray(
              group.operations
            )
              ? group.operations
              : [],
        });

      }

    }


    return result;
  }


  // ====================================================
  // DRAW OPERATION
  // ====================================================

  function operationHtml(
    operation
  ) {

    const amount =
      Number(
        operation.amount || 0
      );


    const comment =
      String(
        operation.comment ||
        ""
      ).trim();


    return `
      <div class="cashReportOperation">

        <div class="cashReportOperationMain">

          <span class="cashReportOperationDate">
            ${escapeHtml(
              formatDate(
                operation.date
              )
            )}
          </span>


          <strong
            class="${
              amount < 0
                ? "cashNegative"
                : "cashPositive"
            }"
          >
            ${escapeHtml(
              signedMoney(
                amount
              )
            )}
          </strong>

        </div>


        ${
          comment

            ? `
              <div class="cashReportOperationComment">
                ${escapeHtml(
                  comment
                )}
              </div>
            `

            : ""
        }

      </div>
    `;
  }


  // ====================================================
  // DRAW GROUP
  // ====================================================

  function groupHtml(group) {

    const operationType =
      String(
        group.operation_type ||
        ""
      );


    const label =
      OPERATION_LABELS[
        operationType
      ] ||
      operationType ||
      "Операция";


    const total =
      Number(
        group.total || 0
      );


    const operations =
      Array.isArray(
        group.operations
      )
        ? group.operations
        : [];


    return `
      <div
        class="cashReportGroup"
        data-report-group="${escapeHtml(
          operationType
        )}"
      >

        <button
          class="cashReportGroupHeader"
          type="button"
        >

          <span class="cashReportGroupLeft">

            <span class="cashReportArrow">
              ▶
            </span>

            <span>
              ${escapeHtml(label)}
            </span>

          </span>


          <strong
            class="${
              total < 0
                ? "cashNegative"
                : total > 0
                  ? "cashPositive"
                  : ""
            }"
          >
            ${escapeHtml(
              signedMoney(
                total
              )
            )}
          </strong>

        </button>


        <div
          class="cashReportGroupDetails"
          hidden
        >

          ${
            operations.length

              ? operations
                  .map(
                    operationHtml
                  )
                  .join("")

              : `
                <div class="cashReportEmpty">
                  Нет операций
                </div>
              `
          }

        </div>

      </div>
    `;
  }


  // ====================================================
  // DRAW REPORT
  // ====================================================

  function drawReport(data) {

    const openingBalance =
      Number(
        data?.opening_balance || 0
      );


    const closingBalance =
      Number(
        data?.closing_balance || 0
      );


    const groups =
      normalizeGroups(
        data?.groups
      );


    content.innerHTML = `

      <!-- =============================================
           OPENING BALANCE
           ============================================= -->

      <div class="cashReportBalance cashReportOpening">

        <span>
          Остаток на начало
        </span>

        <strong>
          ${escapeHtml(
            money(
              openingBalance
            )
          )}
        </strong>

      </div>


      <!-- =============================================
           GROUPS
           ============================================= -->

      <div class="cashReportGroups">

        ${groups
          .map(
            groupHtml
          )
          .join("")}

      </div>


      <!-- =============================================
           CLOSING BALANCE
           ============================================= -->

      <div class="cashReportBalance cashReportClosing">

        <span>
          Остаток на конец
        </span>

        <strong>
          ${escapeHtml(
            money(
              closingBalance
            )
          )}
        </strong>

      </div>

    `;


    // ==================================================
    // ACCORDION
    // ==================================================

    content
      .querySelectorAll(
        ".cashReportGroup"
      )
      .forEach(
        (group) => {

          const header =
            group.querySelector(
              ".cashReportGroupHeader"
            );


          const details =
            group.querySelector(
              ".cashReportGroupDetails"
            );


          const arrow =
            group.querySelector(
              ".cashReportArrow"
            );


          header.addEventListener(
            "click",
            () => {

              const open =
                !details.hidden;


              details.hidden =
                open;


              arrow.textContent =
                open
                  ? "▶"
                  : "▼";

            }
          );

        }
      );
  }


  // ====================================================
  // LOAD REPORT
  // ====================================================

  async function loadReport() {

    if (busy) {
      return;
    }


    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (
      !from.value ||
      !to.value
    ) {

      showMessage(
        "Отчёт Элитка",
        "Выберите период"
      );

      return;
    }


    if (
      from.value >
      to.value
    ) {

      showMessage(
        "Отчёт Элитка",
        "Некорректный период"
      );

      return;
    }


    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------

    setBusy(true);


    let result;


    try {

      result =
        await getCashReport(
          "ELITKA",
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


    setBusy(false);


    // --------------------------------------------------
    // ERROR
    // --------------------------------------------------

    if (!result.success) {

      showMessage(
        "Ошибка отчёта",
        result.error?.message ||
          "Не удалось загрузить отчёт Элитки"
      );

      return;
    }


    // --------------------------------------------------
    // DRAW
    // --------------------------------------------------

    drawReport(
      result.data || {}
    );
  }


  // ====================================================
  // EVENTS
  // ====================================================

  back.addEventListener(
    "click",
    showHome
  );


  showButton.addEventListener(
    "click",
    loadReport
  );


  // При смене периода пока автоматически
  // запрос не отправляем.
  // Пользователь нажимает "Показать".


  // ====================================================
  // FIRST LOAD
  // ====================================================

  loadReport();
}