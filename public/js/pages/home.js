import { authLogout } from "../api.js";
import { currentUser, setCurrentUser, hasPermission, escapeHtml } from "../state.js";
function menuItem(permission,label,action=""){if(!hasPermission(permission))return"";return`<button class="menu-item" type="button"${action?` data-action="${action}"`:""}>${label}</button>`}
export function showHome(app, routes){
 app.innerHTML=`<main class="home-page"><header class="hero-header"><div class="title">Котопанда v2+</div><div class="current-user">${escapeHtml(currentUser?.name||"Пользователь")}</div></header><section class="menu">${menuItem("sale.create","💰 Реализация","sale")}${menuItem("product.create","📦 Приход","income")}${menuItem("journal.read","📋 Журнал реализации","journal")}${menuItem("report.read","∑ Отчёт продаж","report")}${menuItem("event.read","🕘 Журнал событий","log")}<button id="logoutButton" class="menu-item logout" type="button">🚪 Выйти</button></section></main>`;
 app.querySelector('[data-action="sale"]')?.addEventListener("click",routes.sale);app.querySelector('[data-action="income"]')?.addEventListener("click",routes.income);app.querySelector('[data-action="journal"]')?.addEventListener("click",routes.journal);app.querySelector('[data-action="report"]')?.addEventListener("click",routes.report);app.querySelector('[data-action="log"]')?.addEventListener("click",routes.log);
 document.getElementById("logoutButton").addEventListener("click",async()=>{try{await authLogout()}finally{setCurrentUser(null);routes.login()}});
}
