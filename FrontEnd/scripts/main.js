import { initModal, displayWorks, filters, editionMode, userConnected } from "/scripts/script.js";
displayWorks();
initModal();
if (!userConnected()) filters();
else editionMode();
