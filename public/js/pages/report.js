export function showReport(app, showHome){
  app.innerHTML=`<main class="sale-page document-page"><button id="reportBackButton" class="back-button">← Назад</button><div class="saleHeader"><h2 class="saleTitle">Отчет продаж</h2></div><table class="saleTable"><thead><tr><th>ДОК</th><th>ТОВАР</th><th>ПРОД</th></tr></thead><tbody></tbody></table></main>`;
  document.getElementById("reportBackButton").addEventListener("click", showHome);
}
