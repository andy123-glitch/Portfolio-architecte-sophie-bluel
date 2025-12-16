import { URLworks, GETcategorys } from "/scripts/config.js";

// --- Gestion des données et de l'API (CRUD) ---

/**
 * Récupère la liste de tous les travaux (works) depuis l'API
 * @returns {Promise<Array>} Tableau des travaux ou undefined en cas d'erreur
 */
async function getworks() {
    return await fetch(URLworks)
        .then((works) => works.json())
        .catch((error) => {
            console.error("Erreur lors de la récupération des travaux :", error);
            // On retourne undefined ou un tableau vide pour ne pas bloquer le reste
            return undefined;
        });
}

/**
 * Récupère la liste de toutes les catégories depuis l'API
 * @returns {Promise<Array>} Tableau des catégories ou undefined en cas d'erreur
 */
async function getcategorys() {
    return await fetch(GETcategorys)
        .then((category) => category.json())
        .catch((error) => {
            console.error("Erreur lors de la récupération des catégories :", error);
            // On retourne undefined ou un tableau vide pour ne pas bloquer le reste
            return undefined;
        });
}

/**
 * Envoie un nouveau travail à l'API via une requête POST et met à jour allWorks
 * @param {FormData} formData - Données du formulaire contenant le travail à ajouter
 * @returns {Promise<void>}
 * @throws {Error} Si l'envoi échoue
 */
async function postWorks(formData) {
    // Le token d'authentification est récupéré du localStorage
    const token = window.localStorage.getItem("token");

    return await fetch(URLworks, {
        method: "POST",
        headers: {
            Authorization: "Bearer " + token, // Ajout du token Bearer
            // Pas de 'Content-Type': 'multipart/form-data' ici, car fetch le gère automatiquement avec FormData
        },
        body: formData, // Les données du formulaire
    })
        .then(async (result) => {
            if (result.ok) {
                // Rafraîchit la liste des travaux après l'ajout réussi
                allWorks = await getworks();
            } else {
                // Lance une erreur avec les détails du statut de la réponse
                throw new Error(
                    "Erreur lors de l'envoi des données : " + result.statusText + " (" + result.status + ")"
                );
            }
        })
        .catch((error) => {
            // Relance l'erreur pour qu'elle soit gérée par l'appelant (formAddWorks)
            throw error;
        });
}

/**
 * Supprime un travail via une requête DELETE et met à jour allWorks
 * @param {number} id - Identifiant du travail à supprimer
 * @returns {Promise<void>}
 * @throws {Error} Si la suppression échoue (la gestion d'erreur dans le .catch() actuel ne lance pas d'exception)
 */
async function delWorks(id) {
    const token = window.localStorage.getItem("token");

    return await fetch(URLworks + "/" + id, {
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + token, 
        },
    })
        .then(async (result) => {
            if (result.ok) {
                // Rafraîchit la liste des travaux après la suppression réussie
                allWorks = await getworks();
            }
        })
        .catch((error) => {
            // Log l'erreur mais ne la relance pas, ce qui est une gestion 'douce'
            console.error("Erreur lors de la suppression du travail :", error);
        });
}

// --- Initialisation des données globales ---

// Récupération initiale des travaux et catégories au chargement du module
let allWorks = await getworks();
const CATEGORYS = await getcategorys();

// --- Fonctions d'affichage et de l'interface utilisateur ---

/**
 * Affiche les travaux dans la galerie principale, avec filtrage optionnel par catégorie
 * @param {number} id - ID de la catégorie à filtrer (0 = tous les travaux)
 */
export function displayWorks(id = 0) {
    let works = allWorks;

    // Filtre les travaux selon la catégorie sélectionnée, si l'ID est différent de 0
    if (id != 0) works = works.filter((element) => element.categoryId == id);

    let figure = "";
    const lenghtLimitation = 36;
    // Génère le HTML pour chaque travail
    works.forEach((work) => {
        figure += `<figure>
        <img src="${work.imageUrl}" alt="${work.title}" categorie-name="${work.category.name}">
        <figcaption>${
            // Truncature du titre si trop long, avec ajout de "..."
            work.title.length > lenghtLimitation ? work.title.slice(0, lenghtLimitation) + "..." : work.title
        }</figcaption>
        </figure>`;
    });

    // Injecte le HTML dans la galerie principale
    document.querySelector(".gallery").innerHTML = figure;
}

/**
 * Vérifie si l'utilisateur est connecté en regardant le localStorage
 * @returns {boolean} True si l'utilisateur est connecté (token ou userId présent), false sinon
 */
export function userConnected() {
    return window.localStorage.getItem("userId") || window.localStorage.getItem("token") ? true : false;
}

/**
 * Crée et initialise les boutons de filtrage par catégorie
 */
export function filters() {
    const divFilters = document.querySelector(".filters");

    // Ajoute la catégorie "Tous" (ID: 0) au début du tableau des catégories
    let categorys = [{ id: 0, name: "Tous" }, ...CATEGORYS];

    // Crée un bouton pour chaque catégorie
    categorys.forEach((category) => {
        const btn = document.createElement("button");
        btn.id = category.id;
        btn.innerText = category.name;

        // Active par défaut le filtre "Tous"
        if (category.name === "Tous") btn.classList.add("active");

        // Gère le clic sur le bouton de filtre
        btn.addEventListener("click", async (e) => {
            // Récupère tous les boutons de filtre et leur enleve la class active
            const btns = document.querySelectorAll(".filters button");
            btns.forEach((btn) => {
                btn.classList.remove("active");
            });

            // Active le bouton cliqué
            e.target.classList.add("active");

            // Affiche les travaux filtrés en appelant displayWorks avec l'ID du bouton
            displayWorks(e.target.id);
        });

        divFilters.appendChild(btn);
    });
}

/**
 * Active le mode édition pour les utilisateurs connectés
 * 
 */
export function editionMode() {
    // Affiche le bandeau d'édition (par défaut masqué)
    const bandeau = document.querySelector(".editonMode");
    bandeau.style.setProperty("display", "flex");

    // Change le lien "login" en "logout" et gère la déconnexion
    const log = document.querySelector(".log");
    log.innerHTML = '<a href="#">logout</a>';
    log.addEventListener("click", () => {
        // Supprime les informations de connexion du localStorage (déconnexion)
        window.localStorage.removeItem("userId");
        window.localStorage.removeItem("token");
        // Recharge la page pour revenir au mode normal (sans les options d'édition)
        location.reload();
    });

    // Affiche le texte "modifier" à côté des éléments éditables
    const txtModifier = document.querySelector("span.edition");
    txtModifier.style.setProperty("display", "inline");
}

/**
 * Initialise les modales de suppression et d'ajout de travaux
 * Configure tous les événements et interactions des modales (ouverture, fermeture, navigation)
 */
export function initModal() {
    // Récupération des éléments DOM
    const open = document.querySelector("span.edition"); // Élément pour ouvrir la modale
    const backgrounds = document.querySelectorAll("dialog"); // Pour gerer le background
    const closes = document.querySelectorAll(".modal-close"); // Boutons de fermeture (X)
    const next = document.getElementById("modal-next"); // Bouton "Ajouter une photo"
    const back = document.querySelector(".modal-back"); // Flèche de retour dans la modale d'ajout
    const mdelete = document.getElementById("modal-delete"); // Modale de suppression
    const madd = document.getElementById("modal-add"); // Modale d'ajout

    // Initialise la galerie d'images et le formulaire d'ajout
    imgGalery();
    formAddWorks();

    // Ferme les modales en cliquant sur la zone de fond (backdrop)
    backgrounds.forEach((back) => {
        back.addEventListener("click", (e) => {
            // Vérifie si l'élément cliqué est bien la balise <dialog> elle-même (le fond)
            if (e.target.nodeName == "DIALOG") {
                mdelete.close();
                madd.close();
            }
        });
    });

    // Passe de la modale de suppression à celle d'ajout
    next.addEventListener("click", () => {
        mdelete.close();
        madd.showModal(); 
    });

    // Ferme les modales avec les boutons de fermeture (X)
    for (let close of closes) {
        close.addEventListener("click", () => {
            mdelete.close();
            madd.close();
        });
    }

    // Ouvre la modale de suppression et scrolle vers elle
    open.addEventListener("click", () => {
        mdelete.showModal();
        window.scrollTo({
            top: mdelete.offsetTop - 200,
            behavior: "smooth",
        });
    });

    // Retourne à la modale de suppression depuis celle d'ajout
    back.addEventListener("click", () => {
        madd.close();
        mdelete.showModal();
    });
}

/**
 * Génère et affiche la galerie d'images dans la modale de suppression
 * Chaque image est accompagnée d'un bouton de suppression
 */
function imgGalery() {
    let works = allWorks;
    const modalGalery = document.querySelector(".modal-galery");
    modalGalery.innerHTML = ""; // Vide la galerie précédente

    // Crée une carte (figure) pour chaque travail
    works.forEach((element) => {
        let article = document.createElement("figure");

        // Image du travail
        let imgWork = document.createElement("img");
        imgWork.src = element.imageUrl;
        imgWork.alt = element.title;
        imgWork.classList.add("modal-galery-img");

        // Bouton de suppression
        let btn = document.createElement("button");
        btn.id = element.id;
        btn.classList.add("btn-suppr");

        // Icône de la poubelle
        let imgDel = document.createElement("img");
        imgDel.src = "assets/icons/Poubele.svg";
        imgDel.alt = "Supprimer";

        // Assemblage des éléments
        btn.appendChild(imgDel);
        article.appendChild(imgWork);
        article.appendChild(btn);
        modalGalery.appendChild(article);

        // Gère la suppression au clic
        btn.addEventListener("click", async () => {
            await delWorks(btn.id);
            // Rafraîchit la galerie de la modale et l'affichage principal
            imgGalery();
            displayWorks();
        });
    });
}


/**
 * Configure le formulaire d'ajout de travaux dans la modale
 * Gère la validation, la prévisualisation d'image et l'envoi
 */
function formAddWorks() {
    // Récupération des éléments du formulaire
    const title = document.getElementById("title");
    const select = document.getElementById("category");
    const form = document.querySelector(".modal form");
    const image = document.querySelector(".file img"); // Élément <img> pour la prévisualisation
    const imgFile = document.getElementById("image"); // Champ <input type="file">

    // Valide le formulaire à chaque saisie dans le titre
    title.addEventListener("keyup", () => {
        validForm(title, select, imgFile.files);
    });

    // Remplit le select avec les catégories disponibles
    CATEGORYS.forEach((c) => {
        let option = document.createElement("option");
        option.innerText = c.name;
        option.value = c.id;
        select.appendChild(option);
    });

    // Valide le formulaire à chaque changement de catégorie
    select.addEventListener("change", () => {
        validForm(title, select, imgFile.files);
    });

    // Gère la soumission du formulaire
    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // Empêche le rechargement par défaut

        // Vérifie si le formulaire est valide avant de tenter l'envoi
        if (!validForm(title, select, imgFile.files)) {
            showError("Veuillez remplir tous les champs correctement.");
            return;
        }

        try {
            // Envoie les données
            const formData = new FormData(form);
            await postWorks(formData);

            // Rafraîchit l'affichage principal et la galerie de la modale
            displayWorks();
            imgGalery();

            // Réinitialise le formulaire et les états
            form.reset();
            tooglePrevImg(false); // Réaffiche le placeholder
            validForm(title, select, imgFile.files); // Désactive le bouton d'envoi

            
        } catch (error) {
            
            showError(error);
        }
    });

    // Gère la sélection d'une image
    imgFile.addEventListener("change", () => {
        // Le champ de fichier est un FileList, on prend le premier fichier
        const file = imgFile.files[0];

        if (validImag(file)) {
            // Crée une URL temporaire pour la prévisualisation de l'image
            image.src = URL.createObjectURL(file);
            image.onload = () => {
                // Libère la mémoire une fois l'image chargée
                URL.revokeObjectURL(image.src);
            };
            tooglePrevImg(true); // Affiche la prévisualisation
        } else {
            tooglePrevImg(false); // Affiche le placeholder si l'image n'est pas valide
            
        }
        validForm(title, select, imgFile.files);
    });
}

/**
 * Affiche ou masque la prévisualisation de l'image dans la modale d'ajout
 * @param {boolean} display - True pour afficher l'image, false pour afficher le placeholder
 */
function tooglePrevImg(display) {
    const div = document.querySelector(".file div"); // Bloc du bouton d'ajout
    const p = document.querySelector(".file p"); // Texte sur la taille/format
    const image = document.querySelector(".file img"); // L'image de prévisualisation

    if (display === true) {
        // Affiche l'image en plein format et masque les éléments du placeholder
        div.style.display = "none";
        p.style.display = "none";
        image.style.height = "95%";
        image.style.width = "auto";
    } else {
        // Affiche le placeholder par défaut et masque la prévisualisation grand format
        div.style.display = "flex";
        p.style.display = "block";
        // Rétablit les dimensions pour l'icône du placeholder
        image.style.height = "76px";
        image.style.width = "76px";
        // Assigne l'icône par défaut
        image.src = "assets/icons/preimg.svg";
    }
}

/**
 * Valide le format (PNG/JPEG) et la taille (< 4 Mo) d'un fichier image
 * @param {File} file - Fichier image à valider
 * @returns {boolean} True si l'image est valide, false sinon
 */
function validImag(file) {
    if (file !== undefined) {
        // Vérifie le type MIME (PNG ou JPEG uniquement)
        const isImage = file.type === "image/png" || file.type === "image/jpeg";
        // Vérifie la taille (< 4 Mo, soit 4000000 octets)
        const isSizeValid = file.size < 4000000;

        if (isImage && isSizeValid) {
            return true;
        }
    }
    return false;
}

/**
 * Valide l'ensemble du formulaire (titre non vide, catégorie sélectionnée, image valide)
 * et active/désactive le bouton de soumission
 * @param {HTMLInputElement} title - Champ titre
 * @param {HTMLSelectElement} select - Select de catégorie
 * @param {FileList} imgFile - FileList de l'input file de l'image
 * @returns {boolean} True si le formulaire est valide, false sinon
 */
function validForm(title, select, imgFile) {
    const btn = document.getElementById("btn-save-work");

    const isTitleValid = title.value.trim() !== ""; // Certifie que le titre ne sois pas vide
    const isCategorySelected = select.options.length > 0 && select.value !== ""; // Assure qu'une catégorie est choisie
    const isImageValid = imgFile.length > 0 && validImag(imgFile[0]); // Garantie que l'image est conforme

    if (isTitleValid && isCategorySelected && isImageValid ) {
        btn.disabled = false; // Active le bouton
        return true;
    }

    // Sinon désactive le bouton et retourne false
    btn.disabled = true;
    return false;
}

/**
 * Affiche un message d'erreur dans le conteneur spécifié (pour la modale d'ajout)
 * @param {Error|string} error - Erreur (ou message) à afficher
 */
function showError(error) {
    const divError = document.querySelector(".modal-add .error");
    // Utilise le message d'erreur si c'est un objet Error, sinon l'erreur elle-même (le string)
    divError.innerText = error.message ? error.message : String(error);
    divError.style.display = "block";

    // Masque le message après 5 secondes
    setTimeout(() => {
        divError.style.display = "none";
    }, 5000);
}
