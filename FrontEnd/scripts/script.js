import { GETworks, GETcategory, POSTlogin } from "/scripts/config.js";

export async function displayWorks() {
    //Get works by API
    const works = await fetch(GETworks).then((works) => works.json());
    dispaly(works);
}

function dispaly(array) {
    let figure = "";
    // Loop in works for add html node in figure to add inner div.gallery
    array.forEach((element) => {
        figure += `<figure>
        <img src="${element.imageUrl}" alt="${element.title}" categorie-name="${element.category.name}">
        <figcaption>${element.title}</figcaption>
        </figure>`;
    });
    document.querySelector(".gallery").innerHTML = figure;
}

export function login() {
    //recupere le formulair
    const form = document.querySelector("form");
    form.addEventListener("submit", async (event) => {
        //desactive le recharhement de la page
        event.preventDefault();

        //Recupere les valeurs des champs
        const email = document.getElementById("email");
        const password = document.getElementById("password");

        //Construis le body et envoie la requete
        const body = {
            email: email.value,
            password: password.value,
        };
        let connection = await fetch(POSTlogin, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        //Si le code de status n'est pas 200, l'email ou le mot de passe est incorrect
        if (connection.status !== 200) {
            //Fais apparaitre un message d'erreur
            const error = document.querySelector(".error");
            console.log(connection.body);
            error.style.display = "block";
        } else {
            //Récupere les donnée au format json
            let result = await connection.json();
            //Si on ne trouve pas de données de connexion dans le local storage, on les initialise
            if (userConnected() === null) {
                window.localStorage.setItem("userId", result.userId);
                window.localStorage.setItem("token", result.token);
            }
            //redirige sur la page principale
            window.location.href = "http://127.0.0.1:5500/index.html";
            //passe en mode edition
            window.localStorage.setItem("edition", "1");
        }
    });
}

//fonction pour savoir si l'utilidsateur est deja connécté
export function userConnected() {
    return window.localStorage.getItem("userId") || window.localStorage.getItem("token");
}

export async function filters() {
    const divFilters = document.querySelector(".filters");
    const category = await fetch(GETcategory).then((category) => category.json());
    divFilters.innerHTML += `<button id="0" class="active">Tous</button>`;
    category.forEach((c) => {
        let btn = `<button id="${c.id}">${c.name}</button>`;
        divFilters.innerHTML += btn;
    });

    const filterBtn = document.querySelectorAll(".filters");

    filterBtn.forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const filterBtns = document.querySelectorAll(".filters button");
            filterBtns.forEach((btn) => {
                btn.classList.remove("active");
            });
            e.target.classList.add("active");

            const id = e.target.id;
            console.log(id);

            const works = await fetch(GETworks).then((works) => works.json());
            if (id != 0) {
                const filteredBtn = works.filter((element) => element.categoryId == id);
                dispaly(filteredBtn);
            } else dispaly(works);
        });
    });
}

export function editionMode() {
    //affiche le bandeau
    const bandeau = document.querySelector(".editonMode");
    bandeau.style.display = "flex";

    //Change le login en logout et ajoute la fonctionnalité de deconnection
    const log = document.querySelector(".log");
    log.innerHTML = '<a href="">log out</a>';
    log.addEventListener("click", (e) => {
        window.localStorage.removeItem("userId");
        window.localStorage.removeItem("token");
    });

    //Affiche le texte modifier
    const txtModifier = document.querySelector("span.edition");
    txtModifier.style.setProperty("display", "inline");
    // txtModifier.addEventListener("click", (e) => {
    //     alert(txtModifier)
    // })
}

export function dispalyModal() {
    const btn = document.querySelector("span.edition");
    const modalBack = document.querySelector(".modal-backgroud");
    const modalClose = document.getElementById("modal-close");
    const Back = document.getElementById("modal-back");

    modalClose.addEventListener("click", () => {
        modal("close")

    });
    modalBack.addEventListener("click", () => {
        modal("close")
    });
    btn.addEventListener("click", () => {
        modal("open");
    });
    Back.addEventListener("click", () => {
        modal("back");
    });

}

function modal(action) {
    const backgroud = document.querySelector(".modal-backgroud");
    const  delete = document.querySelector(".modal-delete");
    const modaladd = document.querySelector(".modal-add");

    switch (action) {
        case "open":
             delete.style.setProperty("display", "flex");
            modalBack.style.setProperty("display", "block");
            break;
        case "add":
            modaladd.style.setProperty("display", "flex");
             delete.style.setProperty("display", "none");
            break;
        case "close":
        default:
             delete.style.setProperty("display", "none");
            modalBack.style.setProperty("display", "none");
            modaladd.style.setProperty("display", "none");
            break;
    }
}
