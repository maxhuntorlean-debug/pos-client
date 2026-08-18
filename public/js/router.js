import { showLogin } from "./pages/login.js";
import { showHome } from "./pages/home.js";


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

export async function navigate(
  route,
  params = {}
) {

  if (!app) {
    throw new Error(
      "Router is not initialized"
    );
  }


  switch (route) {

    // ==================================================
    // LOGIN
    // ==================================================

    case "login": {

      showLogin(
        app,
        () => navigate("home")
      );

      break;
    }


    // ==================================================
    // HOME
    // ==================================================

    case "home": {

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
          navigate(
            "cashKotopanda"
          ),

        cashElitka: () =>
          navigate(
            "cashElitka"
          ),

        cashElitkaReport: () =>
          navigate(
            "cashElitkaReport"
          ),

      });

      break;
    }


    // ==================================================
    // SALE
    // ==================================================

    case "sale": {

      const {
        showSale
      } =
        await import(
          "./pages/sale.js"
        );


      showSale(
        app,
        () => navigate("home")
      );

      break;
    }


    // ==================================================
    // INCOME
    // ==================================================

    case "income": {

      const {
        showIncome
      } =
        await import(
          "./pages/income.js"
        );


      showIncome(
        app,
        () => navigate("home")
      );

      break;
    }


    // ==================================================
    // JOURNAL
    // ==================================================

    case "journal": {

      const {
        showJournal
      } =
        await import(
          "./pages/journal.js"
        );


      showJournal(
        app,

        // Назад
        () =>
          navigate("home"),

        // Открыть документ
        (saleId) =>
          navigate(
            "saleDocument",
            {
              saleId,
            }
          )
      );

      break;
    }


    // ==================================================
    // SALE DOCUMENT
    // ==================================================

    case "saleDocument": {

      const {
        showSaleDocument
      } =
        await import(
          "./pages/saleDocument.js"
        );


      showSaleDocument(
        app,
        params.saleId,

        // Назад в журнал
        () =>
          navigate("journal")
      );

      break;
    }


    // ==================================================
    // SALES REPORT
    // ==================================================

    case "report": {

      const {
        showReport
      } =
        await import(
          "./pages/report.js"
        );


      showReport(
        app,
        () => navigate("home")
      );

      break;
    }


    // ==================================================
    // LOG
    // ==================================================

    case "log": {

      const {
        showLog
      } =
        await import(
          "./pages/log.js"
        );


      showLog(
        app,
        () => navigate("home")
      );

      break;
    }


    // ==================================================
    // CASH KOTOPANDA
    // ==================================================

    case "cashKotopanda": {

      const {
        showCash
      } =
        await import(
          "./pages/cash.js"
        );


      showCash(
        app,

        // Назад
        () =>
          navigate("home"),

        // Открыть документ
        (documentId) =>
          navigate(
            "cashDocument",
            {
              cashType:
                "KOTOPANDA",

              cashTitle:
                "Касса Котопанда",

              documentId,
            }
          ),

        "KOTOPANDA",
        "Касса Котопанда"
      );

      break;
    }


    // ==================================================
    // CASH ELITKA
    // ==================================================

    case "cashElitka": {

      const {
        showCash
      } =
        await import(
          "./pages/cash.js"
        );


      showCash(
        app,

        // Назад
        () =>
          navigate("home"),

        // Открыть документ
        (documentId) =>
          navigate(
            "cashDocument",
            {
              cashType:
                "ELITKA",

              cashTitle:
                "Касса Элитка",

              documentId,
            }
          ),

        "ELITKA",
        "Касса Элитка"
      );

      break;
    }


    // ==================================================
    // CASH ELITKA REPORT
    // ==================================================

    case "cashElitkaReport": {

      const {
        showCashReport
      } =
        await import(
          "./pages/cashReport.js"
        );


      showCashReport(
        app,
        () => navigate("home")
      );

      break;
    }


    // ==================================================
    // CASH DOCUMENT
    // ==================================================

    case "cashDocument": {

      const {
        showCashDocument
      } =
        await import(
          "./pages/cashDocument.js"
        );


      showCashDocument(
        app,

        params.cashType,
        params.cashTitle,
        params.documentId,

        () => {

          if (
            params.cashType ===
            "ELITKA"
          ) {

            navigate(
              "cashElitka"
            );

          } else {

            navigate(
              "cashKotopanda"
            );

          }

        }
      );

      break;
    }


    // ==================================================
    // DEFAULT
    // ==================================================

    default: {

      navigate("home");

      break;
    }
  }
}