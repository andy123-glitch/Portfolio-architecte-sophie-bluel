import { POSTlogin } from "./config.js";
import { userConnected } from "./script.js";

if (userConnected()) {
    location.href="index.html"
}
//recupere le formulaire
const form = document.querySelector(".login form");
form.addEventListener("submit", async (event) => {
    //desactive le recharhement de la page
    event.preventDefault();

    //Recupere les valeurs des champs
    const email = document.getElementById("email");
    const password = document.getElementById("password");

    if (email.value === "" || password.value=="") {
        showError("Email ou Mot de passe non rempli");
        return;
    }
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
        showError()
    } else {
        //Récupere les donnée au format json
        let result = await connection.json();
        //Si on ne trouve pas de données de connexion dans le local storage, on les initialise
        if (!userConnected()) {
            window.localStorage.setItem("userId", result.userId);
            window.localStorage.setItem("token", result.token);
        }
        //redirige sur la page principale
        window.location.href = "index.html";
    }
});

function showError(errorTxt = "Erreur dans l’identifiant ou le mot de passe", time = 5000) {
    const error = document.querySelector(".error");
    error.style.display = "block";
    error.innerText = errorTxt;
    setTimeout(() => {
        error.style.display = "none";
    }, time);
}
