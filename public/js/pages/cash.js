import {
  getCashDocuments,
  createCashDocument,
} from "../api.js";

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
// CASH JOURNAL
// ======================================================

export function showCash(
  app,
  showHome,
  openDocument,
  cashType,
  cashTitle
) {

  // ====================================================
  // PERMISSIONS
  // ====================================================

  const permissionPrefix =
    cashType === "KOTOPANDA"
      ? "cash.kotopanda"
      : "cash.elitka";


  // ----------------------------------------------------
  // TODAY
  //
  // .today или .edit
  // ----------------------------------------------------

  const canEditToday =
    hasPermission(
      `${permissionPrefix}.today`
    ) ||
    hasPermission(
      `${permissionPrefix}.edit`
    );


  // ----------------------------------------------------
  // HISTORY
  //
  // Только .edit
  // ----------------------------------------------------

  const canEditHistory =
    hasPermission(
      `${permissionPrefix}.edit`
    );


  const currentDate =
    today();


  // ====================================================
  // PAGE
  // ====================================================

  app.innerHTML = `
    <main
      class="sale-page document-page cashPage"
    >

      <button
        id="cashBackButton"
        class="back-button"
        type="button"
      >
        ← Назад
      </button>


      <div class="saleHeader">

        <h2 class="saleTitle">
          ${escapeHtml(cashTitle)}
        </h2>

      </div>


      <table
        class="saleTable cashTable"
      >

        <thead>

          <tr>

            <th>
              Дата
            </th>

            <th>
              Документ
            </th>

            <th>
              Остаток
            </th>

          </tr>

        </thead>


        <tbody
          id="cashRows"
        ></tbody>

      </table>


      <button
        id="cashAddButton"
        class="cashAddButton"
        type="button"
        aria-label="Новый документ"
      >
        +
      </button>


      <!-- =============================================
           DATE DIALOG
           ============================================= -->

      <div
        id="cashDateDialog"
        class="cashModal"
      >

        <div class="cashModalBox">

          <div class="cashModalTitle">
            Новый документ
          </div>


          <div class="cashDateLabel">
            Дата
          </div>


          <input
            id="cashDocumentDate"
            class="cashDateInput"
            type="date"
            value="${currentDate}"
            max="${currentDate}"
          >


          <div class="cashModalActions">

            <button
              id="cashDateCancel"
              class="cashModalCancel"
              type="button"
            >
              Отмена
            </button>


            <button
              id="cashDateCreate"
              class="cashModalOk"
              type="button"
            >
              Создать
            </button>

          </div>

        </div>

      </div>


      <!-- =============================================
           LOADING
           ============================================= -->

      <div
        id="cashLoading"
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

  const rows =
    document.getElementById(
      "cashRows"
    );


  const backButton =
    document.getElementById(
      "cashBackButton"
    );


  const addButton =
    document.getElementById(
      "cashAddButton"
    );


  const loading =
    document.getElementById(
      "cashLoading"
    );


  // ====================================================
  // DATE DIALOG
  // ====================================================

  const dateDialog =
    document.getElementById(
      "cashDateDialog"
    );


  const dateInput =
    document.getElementById(
      "cashDocumentDate"
    );


  const dateCancel =
    document.getElementById(
      "cashDateCancel"
    );


  const dateCreate =
    document.getElementById(
      "cashDateCreate"
    );


  // ====================================================
  // STATE
  // ====================================================

  let busy = false;


  // ====================================================
  // READ ONLY
  //
  // Если нет ни today, ни edit —
  // кнопку создания документа вообще не показываем.
  // ====================================================

  addButton.hidden =
    !canEditToday;


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


    addButton.disabled =
      value;


    backButton.disabled =
      value;


    dateCreate.disabled =
      value;
  }


  // ====================================================
  // MONEY
  // ====================================================

  function money(value) {

    const number =
      Number(value);


    if (
      !Number.isFinite(number)
    ) {
      return "0.00";
    }


    return number.toFixed(2);
  }


  // ====================================================
  // DRAW DOCUMENTS
  // ====================================================

  function drawDocuments(data) {

    if (!data.length) {

      rows.innerHTML = `

        <tr>

          <td
            colspan="3"
            class="cashEmpty"
          >
            Документов пока нет
          </td>

        </tr>

      `;

      return;
    }


    rows.innerHTML =
      data
        .map(
          (document) => `

            <tr
              class="cashDocumentRow"
              data-id="${Number(
                document.id
              )}"
            >

              <td>
                ${escapeHtml(
                  formatDate(
                    document.cash_date
                  )
                )}
              </td>


              <td>
                №${escapeHtml(
                  document.id
                )}
              </td>


              <td>
                ${escapeHtml(
                  money(
                    document.closing_balance
                  )
                )}
              </td>

            </tr>

          `
        )
        .join("");


    // ==================================================
    // OPEN DOCUMENT
    // ==================================================

    rows
      .querySelectorAll(
        ".cashDocumentRow"
      )
      .forEach(
        (row) => {

          row.addEventListener(
            "click",
            () => {

              const id =
                Number(
                  row.dataset.id
                );


              if (
                Number.isInteger(id) &&
                id > 0
              ) {

                openDocument(id);

              }

            }
          );

        }
      );
  }


  // ====================================================
  // LOAD DOCUMENTS
  // ====================================================

  async function loadDocuments() {

    if (busy) {
      return;
    }


    setBusy(true);


    let result;


    try {

      result =
        await getCashDocuments(
          cashType
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


    if (result.success) {

      const data =
        Array.isArray(
          result.data
        )
          ? result.data
          : [];


      drawDocuments(
        data
      );


      return;
    }


    showMessage(
      cashTitle,
      result.error?.message ||
        "Не удалось загрузить документы"
    );
  }


  // ====================================================
  // CREATE DOCUMENT
  // ====================================================

  async function createDocument(
    selectedDate = null
  ) {

    if (busy) {
      return;
    }


    // --------------------------------------------------
    // Нет прав даже на сегодняшний день
    // --------------------------------------------------

    if (!canEditToday) {

      showMessage(
        cashTitle,
        "Доступ только для просмотра"
      );

      return;
    }


    // --------------------------------------------------
    // Определяем дату
    // --------------------------------------------------

    const documentDate =
      selectedDate ||
      currentDate;


    // --------------------------------------------------
    // FUTURE
    // --------------------------------------------------

    if (
      documentDate >
      currentDate
    ) {

      showMessage(
        cashTitle,
        "Нельзя создать документ на будущую дату"
      );

      return;
    }


    // --------------------------------------------------
    // HISTORY
    //
    // Прошлую дату может создавать только .edit
    // --------------------------------------------------

    if (
      documentDate <
        currentDate &&
      !canEditHistory
    ) {

      showMessage(
        cashTitle,
        "Нет доступа к созданию документов за прошлую дату"
      );

      return;
    }


    // --------------------------------------------------
    // REQUEST
    // --------------------------------------------------

    setBusy(true);


    let result;


    try {

      result =
        await createCashDocument(
          cashType,
          documentDate
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
    // CREATED
    // --------------------------------------------------

    if (result.success) {

      const id =
        Number(
          result.data?.id
        );


      if (
        Number.isInteger(id) &&
        id > 0
      ) {

        openDocument(id);

        return;
      }


      await loadDocuments();

      return;
    }


    // --------------------------------------------------
    // DOCUMENT ALREADY EXISTS
    //
    // Если API вернул id существующего документа,
    // просто открываем его.
    // --------------------------------------------------

    const existingId =
      Number(
        result.data?.id
      );


    if (
      Number.isInteger(
        existingId
      ) &&
      existingId > 0
    ) {

      openDocument(
        existingId
      );

      return;
    }


    // --------------------------------------------------
    // ERROR
    // --------------------------------------------------

    showMessage(
      cashTitle,
      result.error?.message ||
        "Не удалось создать документ"
    );
  }


  // ====================================================
  // ADD DOCUMENT
  // ====================================================

  function addDocument() {

    if (busy) {
      return;
    }


    // --------------------------------------------------
    // VIEW ONLY
    // --------------------------------------------------

    if (!canEditToday) {

      return;
    }


    // --------------------------------------------------
    // FULL EDIT
    //
    // Показываем календарь.
    // Можно выбрать сегодня или прошлую дату.
    // --------------------------------------------------

    if (canEditHistory) {

      dateInput.value =
        currentDate;


      dateDialog.classList.add(
        "show"
      );


      return;
    }


    // --------------------------------------------------
    // TODAY
    //
    // Только сегодняшний документ.
    // Календарь не показываем.
    // --------------------------------------------------

    createDocument(
      currentDate
    );
  }


  // ====================================================
  // CREATE SELECTED DATE
  // ====================================================

  function createSelectedDate() {

    if (!canEditHistory) {

      dateDialog.classList.remove(
        "show"
      );

      return;
    }


    const selectedDate =
      String(
        dateInput.value ||
        ""
      ).trim();


    if (!selectedDate) {

      showMessage(
        cashTitle,
        "Выберите дату"
      );

      return;
    }


    // --------------------------------------------------
    // FUTURE
    // --------------------------------------------------

    if (
      selectedDate >
      currentDate
    ) {

      showMessage(
        cashTitle,
        "Нельзя создать документ на будущую дату"
      );

      return;
    }


    dateDialog.classList.remove(
      "show"
    );


    createDocument(
      selectedDate
    );
  }


  // ====================================================
  // EVENTS
  // ====================================================

  backButton.addEventListener(
    "click",
    showHome
  );


  addButton.addEventListener(
    "click",
    addDocument
  );


  dateCancel.addEventListener(
    "click",
    () => {

      dateDialog.classList.remove(
        "show"
      );

    }
  );


  dateCreate.addEventListener(
    "click",
    createSelectedDate
  );


  // ====================================================
  // START
  // ====================================================

  loadDocuments();
}