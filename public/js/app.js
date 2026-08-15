import { authMe } from "./api.js";
import { setCurrentUser } from "./state.js";
import { showLogin } from "./pages/login.js";
import { showHome } from "./pages/home.js";
import { showSale } from "./pages/sale.js";
import { showIncome } from "./pages/income.js";
import { showJournal } from "./pages/journal.js";
import { showReport, showLog } from "./pages/simple.js";

const app = document.getElementById("app");

const routes = {};
routes.login = () => showLogin(app, routes.home);
routes.home = () => showHome(app, routes);
routes.sale = () => showSale(app, routes.home);
routes.income = () => showIncome(app, routes.home);
routes.journal = () => showJournal(app, routes.home);
routes.report = () => showReport(app, routes.home);
routes.log = () => showLog(app, routes.home);

async function start(){
  try{
    const me = await authMe();
    if(me.success){
      setCurrentUser(me.data);
      routes.home();
      return;
    }
  }catch{}
  routes.login();
}

start();
