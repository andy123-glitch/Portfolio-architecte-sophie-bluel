 import { displayWorks, filters, login } from "/scripts/script.js";


if(window.location.href === "http://127.0.0.1:5500/index.html"){
    displayWorks();
    filters();
}
login();