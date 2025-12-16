import { POSTlogin } from "./config.js";
import { userConnected } from "./script.js"; // Importe la fonction pour vérifier l'état de connexion.

// Vérifie si l'utilisateur est déjà connecté.
if (userConnected()) {
    location.href = "index.html";
}


const form = document.querySelector(".login form");

form.addEventListener("submit", async (event) => {
    // Désactive le comportement par défaut de soumission du formulaire (qui recharge la page).
    event.preventDefault();

    // Récupère les éléments des champs email et mot de passe.
    const email = document.getElementById("email");
    const password = document.getElementById("password");

    // Vérification basique des champs non remplis.
    if (email.value === "" || password.value == "") {
        showError("Email ou Mot de passe non rempli");
        return; 
    }

    // Construit l'objet `body` au format JSON attendu par l'API.
    const body = {
        email: email.value,
        password: password.value,
    };

    // Envoi de la requête POST pour l'authentification.
    let connection = await fetch(POSTlogin, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body), // Convertit l'objet JavaScript en chaîne JSON.
    });

    // Si le code de statut n'est PAS 200 (ex: 401 Unauthorized, 404 Not Found, etc.),
    if (connection.status !== 200) {
        // Affiche un message d'erreur.
        showError();
    } else {
        // Le statut est 200 OK. Récupère le corps de la réponse au format JSON.
        let result = await connection.json();

        // Sécurise le cas où l'utilisateur se déconnecte sans recharger la page.
        if (!userConnected()) {
            window.localStorage.setItem("userId", result.userId);
            window.localStorage.setItem("token", result.token);
        }

        // Redirige l'utilisateur vers la page principale après connexion réussie.
        window.location.href = "index.html";
    }
});

/**
 * Affiche un message d'erreur temporaire dans l'élément `.error`.
 * @param {string} [errorTxt="Erreur dans l’identifiant ou le mot de passe"] - Texte de l'erreur.
 * @param {number} [time=5000] - Durée d'affichage de l'erreur en millisecondes.
 */
function showError(errorTxt = "Erreur dans l’identifiant ou le mot de passe", time = 5000) {
    const error = document.querySelector(".error");
    if (!error) return; // Sécurité au cas où l'élément .error n'existe pas.

    error.style.display = "block";
    error.innerText = errorTxt;

    // Masque le message d'erreur après le temps spécifié.
    setTimeout(() => {
        error.style.display = "none";
    }, time);
}
