import { URLworks, GETcategorys } from "/scripts/config.js";

/**
 * Récupère la liste de tous les travaux depuis l'API
 * @returns {Promise<Array>} Tableau des travaux ou undefined en cas d'erreur
 */
async function getworks() {
    return await fetch(URLworks)
        .then((works) => works.json())
        .catch((error) => console.error(error));
}

/**
 * Récupère la liste de toutes les catégories depuis l'API
 * @returns {Promise<Array>} Tableau des catégories ou undefined en cas d'erreur
 */
async function getcategorys() {
    return await fetch(GETcategorys)
        .then((category) => category.json())
        .catch((error) => console.error(error));
}

/**
 * Envoie un nouveau travail à l'API via une requête POST et met a jour c_works
 * @param {FormData} formData - Données du formulaire contenant le travail à ajouter
 * @returns {Promise<void>}
 * @throws {Error} Si l'envoi échoue
 */
async function postWorks(formData) {
    return await fetch(URLworks, {
        method: "POST",
        headers: {
            Authorization: "Bearer " + window.localStorage.getItem("token"),
        },
        body: formData,
    })
        .then(async (result) => {
            if (result.ok) {
                // Rafraîchit la liste des travaux après l'ajout
                c_works = await getworks();
            } else {
                throw new Error("envoi des données : " + result.statusText + "(" + result.status + ")", "");
            }
        })
        .catch((error) => {
            throw error;
        });
}

/**
 * Supprime un travail via une requête DELETE et met a jour c_works
 * @param {number} id - Identifiant du travail à supprimer
 * @returns {Promise<void>}
 * @throws {Error} Si la suppression échoue
 */
async function delWorks(id) {
    return await fetch(URLworks + "/" + id, {
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + window.localStorage.getItem("token"),
        },
    })
        .then(async (result) => {
            if (result.ok) {
                // Rafraîchit la liste des travaux après l'ajout
                c_works = await getworks();
            }
        })
        .catch((error) => {
            console.log(error);
        });
}

// Initialisation : récupère les travaux et catégories au chargement du module
let c_works = await getworks();
const CATEGORYS = await getcategorys();

/**
 * Affiche les travaux dans la galerie, avec filtrage optionnel par catégorie
 * @param {number} id - ID de la catégorie à filtrer (0 = tous les travaux)
 */
export function displayWorks(id = 0) {
    let works = c_works;

    // Filtre les travaux selon la catégorie sélectionnée
    if (id != 0) works = works.filter((element) => element.categoryId == id);

    let figure = "";

    // Génère le HTML pour chaque travail
    works.forEach((work) => {
        figure += `<figure>
        <img src="${work.imageUrl}" alt="${work.title}" categorie-name="${work.category.name}">
        <figcaption>${work.title}</figcaption>
        </figure>`;
    });

    // Injecte le HTML dans la galerie
    document.querySelector(".gallery").innerHTML = figure;
}

/**
 * Vérifie si l'utilisateur est connecté
 * @returns {boolean} True si l'utilisateur est connecté, false sinon
 */
export function userConnected() {
    return window.localStorage.getItem("userId") || window.localStorage.getItem("token") ? true : false;
}

/**
 * Crée et initialise les boutons de filtrage par catégorie
 */
export function filters() {
    const divFilters = document.querySelector(".filters");

    // Ajoute la catégorie "Tous" au début du tableau
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
            // Récupère tous les boutons de filtre
            const btns = document.querySelectorAll(".filters button");

            // Désactive tous les boutons
            btns.forEach((btn) => {
                btn.classList.remove("active");
            });

            // Active le bouton cliqué
            e.target.classList.add("active");

            // Affiche les travaux filtrés
            displayWorks(e.target.id);
        });

        divFilters.appendChild(btn);
    });
}

/**
 * Active le mode édition pour les utilisateurs connectés
 * Affiche le bandeau, change "login" en "logout", et affiche les options de modification
 */
export function editionMode() {
    // Affiche le bandeau d'édition
    const bandeau = document.querySelector(".editonMode");
    bandeau.style.setProperty("display", "flex");

    // Change le lien "login" en "logout" et gère la déconnexion
    const log = document.querySelector(".log");
    log.innerHTML = '<a href="#">logout</a>';
    log.addEventListener("click", () => {
        // Supprime les informations de connexion du localStorage
        window.localStorage.removeItem("userId");
        window.localStorage.removeItem("token");
        // Recharge la page pour revenir au mode normal
        location.reload();
    });

    // Affiche le texte "modifier"
    const txtModifier = document.querySelector("span.edition");
    txtModifier.style.setProperty("display", "inline");
}

/**
 * Initialise les modales de suppression et d'ajout de travaux
 * Configure tous les événements et interactions des modales
 */
export function initModal() {
    // Récupération des éléments DOM
    const open = document.querySelector("span.edition");
    const backgrounds = document.querySelectorAll("dialog");
    const closes = document.querySelectorAll(".modal-close");
    const next = document.getElementById("modal-next");
    const back = document.querySelector(".modal-back");
    const mdelete = document.getElementById("modal-delete");
    const madd = document.getElementById("modal-add");

    // Initialise la galerie d'images et le formulaire d'ajout
    imgGalery();
    formAddWorks();

    // Ferme les modales en cliquant sur le fond
    backgrounds.forEach((back) => {
        back.addEventListener("click", (e) => {
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

    // Ferme les modales avec les boutons de fermeture
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
 * Chaque image possède un bouton de suppression
 */
function imgGalery() {
    let works = c_works;
    const modalGalery = document.querySelector(".modal-galery");
    modalGalery.innerHTML = "";

    // Crée une carte pour chaque travail
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
            // Rafraîchit la galerie et l'affichage principal
            imgGalery();
            displayWorks();
        });
    });
}

// Flag pour gérer la réinitialisation du formulaire
let reset = false;

/**
 * Configure le formulaire d'ajout de travaux
 * Gère la validation, la prévisualisation d'image et l'envoi
 */
function formAddWorks() {
    // Récupération des éléments du formulaire
    const title = document.getElementById("title");
    const select = document.getElementById("category");
    const form = document.querySelector(".modal form");
    const image = document.querySelector(".file img");
    const imgFile = document.getElementById("image");


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
        e.preventDefault();
        try {
            // Envoie les données
            const formData = new FormData(form);
            await postWorks(formData);

            // Rafraîchit l'affichage
            displayWorks();
            imgGalery();

            // Réinitialise le formulaire
            tooglePrevImg(false);
            reset = true;
            title.value = "";
            validForm(title, select, imgFile);
        } catch (error) {
            showError(error, ".modal-add .error");
        }
    });

    // Gère la sélection d'une image
    imgFile.addEventListener("change", () => {
        if (validImag(imgFile.files[0])) {
            // Crée une prévisualisation de l'image
            image.src = URL.createObjectURL(imgFile.files[0]);
            image.onload = () => {
                // Libère la mémoire une fois l'image chargée
                URL.revokeObjectURL(image.src);
            };
            tooglePrevImg(true);
            reset = false;
        } else {
            tooglePrevImg(false);
        }
        validForm(title, select, imgFile.files);
    });
}

/**
 * Affiche ou masque la prévisualisation de l'image
 * @param {boolean} display - True pour afficher l'image, false pour afficher le placeholder
 */
function tooglePrevImg(display) {
    const div = document.querySelector(".file div");
    const p = document.querySelector(".file p");
    const image = document.querySelector(".file img");

    switch (display) {
        case true:
            // Affiche l'image en plein format
            div.style.display = "none";
            p.style.display = "none";
            image.style.height = "100%";
            image.style.width = "auto";
            break;
        case false:
            // Affiche le placeholder
            div.style.display = "flex";
            p.style.display = "block";
            image.style.height = "76px";
            image.style.width = "76px";
            image.src = "assets/icons/preimg.svg";
            break;
        default:
            break;
    }
}

/**
 * Valide le format et la taille d'une image
 * @param {File} file - Fichier image à valider
 * @returns {boolean} True si l'image est valide, false sinon
 */
function validImag(file) {
    console.log(file);
    if (file !== undefined) {
        // Vérifie le type MIME (PNG ou JPEG uniquement)
        if (file.type === "image/png" || file.type === "image/jpeg") {
            // Vérifie la taille (< 4 Mo)
            if (file.size < 4000000) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Valide l'ensemble du formulaire et active/désactive le bouton de soumission
 * @param {HTMLInputElement} title - Champ titre
 * @param {HTMLSelectElement} select - Select de catégorie
 * @param {HTMLInputElement} imgFile - Input file de l'image
 * @returns {boolean} True si le formulaire est valide, false sinon
 */
function validForm(title, select, imgFile) {
    const btn = document.getElementById("btn-save-work");

    // Vérifie que tous les champs sont remplis et valides
    if (title.value !== "" && select.options.length != 0 && validImag(imgFile[0]) && reset === false) {
        btn.disabled = false;
        return true;
    }
    //Sinon desactive les boutons et retourne false
    btn.disabled = true;
    return false;
}

/**
 * Affiche un message d'erreur dans le formulaire
 * @param {Error} error - Erreur à afficher
 */
function showError(error) {
    const divError = document.querySelector(".modal-add .error");
    divError.style.display = "block";
    divError.innerText = error;
    setTimeout(() => {
        divError.style.display = "none";
    }, 5000);
}
