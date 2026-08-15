import { authLogin, authMe } from "../api.js";
import { setCurrentUser } from "../state.js";
export function showLogin(app, showHome){
  app.innerHTML=`<main class="login-page"><section class="login-card"><div class="login-logo">Котопанда v2+</div><h1>Вход в систему</h1><form id="loginForm" class="login-form"><label>Логин<input name="username" autocomplete="username" required></label><label>Пароль<input name="password" type="password" autocomplete="current-password" required></label><div id="loginError" class="error"></div><button id="loginButton" type="submit">ВОЙТИ</button></form></section></main>`;
  const form=document.getElementById("loginForm"),error=document.getElementById("loginError"),button=document.getElementById("loginButton");
  form.addEventListener("submit",async event=>{event.preventDefault();error.textContent="";button.disabled=true;button.textContent="ВХОД...";const data=new FormData(form);try{const login=await authLogin(String(data.get("username")||"").trim(),String(data.get("password")||""));if(!login.success){error.textContent=login.error?.message||"Ошибка авторизации";return}const me=await authMe();if(!me.success){error.textContent=me.error?.message||"Не удалось получить пользователя";return}setCurrentUser(me.data);showHome()}catch{error.textContent="Нет связи с сервером"}finally{button.disabled=false;button.textContent="ВОЙТИ"}});
}
