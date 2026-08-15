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

function showLogin() {
  app.innerHTML = `
    <main class="login-page">
      <section class="login-card">
        <div class="login-logo">KotoPanda</div>
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

function menuItem(permission, label) {
  if (!hasPermission(permission)) return "";
  return `<button class="menu-item" type="button" disabled>${label}</button>`;
}

function showHome() {
  app.innerHTML = `
    <main class="home-page">
      <header class="header">
        <div class="title">Котопанда</div>
        <div class="current-user">${escapeHtml(currentUser?.name)}</div>
      </header>
      <section class="menu">
        ${menuItem("sale.create", "💰 Реализация")}
        ${menuItem("product.create", "📦 Приход")}
        ${menuItem("journal.read", "📋 Журнал реализации")}
        ${menuItem("report.read", "∑ Отчёт продаж")}
        ${menuItem("event.read", "🕘 Журнал событий")}
        ${menuItem("admin.access", "👤 Пользователи")}
        <button id="logoutButton" class="menu-item logout" type="button">🚪 Выйти</button>
      </section>
    </main>`;

  document.getElementById("logoutButton").addEventListener("click", async () => {
    try {
      await authLogout();
    } finally {
      currentUser = null;
      showLogin();
    }
  });
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
