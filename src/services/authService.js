import COLLECTION from "constants/authority/commonData";

export function logout() {
  sessionStorage.removeItem('currentUser');
  window.location = COLLECTION.ROUTE.login;
}
