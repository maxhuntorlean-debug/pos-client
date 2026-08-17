import {
  authLogout,
} from "../api.js";

import {
  currentUser,
  setCurrentUser,
  hasPermission,
  escapeHtml,
} from "../state.js";


// ======================================================
// MENU ITEM
// ======================================================

function menuItem(
  permission,
  label,
  action = ""
) {

  if (!hasPermission(permission)) {
    return "";
  }

  return `
    <button
      class="menu-item"
      type="button"
      ${
        action
          ? `data-action="${action}"`
          : ""
      }
    >
      ${label}
    </button>
  `;
}


// ======================================================
// CASH VIEW PERMISSIONS
// ======================================================

function canViewElitka() {

  return (
    hasPermission("cash.elitka") ||
    hasPermission("cash.elitka.today") ||
    hasPermission("cash.elitka.edit")
  );
}


function canViewKotopanda() {

  return (
    hasPermission("cash.kotopanda") ||
    hasPermission("cash.kotopanda.today") ||
    hasPermission("cash.kotopanda.edit")
  );
}


// ======================================================
// CASH MENU ITEM
// ======================================================

function cashMenuItem(
  visible,
  label,
  action
) {

  if (!visible) {
    return "";
  }

  return `
    <button
      class="menu-item"
      type="button"
      data-action="${action}"
    >
      ${label}
    </button>
  `;
}


// ======================================================
// HOME
// ======================================================

export function showHome(
  app,
  routes
) {

  app.innerHTML = `
    <main class="home-page">

      <header class="hero-header">

        <div class="title">
          Котопанда v2+
        </div>

        <div class="current-user">
          ${escapeHtml(
            currentUser?.name ||
            "Пользователь"
          )}
        </div>

      </header>


      <section class="menu">

        ${menuItem(
          "sale.create",
          "💰 Реализация",
          "sale"
        )}

        ${menuItem(
          "product.create",
          "📦 Приход",
          "income"
        )}

        ${menuItem(
          "journal.read",
          "📋 Журнал реализации",
          "journal"
        )}

        ${menuItem(
          "report.read",
          "∑ Отчёт продаж",
          "report"
        )}

        ${menuItem(
          "event.read",
          "🕘 Журнал событий",
          "log"
        )}


        ${cashMenuItem(
          canViewKotopanda(),
          "🧸 Касса Котопанда",
          "cashKotopanda"
        )}

        ${cashMenuItem(
          canViewElitka(),
          "☕ Касса Элитка",
          "cashElitka"
        )}

        ${menuItem(
          "cash.elitka.report",
          "∑ Отчёт Элитка",
           "cashElitkaReport"
        )}

        <button
          id="logoutButton"
          class="menu-item logout"
          type="button"
        >
          🚪 Выйти
        </button>

      </section>

    </main>
  `;


  // ====================================================
  // ROUTES
  // ====================================================

  app
    .querySelector(
      '[data-action="sale"]'
    )
    ?.addEventListener(
      "click",
      routes.sale
    );


  app
    .querySelector(
      '[data-action="income"]'
    )
    ?.addEventListener(
      "click",
      routes.income
    );


  app
    .querySelector(
      '[data-action="journal"]'
    )
    ?.addEventListener(
      "click",
      routes.journal
    );


  app
    .querySelector(
      '[data-action="report"]'
    )
    ?.addEventListener(
      "click",
      routes.report
    );


  app
    .querySelector(
      '[data-action="log"]'
    )
    ?.addEventListener(
      "click",
      routes.log
    );


  app
    .querySelector(
      '[data-action="cashKotopanda"]'
    )
    ?.addEventListener(
      "click",
      routes.cashKotopanda
    );


  app
    .querySelector(
      '[data-action="cashElitka"]'
    )
    ?.addEventListener(
      "click",
      routes.cashElitka
    );



    app
  .querySelector(
    '[data-action="cashElitkaReport"]'
  )
  ?.addEventListener(
    "click",
    routes.cashElitkaReport
  );
  // ====================================================
  // LOGOUT
  // ====================================================

  document
    .getElementById(
      "logoutButton"
    )
    .addEventListener(
      "click",
      async () => {

        try {

          await authLogout();

        } finally {

          setCurrentUser(null);

          routes.login();

        }

      }
    );
}