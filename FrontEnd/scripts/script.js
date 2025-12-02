import { URLworks, GETcategorys } from "/scripts/config.js";

async function getworks() {
    return await fetch(URLworks)
        .then((works) => works.json())
        .catch((error) => console.error(error));
}

async function getcategorys() {
    return await fetch(GETcategorys)
        .then((category) => category.json())
        .catch((error) => console.error(error));
}

async function postWorks(formData) {
    return await fetch(URLworks, {
        method: "POST",
        headers: {
            Authorization: "Bearer " + window.localStorage.getItem("token"),
        },
        body: formData,
    })
        .then((response) => console.error("Form submission :", response.statusText))
        .catch((error) => console.error("Error submitting form:", error));
}

async function delWorks(id) {
    return await fetch(URLworks + "/" + id, {
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + window.localStorage.getItem("token"),
        },
    })
        .then(async () => (WORKS = await getworks()))
        .catch((error) => console.error(error));
}

let WORKS = await getworks();
const CATEGORYS = await getcategorys();

export async function displayWorks(id = 0) {
    let works = WORKS;
    //Récupere les travaux en base données
    if (id != 0) works = works.filter((element) => element.categoryId == id);

    let figure = "";
    //Boucle sur les travaux pour les ajouter a la page d'acceuil
    works.forEach((work) => {
        figure += `<figure>
        <img src="${work.imageUrl}" alt="${work.title}" categorie-name="${work.category.name}">
        <figcaption>${work.title}</figcaption>
        </figure>`;
    });
    document.querySelector(".gallery").innerHTML = figure;
}

//fonction pour savoir si l'utilisateur est connécté
export function userConnected() {
    return window.localStorage.getItem("userId") || window.localStorage.getItem("token") ? true : false;
}

export async function filters() {
    const divFilters = document.querySelector(".filters");

    //Récupere les catégories
    //Ajoute le filtre "Tous"
    let categorys = [{ id: 0, name: "Tous" }, ...CATEGORYS];
    //Pour chaque categories, ajoutes un bouton correspondant
    categorys.forEach((category) => {
        const btn = document.createElement("button");
        btn.id = category.id;
        btn.innerText = category.name;

        btn.addEventListener("click", async (e) => {
            //Récupere les boutons
            const btns = document.querySelectorAll(".filters button");
            //Pour chaque bouton, j'enleve la class active et je l'ajoute au bouton selectionné
            btns.forEach((btn) => {
                btn.classList.remove("active");
            });
            e.target.classList.add("active");

            //Affiche les travaux avec l'id de la categorie pour afficher ce qui corresponde
            displayWorks(e.target.id);
        });
        divFilters.appendChild(btn);
    });
}

export function editionMode() {
    //Affiche le bandeau
    const bandeau = document.querySelector(".editonMode");
    bandeau.style.setProperty("display", "flex");

    //Change le login en logout et ajoute la fonctionnalité de deconnection
    const log = document.querySelector(".log");
    log.innerHTML = '<a href="#">log out</a>';
    log.addEventListener("click", () => {
        window.localStorage.removeItem("userId");
        window.localStorage.removeItem("token");
        location.reload();
    });

    //Affiche le texte modifier
    const txtModifier = document.querySelector("span.edition");
    txtModifier.style.setProperty("display", "inline");
}

export function initModal() {
    //Initiaalisation des variables pour la modal
    const open = document.querySelector("span.edition");
    const background = document.querySelector(".modal-background");
    const closes = document.querySelectorAll(".modal-close");
    const next = document.getElementById("modal-next");
    const back = document.querySelector(".modal-back");
    imgGalery();

    formAddWorks();
    //Ajoute les evenements sur les boutons et le background
    next.addEventListener("click", () => {
        modal("next");
    });
    for (let close of closes) {
        close.addEventListener("click", () => {
            modal("close");
        });
    }
    background.addEventListener("click", () => {
        modal("close");
    });
    open.addEventListener("click", () => {
        modal("open");
        //Affiche les photo a supprimer
    });
    back.addEventListener("click", () => {
        modal("return");
        //Affiche les photo a supprimer
    });
}

function modal(action) {
    //initialisation des varibles des modals et du background
    const background = document.querySelector(".modal-background");
    const mdelete = document.querySelector(".modal-delete");
    const madd = document.querySelector(".modal-add");

    // determine ce que l'on veut faire en fonction de l'action passée
    switch (action) {
        case "open":
            mdelete.style.setProperty("display", "flex");
            background.style.setProperty("display", "block");
            break;
        case "next":
            madd.style.setProperty("display", "flex");
            mdelete.style.setProperty("display", "none");
            break;
        case "return":
            madd.style.setProperty("display", "none");
            mdelete.style.setProperty("display", "flex");
            break;
        case "close":
        default:
            mdelete.style.setProperty("display", "none");
            background.style.setProperty("display", "none");
            madd.style.setProperty("display", "none");
            break;
    }
}

function imgGalery() {
    //Récupere les travaux pour les afficher
    let works = WORKS;

    const modalGalery = document.querySelector(".modal-galery");
    modalGalery.innerHTML = "";

    //affiche les images avec un bouton pour supprimer
    works.forEach((element) => {
        let article = document.createElement("article");
        let imgWork = document.createElement("img");
        imgWork.src = element.imageUrl;
        imgWork.alt = element.title;
        imgWork.classList.add("modal-galery-img");

        let btn = document.createElement("button");
        btn.id = element.id;
        btn.classList.add("btn-suppr");

        let imgDel = document.createElement("img");
        imgDel.src = "assets/icons/Poubele.svg";
        imgDel.alt = "Supprimer";

        btn.appendChild(imgDel);
        article.appendChild(imgWork);
        article.appendChild(btn);
        modalGalery.appendChild(article);

        btn.addEventListener("click", async () => {
            await delWorks(btn.id);
            imgGalery();
            displayWorks();
        });
    });
}

function formAddWorks() {
    const title = document.getElementById("title");
    const select = document.getElementById("category");

    const form = document.querySelector(".modal-add form");

    title.addEventListener("keyup", () => {
        validForm(title, select, preimage);
    });

    CATEGORYS.forEach((c) => {
        let option = document.createElement("option");
        option.innerText = c.name;
        option.value = c.id;
        select.appendChild(option);
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        postWorks(formData);
        location.reload();
    });

    const image = document.querySelector(".file img");
    const preimage = document.getElementById("image");
    preimage.addEventListener("change", () => {
        if (preimage.files[0] !== undefined) {
            image.src = URL.createObjectURL(preimage.files[0]);
            image.onload = () => {
                URL.revokeObjectURL(image.src);
            };
            const div = document.querySelector(".file div"),
                p = document.querySelector(".file p ");
            div.style.display = "none";
            p.style.display = "none";
            image.style.height = "100%";
            image.style.width = "auto";
        }
    });
}

function validForm(title, select, preimage) {
    const btn = document.getElementById("btn-save-work");
    if (title.value !== "" && select.options.length != 0 && preimage.files.length === 1) {
        btn.disabled = false;
    } else btn.disabled = true;
}
