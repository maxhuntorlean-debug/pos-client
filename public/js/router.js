import { showLogin } from "./pages/login.js";
import { showHome } from "./pages/home.js";
import { showSale } from "./pages/sale.js";
import { showIncome } from "./pages/income.js";
import { showJournal } from "./pages/journal.js";
import { showReport } from "./pages/report.js";
import { showLog } from "./pages/log.js";

let app = null;

export function initRouter(root){
  app = root;
}

export function navigate(route){
  if(!app) throw new Error("Router is not initialized");

  switch(route){
    case "login":
      showLogin(app, () => navigate("home"));
      break;
    case "home":
      showHome(app, {
        login: () => navigate("login"),
        sale: () => navigate("sale"),
        income: () => navigate("income"),
        journal: () => navigate("journal"),
        report: () => navigate("report"),
        log: () => navigate("log")
      });
      break;
    case "sale":
      showSale(app, () => navigate("home"));
      break;
    case "income":
      showIncome(app, () => navigate("home"));
      break;
    case "journal":
      showJournal(app, () => navigate("home"));
      break;
    case "report":
      showReport(app, () => navigate("home"));
      break;
    case "log":
      showLog(app, () => navigate("home"));
      break;
    default:
      navigate("home");
  }
}
