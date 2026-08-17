import { showLogin } from "./pages/login.js";
import { showHome } from "./pages/home.js";
import { showSale } from "./pages/sale.js";
import { showIncome } from "./pages/income.js";
import { showJournal } from "./pages/journal.js";
import { showReport } from "./pages/report.js";
import { showLog } from "./pages/log.js";
import { showSaleDocument } from "./pages/saleDocument.js";

import { showCash } from "./pages/cash.js";
import { showCashDocument } from "./pages/cashDocument.js";
import { showCashReport } from "./pages/cashReport.js";


let app = null;


// ======================================================
// INIT ROUTER
// ======================================================

export function initRouter(root) {
  app = root;
}


// ======================================================
// NAVIGATE
// ======================================================

export function navigate(route, params = {}) {
  if (!app) {
    throw new Error("Router is not initialized");
  }

  switch (route) {

    // --------------------------------------------------
    // LOGIN
    // --------------------------------------------------

    case "login":
      showLogin(
        app,
        () => navigate("home")
      );
      break;


    // --------------------------------------------------
    // HOME
    // --------------------------------------------------

    case "home":
      showHome(app, {
        login: () =>
          navigate("login"),

        sale: () =>
          navigate("sale"),

        income: () =>
          navigate("income"),

        journal: () =>
          navigate("journal"),

        report: () =>
          navigate("report"),

        log: () =>
          navigate("log"),

        cashKotopanda: () =>
          navigate("cashKotopanda"),

        cashElitka: () =>
          navigate("cashElitka"),

        cashElitkaReport: () =>
          navigate("cashElitkaReport"),
      });
      break;


    // --------------------------------------------------
    // SALE
    // --------------------------------------------------

    case "sale":
      showSale(
        app,
        () => navigate("home")
      );
      break;


    // --------------------------------------------------
    // INCOME
    // --------------------------------------------------

    case "income":
      showIncome(
        app,
        () => navigate("home")
      );
      break;


    // --------------------------------------------------
    // JOURNAL
    // --------------------------------------------------

    case "journal":
      showJournal(
        app,

        // Назад
        () => navigate("home"),

        // Открыть документ
        (saleId) =>
          navigate(
            "saleDocument",
            { saleId }
          )
      );
      break;


    // --------------------------------------------------
    // SALE DOCUMENT
    // --------------------------------------------------

    case "saleDocument":
      showSaleDocument(
        app,
        params.saleId,

        // Назад возвращаемся в журнал
        () => navigate("journal")
      );
      break;


    // --------------------------------------------------
    // REPORT
    // --------------------------------------------------

    case "report":
      showReport(
        app,
        () => navigate("home")
      );
      break;


    // --------------------------------------------------
    // LOG
    // --------------------------------------------------

    case "log":
      showLog(
        app,
        () => navigate("home")
      );
      break;


    // --------------------------------------------------
    // CASH KOTOPANDA
    // --------------------------------------------------

    case "cashKotopanda":
  showCash(
    app,
    () => navigate("home"),

    (documentId) =>
      navigate(
        "cashDocument",
        {
          cashType: "KOTOPANDA",
          cashTitle: "Касса Котопанда",
          documentId,
        }
      ),

    "KOTOPANDA",
    "Касса Котопанда"
  );
  break;


    // --------------------------------------------------
    // CASH ELITKA
    // --------------------------------------------------

    case "cashElitka":
  showCash(
    app,
    () => navigate("home"),

    (documentId) =>
      navigate(
        "cashDocument",
        {
          cashType: "ELITKA",
          cashTitle: "Касса Элитка",
          documentId,
        }
      ),

    "ELITKA",
    "Касса Элитка"
  );
  break;
// --------------------------------------------------
// CASH ELITKA REPORT
// --------------------------------------------------

case "cashElitkaReport":
  showCashReport(
    app,
    () => navigate("home")
  );
  break;

  case "cashDocument":
  showCashDocument(
    app,
    params.cashType,
    params.cashTitle,
    params.documentId,

    () => {
      if (
        params.cashType === "ELITKA"
      ) {
        navigate("cashElitka");
      } else {
        navigate("cashKotopanda");
      }
    }
  );
  break;
    // --------------------------------------------------
    // DEFAULT
    // --------------------------------------------------

    default:
      navigate("home");
  }
}