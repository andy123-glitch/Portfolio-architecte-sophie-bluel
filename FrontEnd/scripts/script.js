import { GETworks, GETcategory, POSTlogin } from "/scripts/config.js";

export async function displayWorks() {
    //Get works by API
    const works = await fetch(GETworks).then((works) => works.json());
    let figure = "";
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

        }else{
            //Récupere les donnée au format json 
            let result = await connection.json();
            //Si on ne trouve pas de données de connexion dans le local storage, on les initialise
            if(userConnected() === null){
                window.localStorage.setItem("userId", result.userId);
                window.localStorage.setItem("token", result.token);
            }
            //redirige sur la page principale
            window.location.href = "http://127.0.0.1:5500/index.html";
        }
    });
}

//fonction pour savoir si l'utilidsateur est deja connécté
function userConnected() {
    return window.localStorage.getItem("userId") || window.localStorage.getItem("token");
}

export async function filters() {
    const divFilters = document.querySelector(".filters");
    const category = await fetch(GETcategory).then((category) => category.json());
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
