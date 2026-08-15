export let currentUser = null;
export function setCurrentUser(user){ currentUser = user; }
export function hasPermission(permission){
  if(!currentUser) return false;
  if(currentUser.permissions?.includes("*")) return true;
  return currentUser.permissions?.includes(permission) ?? false;
}
export function today(){
  const date = new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0,10);
}
export function escapeHtml(value){
  return String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
export function formatDate(value){
  const parts = String(value || "").split("-");
  return parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : String(value || "");
}
