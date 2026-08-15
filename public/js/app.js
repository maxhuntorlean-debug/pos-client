import { authLogin, authLogout, authMe } from "./api.js";

const app = document.getElementById("app");
let currentUser = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function hasPermission(permission) {
  if (!currentUser) return false;
  if (currentUser.permissions?.includes("*")) return true;
  return currentUser.permissions?.includes(permission) ?? false;
}

function today() {
  const date = new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function showLogin() {
  app.innerHTML = `
    <main class="login-page">
      <section class="login-card">
        <div class="login-logo">Котопанда v2+</div>
        <h1>Вход в систему</h1>
        <form id="loginForm" class="login-form">
          <label>Логин<input name="username" autocomplete="username" required></label>
          <label>Пароль<input name="password" type="password" autocomplete="current-password" required></label>
          <div id="loginError" class="error" role="alert"></div>
          <button id="loginButton" type="submit">ВОЙТИ</button>
        </form>
      </section>
    </main>`;

  const form = document.getElementById("loginForm");
  const error = document.getElementById("loginError");
  const button = document.getElementById("loginButton");

  form.addEventListener("submit", async event => {
    event.preventDefault();
    error.textContent = "";
    button.disabled = true;
    button.textContent = "ВХОД...";

    const data = new FormData(form);

    try {
      const login = await authLogin(
        String(data.get("username") || "").trim(),
        String(data.get("password") || "")
      );

      if (!login.success) {
        error.textContent = login.error?.message || "Ошибка авторизации";
        return;
      }

      const me = await authMe();
      if (!me.success) {
        error.textContent = me.error?.message || "Не удалось получить пользователя";
        return;
      }

      currentUser = me.data;
      showHome();
    } catch {
      error.textContent = "Нет связи с сервером";
    } finally {
      button.disabled = false;
      button.textContent = "ВОЙТИ";
    }
  });
}

function menuItem(permission, label, action = "") {
  if (!hasPermission(permission)) return "";
  const actionAttr = action ? ` data-action="${action}"` : "";
  return `<button class="menu-item" type="button"${actionAttr}>${label}</button>`;
}

function showHome() {
  app.innerHTML = `
    <main class="home-page">
      <header class="hero-header">
        <div class="title">Котопанда v2+</div>
        <div class="current-user">${escapeHtml(currentUser?.name || "Пользователь")}</div>
      </header>
      <section class="menu">
        ${menuItem("sale.create", "💰 Реализация", "sale")}
        ${menuItem("product.create", "📦 Приход")}
        ${menuItem("journal.read", "📋 Журнал реализации")}
        ${menuItem("report.read", "∑ Отчёт продаж")}
        ${menuItem("event.read", "🕘 Журнал событий")}
        <button id="logoutButton" class="menu-item logout" type="button">🚪 Выйти</button>
      </section>
    </main>`;

  app.querySelector('[data-action="sale"]')?.addEventListener("click", showSale);
  document.getElementById("logoutButton").addEventListener("click", async () => {
    try {
      await authLogout();
    } finally {
      currentUser = null;
      showLogin();
    }
  });
}

function showSale() {
  const canChangeDate = hasPermission("sale.date.change");

  app.innerHTML = `
    <main class="sale-page">
      <button id="saleBackButton" class="back-button" type="button">← Назад</button>

      <div class="saleHeader">
        <h2 class="saleTitle">Реализация</h2>
        <input type="date" id="docDate" class="saleDate" value="${today()}" ${canChangeDate ? "" : "disabled"}>
      </div>

      <div class="saleBarcodeRow">
        <input id="saleBarcode" class="saleBarcode" type="text" placeholder="Штрихкод" readonly>
        <button class="productMicButton" type="button" disabled>🎤</button>
      </div>

      <table class="saleTable">
        <thead>
          <tr><th>Код</th><th>Наименование</th><th>Цена</th></tr>
        </thead>
        <tbody></tbody>
      </table>

      <div class="saleTotals">
        <div>Количество: <span>0</span> шт.</div>
        <div>Сумма: <span>0.00</span></div>
      </div>

      <div class="saleButtons">
        <button class="saleButton" type="button" disabled>Продажа</button>
      </div>
    </main>`;

  document.getElementById("saleBackButton").addEventListener("click", showHome);
}

async function start() {
  try {
    const me = await authMe();
    if (me.success) {
      currentUser = me.data;
      showHome();
      return;
    }
  } catch {
    // Login screen is the fallback when API is unavailable or session is absent.
  }

  showLogin();
}

start();
