import { dispalyModal,displayWorks, filters, login, editionMode, userConnected } from "/scripts/script.js";

displayWorks();
if (userConnected() === null) {
    if (window.location.href === "http://127.0.0.1:5500/index.html") {
        filters();
    } else if (window.location.href === "http://127.0.0.1:5500/login.html") {
        login();
    }
} else {
    editionMode();
}
dispalyModal();

