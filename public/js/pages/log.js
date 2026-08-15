export function showLog(app, showHome){
  app.innerHTML=`<main class="sale-page document-page"><button id="logBackButton" class="back-button">← Назад</button><div class="saleHeader"><h2 class="saleTitle">Журнал событий</h2></div><table class="saleTable"><thead><tr><th>Дата</th><th>Событие</th><th>Описание</th></tr></thead><tbody></tbody></table></main>`;
  document.getElementById("logBackButton").addEventListener("click", showHome);
}
