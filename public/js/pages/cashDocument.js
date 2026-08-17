import {
  getCashDocument,
  addCashOperation,
  updateCashOperation,
  deleteCashOperation,
} from "../api.js";

import {
  dialogsHtml,
  showMessage,
} from "../components/dialogs.js";

import {
  keyboardHtml,
  initKeyboard,
  showKeyboard,
  hideKeyboard,
} from "../components/keyboard.js";

import {
  hasPermission,
  today,
  escapeHtml,
  formatDate,
} from "../state.js";


// ======================================================
// CASH OPERATIONS
// ======================================================

const CASH_OPERATIONS = {

  // ====================================================
  // ELITKA
  // ====================================================

  ELITKA: {

    plus: [
      {
        type: "SALES",
        label: "Реализация",
      },
    ],

    minus: [
      {
        type: "TERMINAL",
        label: "Терминал",
      },

      {
        type: "WITHDRAWAL",
        label: "Съём",
      },

      {
        type: "SUGAR",
        label: "Расход сахар и пр.",
      },

      {
        type: "OTHER",
        label: "Расход прочие",
        comment: true,
      },

      {
        type: "SALARY",
        label: "Зарплата",
        comment: true,
      },
    ],
  },


  // ====================================================
  // KOTOPANDA
  // ====================================================

  KOTOPANDA: {

    plus: [
      {
        type: "SALES",
        label: "Реализация",
      },

      {
        type: "CASH_IN",
        label: "Дали в кассу",
      },
    ],

    minus: [
      {
        type: "TERMINAL",
        label: "Терминал",
      },

      {
        type: "WITHDRAWAL",
        label: "Съём",
      },

      {
        type: "OTHER",
        label: "Прочие",
        comment: true,
      },

      {
        type: "SALARY",
        label: "Зарплата",
        comment: true,
      },
    ],
  },
};


// ======================================================
// PAGE
// ======================================================

export function showCashDocument(
  app,
  cashType,
  cashTitle,
  documentId,
  goBack
) {

  // ====================================================
  // PERMISSIONS
  // ====================================================

  const permissionPrefix =
    cashType === "KOTOPANDA"
      ? "cash.kotopanda"
      : "cash.elitka";


  const canEditToday =
    hasPermission(
      `${permissionPrefix}.today`
    ) ||
    hasPermission(
      `${permissionPrefix}.edit`
    );


  const canEditHistory =
    hasPermission(
      `${permissionPrefix}.edit`
    );


  // ====================================================
  // HTML
  // ====================================================

  app.innerHTML = `
    <main
      class="sale-page document-page cashDocumentPage"
    >

      <button
        id="cashDocumentBack"
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


      <div
        id="cashDocumentContent"
      ></div>


      <!-- =============================================
           ACTION BUTTONS
           ============================================= -->

      <div
        id="cashActionButtons"
        class="cashActionButtons"
        hidden
      >

        <button
          id="cashPlusButton"
          class="cashOperationButton cashPlusButton"
          type="button"
        >
          +
        </button>


        <button
          id="cashMinusButton"
          class="cashOperationButton cashMinusButton"
          type="button"
        >
          −
        </button>

      </div>


      <!-- =============================================
           OPERATION TYPE DIALOG
           ============================================= -->

      <div
        id="cashTypeDialog"
        class="cashModal"
      >

        <div class="cashModalBox">

          <div
            id="cashTypeTitle"
            class="cashModalTitle"
          >
            Операция
          </div>


          <div
            id="cashTypeButtons"
            class="cashTypeButtons"
          ></div>


          <button
            id="cashTypeCancel"
            class="cashModalCancel"
            type="button"
          >
            Отмена
          </button>

        </div>

      </div>


      <!-- =============================================
           AMOUNT DIALOG
           ============================================= -->

      <div
        id="cashAmountDialog"
        class="cashModal"
      >

        <div class="cashModalBox">

          <div
            id="cashAmountTitle"
            class="cashModalTitle"
          >
            Сумма
          </div>


          <input
            id="cashAmountInput"
            class="cashAmountInput"
            type="text"
            inputmode="none"
            autocomplete="off"
            placeholder="0.00"
            readonly
          >


          <div
            id="cashCommentBlock"
            class="cashCommentBlock"
            hidden
          >

            <div class="cashCommentLabel">
              Комментарий
            </div>


            <input
              id="cashCommentInput"
              class="cashCommentInput"
              type="text"
              autocomplete="off"
            >

          </div>


          <div class="cashModalActions">

            <button
              id="cashAmountCancel"
              class="cashModalCancel"
              type="button"
            >
              Отмена
            </button>


            <button
              id="cashAmountOk"
              class="cashModalOk"
              type="button"
            >
              Записать
            </button>

          </div>

        </div>

      </div>


      <!-- =============================================
           ROW ACTION DIALOG
           ============================================= -->

      <div
        id="cashRowDialog"
        class="cashModal"
      >

        <div class="cashModalBox">

          <div class="cashModalTitle">
            Операция
          </div>


          <div class="cashTypeButtons">

            <button
              id="cashEditButton"
              class="cashTypeButton"
              type="button"
            >
              Изменить
            </button>


            <button
              id="cashDeleteButton"
              class="cashTypeButton cashDeleteButton"
              type="button"
            >
              Удалить
            </button>

          </div>


          <button
            id="cashRowCancel"
            class="cashModalCancel"
            type="button"
          >
            Отмена
          </button>

        </div>

      </div>


      <!-- =============================================
           LOADING
           ============================================= -->

      <div
        id="cashDocumentLoading"
        class="loadingOverlay show"
        aria-hidden="false"
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

  const back =
    document.getElementById(
      "cashDocumentBack"
    );


  const content =
    document.getElementById(
      "cashDocumentContent"
    );


  const loading =
    document.getElementById(
      "cashDocumentLoading"
    );


  // ====================================================
  // ACTION BUTTONS
  // ====================================================

  const actionButtons =
    document.getElementById(
      "cashActionButtons"
    );


  const plusButton =
    document.getElementById(
      "cashPlusButton"
    );


  const minusButton =
    document.getElementById(
      "cashMinusButton"
    );


  // ====================================================
  // TYPE DIALOG
  // ====================================================

  const typeDialog =
    document.getElementById(
      "cashTypeDialog"
    );


  const typeTitle =
    document.getElementById(
      "cashTypeTitle"
    );


  const typeButtons =
    document.getElementById(
      "cashTypeButtons"
    );


  const typeCancel =
    document.getElementById(
      "cashTypeCancel"
    );


  // ====================================================
  // AMOUNT
  // ====================================================

  const amountDialog =
    document.getElementById(
      "cashAmountDialog"
    );


  const amountTitle =
    document.getElementById(
      "cashAmountTitle"
    );


  const amountInput =
    document.getElementById(
      "cashAmountInput"
    );


  const commentBlock =
    document.getElementById(
      "cashCommentBlock"
    );


  const commentInput =
    document.getElementById(
      "cashCommentInput"
    );


  const amountCancel =
    document.getElementById(
      "cashAmountCancel"
    );


  const amountOk =
    document.getElementById(
      "cashAmountOk"
    );


  // ====================================================
  // ROW ACTIONS
  // ====================================================

  const rowDialog =
    document.getElementById(
      "cashRowDialog"
    );


  const editButton =
    document.getElementById(
      "cashEditButton"
    );


  const deleteButton =
    document.getElementById(
      "cashDeleteButton"
    );


  const rowCancel =
    document.getElementById(
      "cashRowCancel"
    );


  // ====================================================
  // STATE
  // ====================================================

  let documentData =
    null;


  let busy =
    false;


  let selectedDefinition =
    null;


  let selectedSign =
    null;


  let selectedOperation =
    null;


  let editMode =
    false;


  // ====================================================
  // MONEY
  // ====================================================

  function money(value) {

    const number =
      Number(value);


    return Number.isFinite(number)
      ? number.toFixed(2)
      : "0.00";
  }


  // ====================================================
  // CAN EDIT DOCUMENT
  // ====================================================

  function canEditDocument() {

    if (!documentData) {
      return false;
    }


    const documentDate =
      String(
        documentData.cash_date ||
        ""
      );


    // --------------------------------------------------
    // TODAY
    //
    // Нужно .today или .edit
    // --------------------------------------------------

    if (
      documentDate ===
      today()
    ) {

      return canEditToday;

    }


    // --------------------------------------------------
    // HISTORY
    //
    // Только .edit
    // --------------------------------------------------

    if (
      documentDate <
      today()
    ) {

      return canEditHistory;

    }


    // --------------------------------------------------
    // FUTURE
    // --------------------------------------------------

    return false;
  }


  // ====================================================
  // FIND DEFINITION
  // ====================================================

  function findDefinition(
    operationType
  ) {

    const config =
      CASH_OPERATIONS[cashType];


    if (!config) {
      return null;
    }


    return [
      ...config.plus,
      ...config.minus,
    ].find(
      (item) =>
        item.type ===
        operationType
    ) || null;
  }


  // ====================================================
  // OPERATION LABEL
  // ====================================================

  function operationLabel(
    operation
  ) {

    const definition =
      findDefinition(
        operation.operation_type
      );


    return (
      definition?.label ||
      operation.operation_type ||
      ""
    );
  }


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


    back.disabled =
      value;


    plusButton.disabled =
      value;


    minusButton.disabled =
      value;


    amountOk.disabled =
      value;


    editButton.disabled =
      value;


    deleteButton.disabled =
      value;
  }


  // ====================================================
  // RESET
  // ====================================================

  function resetSelection() {

    selectedDefinition =
      null;


    selectedSign =
      null;


    selectedOperation =
      null;


    editMode =
      false;


    amountInput.value =
      "";


    commentInput.value =
      "";
  }


  // ====================================================
  // CLOSE AMOUNT
  // ====================================================

  function closeAmountDialog() {

    hideKeyboard();


    commentInput.blur();


    amountDialog.classList.remove(
      "show"
    );


    resetSelection();
  }


  // ====================================================
  // DRAW
  // ====================================================

  function draw() {

    if (!documentData) {
      return;
    }


    const operations =
      Array.isArray(
        documentData.operations
      )
        ? documentData.operations
        : [];


    const editable =
      canEditDocument();


    content.innerHTML = `

      <div class="cashDocumentHeader">

        <div>
          ${escapeHtml(
            formatDate(
              documentData.cash_date
            )
          )}
        </div>


        <div>
          Документ №${escapeHtml(
            documentData.id
          )}
        </div>

      </div>


      <div class="cashBalanceBlock">

        <div>

          <span>
            Остаток на начало
          </span>


          <strong>
            ${escapeHtml(
              money(
                documentData.opening_balance
              )
            )}
          </strong>

        </div>

      </div>


      <table
        class="saleTable cashOperationsTable"
      >

        <thead>

          <tr>

            <th>
              Операция
            </th>

            <th>
              Сумма
            </th>

          </tr>

        </thead>


        <tbody>

          ${
            operations.length

              ? operations
                  .map(
                    (operation) => `

                      <tr
                        class="${
                          editable
                            ? "cashOperationRow"
                            : ""
                        }"
                        data-id="${Number(
                          operation.id
                        )}"
                      >

                        <td>

                          <div class="cashOperationName">

                            ${
                              Number(
                                operation.sign
                              ) === -1
                                ? "−"
                                : "+"
                            }

                            ${escapeHtml(
                              operationLabel(
                                operation
                              )
                            )}

                          </div>


                          ${
                            operation.comment

                              ? `
                                <div class="cashOperationComment">

                                  ${escapeHtml(
                                    operation.comment
                                  )}

                                </div>
                              `

                              : ""
                          }

                        </td>


                        <td
                          class="${
                            Number(
                              operation.sign
                            ) === -1
                              ? "cashNegative"
                              : "cashPositive"
                          }"
                        >

                          ${
                            Number(
                              operation.sign
                            ) === -1
                              ? "−"
                              : "+"
                          }

                          ${escapeHtml(
                            money(
                              operation.amount
                            )
                          )}

                        </td>

                      </tr>

                    `
                  )
                  .join("")

              : `

                <tr>

                  <td
                    colspan="2"
                    class="cashEmpty"
                  >
                    Операций пока нет
                  </td>

                </tr>

              `
          }

        </tbody>

      </table>


      <div class="cashClosingBalance">

        <span>
          Остаток
        </span>


        <strong>
          ${escapeHtml(
            money(
              documentData.closing_balance
            )
          )}
        </strong>

      </div>

    `;


    // ==================================================
    // EDIT BUTTONS
    // ==================================================

    actionButtons.hidden =
      !editable;


    // ==================================================
    // ROW EVENTS
    // ==================================================

    if (!editable) {
      return;
    }


    content
      .querySelectorAll(
        ".cashOperationRow"
      )
      .forEach(
        (row) => {

          row.addEventListener(
            "click",
            () => {

              if (busy) {
                return;
              }


              const id =
                Number(
                  row.dataset.id
                );


              selectedOperation =
                operations.find(
                  (item) =>
                    Number(item.id) ===
                    id
                ) || null;


              if (
                !selectedOperation
              ) {
                return;
              }


              rowDialog.classList.add(
                "show"
              );

            }
          );

        }
      );
  }


  // ====================================================
  // LOAD
  // ====================================================

  async function load() {

    setBusy(true);


    let result;


    try {

      result =
        await getCashDocument(
          cashType,
          documentId
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


    if (!result.success) {

      showMessage(
        cashTitle,
        result.error?.message ||
          "Не удалось загрузить документ"
      );

      return;
    }


    documentData =
      result.data;


    draw();
  }


  // ====================================================
  // OPEN TYPE MENU
  // ====================================================

  function openTypeMenu(sign) {

    if (
      busy ||
      !canEditDocument()
    ) {
      return;
    }


    resetSelection();


    const config =
      CASH_OPERATIONS[cashType];


    if (!config) {
      return;
    }


    selectedSign =
      sign;


    const operations =
      sign === 1
        ? config.plus
        : config.minus;


    typeTitle.textContent =
      sign === 1
        ? "Приход"
        : "Расход";


    typeButtons.innerHTML =
      operations
        .map(
          (operation) => `

            <button
              class="cashTypeButton"
              type="button"
              data-type="${escapeHtml(
                operation.type
              )}"
            >
              ${escapeHtml(
                operation.label
              )}
            </button>

          `
        )
        .join("");


    typeButtons
      .querySelectorAll(
        ".cashTypeButton"
      )
      .forEach(
        (button) => {

          button.addEventListener(
            "click",
            () => {

              const type =
                button.dataset.type;


              selectedDefinition =
                operations.find(
                  (operation) =>
                    operation.type ===
                    type
                ) || null;


              if (
                !selectedDefinition
              ) {
                return;
              }


              typeDialog.classList.remove(
                "show"
              );


              openAmountDialog();

            }
          );

        }
      );


    typeDialog.classList.add(
      "show"
    );
  }


  // ====================================================
  // OPEN AMOUNT
  // ====================================================

  function openAmountDialog() {

    if (!selectedDefinition) {
      return;
    }


    amountTitle.textContent =
      selectedDefinition.label;


    // --------------------------------------------------
    // NEW
    // --------------------------------------------------

    if (!editMode) {

      amountInput.value =
        "";


      commentInput.value =
        "";

    }


    // --------------------------------------------------
    // COMMENT
    // --------------------------------------------------

    commentBlock.hidden =
      !selectedDefinition.comment;


    // --------------------------------------------------
    // SHOW
    // --------------------------------------------------

    amountDialog.classList.add(
      "show"
    );


    requestAnimationFrame(
      () => {

        amountInput.focus();


        if (
          editMode &&
          amountInput.value
        ) {

          amountInput.select();

        }


        showKeyboard(
          amountInput,
          {

            onEnter: () => {

              saveOperation();

            },

          }
        );

      }
    );
  }


  // ====================================================
  // SHOW AMOUNT KEYBOARD
  // ====================================================

  function showAmountKeyboard() {

    if (
      !amountDialog.classList.contains(
        "show"
      )
    ) {
      return;
    }


    // Закрываем системную клавиатуру

    commentInput.blur();


    // Показываем нашу

    showKeyboard(
      amountInput,
      {

        onEnter: () => {

          saveOperation();

        },

      }
    );
  }


  // ====================================================
  // SAVE
  // ====================================================

  async function saveOperation() {

    if (
      busy ||
      !selectedDefinition ||
      !canEditDocument()
    ) {
      return;
    }


    const amount =
      Number(
        String(
          amountInput.value
        ).replace(
          ",",
          "."
        )
      );


    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {

      showMessage(
        cashTitle,
        "Введите корректную сумму"
      );

      return;
    }


    const comment =
      String(
        commentInput.value ??
        ""
      ).trim();


    if (
      selectedDefinition.comment &&
      !comment
    ) {

      // Чтобы пользователь мог сразу
      // начать вводить комментарий.

      hideKeyboard();


      commentInput.focus();


      showMessage(
        cashTitle,
        "Введите комментарий"
      );


      return;
    }


    hideKeyboard();


    commentInput.blur();


    amountDialog.classList.remove(
      "show"
    );


    setBusy(true);


    let result;


    try {

      // ------------------------------------------------
      // UPDATE
      // ------------------------------------------------

      if (
        editMode &&
        selectedOperation
      ) {

        result =
          await updateCashOperation(
            cashType,
            documentId,
            selectedOperation.id,
            {

              sign:
                selectedSign,

              operation_type:
                selectedDefinition.type,

              amount,

              comment,

            }
          );

      }

      // ------------------------------------------------
      // CREATE
      // ------------------------------------------------

      else {

        result =
          await addCashOperation(
            cashType,
            documentId,
            {

              sign:
                selectedSign,

              operation_type:
                selectedDefinition.type,

              amount,

              comment,

            }
          );

      }

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


    if (!result.success) {

      showMessage(
        cashTitle,
        result.error?.message ||
          "Не удалось записать операцию"
      );

      return;
    }


    resetSelection();


    await load();
  }


  // ====================================================
  // EDIT
  // ====================================================

  function editSelected() {

    if (
      !selectedOperation ||
      !canEditDocument()
    ) {
      return;
    }


    rowDialog.classList.remove(
      "show"
    );


    selectedDefinition =
      findDefinition(
        selectedOperation.operation_type
      );


    if (!selectedDefinition) {

      showMessage(
        cashTitle,
        "Неизвестный тип операции"
      );

      return;
    }


    selectedSign =
      Number(
        selectedOperation.sign
      );


    editMode =
      true;


    amountInput.value =
      money(
        selectedOperation.amount
      );


    commentInput.value =
      String(
        selectedOperation.comment ||
        ""
      );


    openAmountDialog();
  }


  // ====================================================
  // DELETE
  // ====================================================

  async function deleteSelected() {

    if (
      busy ||
      !selectedOperation ||
      !canEditDocument()
    ) {
      return;
    }


    rowDialog.classList.remove(
      "show"
    );


    const confirmed =
      window.confirm(
        "Удалить операцию?"
      );


    if (!confirmed) {

      resetSelection();

      return;
    }


    setBusy(true);


    let result;


    try {

      result =
        await deleteCashOperation(
          cashType,
          documentId,
          selectedOperation.id
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


    if (!result.success) {

      showMessage(
        cashTitle,
        result.error?.message ||
          "Не удалось удалить операцию"
      );

      return;
    }


    resetSelection();


    await load();
  }


  // ====================================================
  // EVENTS
  // ====================================================

  back.addEventListener(
    "click",
    () => {

      hideKeyboard();

      commentInput.blur();

      goBack();

    }
  );


  // ----------------------------------------------------
  // PLUS
  // ----------------------------------------------------

  plusButton.addEventListener(
    "click",
    () => {

      openTypeMenu(1);

    }
  );


  // ----------------------------------------------------
  // MINUS
  // ----------------------------------------------------

  minusButton.addEventListener(
    "click",
    () => {

      openTypeMenu(-1);

    }
  );


  // ----------------------------------------------------
  // TYPE CANCEL
  // ----------------------------------------------------

  typeCancel.addEventListener(
    "click",
    () => {

      typeDialog.classList.remove(
        "show"
      );

      resetSelection();

    }
  );


  // ----------------------------------------------------
  // COMMENT
  //
  // При переходе на комментарий
  // убираем нашу цифровую клавиатуру.
  // ----------------------------------------------------

  commentInput.addEventListener(
    "focus",
    () => {

      hideKeyboard();

    }
  );


  // ----------------------------------------------------
  // AMOUNT
  //
  // Тапнули обратно по сумме —
  // закрываем системную клавиатуру
  // и возвращаем нашу.
  // ----------------------------------------------------

  amountInput.addEventListener(
    "click",
    () => {

      showAmountKeyboard();

    }
  );


  // ----------------------------------------------------
  // AMOUNT CANCEL
  // ----------------------------------------------------

  amountCancel.addEventListener(
    "click",
    () => {

      closeAmountDialog();

    }
  );


  // ----------------------------------------------------
  // AMOUNT OK
  // ----------------------------------------------------

  amountOk.addEventListener(
    "click",
    () => {

      saveOperation();

    }
  );


  // ----------------------------------------------------
  // EDIT
  // ----------------------------------------------------

  editButton.addEventListener(
    "click",
    () => {

      editSelected();

    }
  );


  // ----------------------------------------------------
  // DELETE
  // ----------------------------------------------------

  deleteButton.addEventListener(
    "click",
    () => {

      deleteSelected();

    }
  );


  // ----------------------------------------------------
  // ROW CANCEL
  // ----------------------------------------------------

  rowCancel.addEventListener(
    "click",
    () => {

      rowDialog.classList.remove(
        "show"
      );

      resetSelection();

    }
  );


  // ====================================================
  // START
  // ====================================================

  load();
}