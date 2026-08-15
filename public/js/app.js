import { authMe } from "./api.js";
import { setCurrentUser } from "./state.js";
import { initRouter, navigate } from "./router.js";

const app = document.getElementById("app");
initRouter(app);

async function start(){
  try{
    const me = await authMe();
    if(me.success){
      setCurrentUser(me.data);
      navigate("home");
      return;
    }
  }catch{}
  navigate("login");
}

start();
