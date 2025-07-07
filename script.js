const form = document.querySelector("form");
if (form) {
    form.addEventListener("submit", function(event) {
    event.preventDefault(); // Previene l'invio del modulo per testare
    alert("Il tuo messaggio è stato inviato!");
    });
}

// Funzione per calcolare la data di due giorni dopo la partita
function calcolaDataPartita() {
    const oggi = new Date();
    const dueGiorniDopo = new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate() + 2);

    // Modifica le date delle partite maschile e femminile
    const dataMaschile = document.querySelector('.data-partita.maschile');
    const dataFemminile = document.querySelector('.data-partita.femminile');

    dataMaschile.textContent = 'Data: ' + formatDate(dueGiorniDopo);
    dataFemminile.textContent = 'Data: ' + formatDate(dueGiorniDopo);
}

// Funzione di supporto per formattare la data
function formatDate(date) {
    const giorno = date.getDate().toString().padStart(2, '0');
    const mese = (date.getMonth() + 1).toString().padStart(2, '0');
    const anno = date.getFullYear();
    return `${giorno}/${mese}/${anno}`;
}

// Esegui la funzione per aggiornare la data quando la pagina viene caricata
window.onload = function() {
    calcolaDataPartita();
};


// Aggiungi la classe 'active' al link selezionato
document.querySelectorAll('nav ul li a').forEach(function(link) {
    link.addEventListener('click', function() {
        // Rimuovi la classe 'active' da tutti i link
        document.querySelectorAll('nav ul li a').forEach(function(link) {
            link.classList.remove('active');
        });

        // Aggiungi la classe 'active' al link selezionato
        this.classList.add('active');
    });
});


// Evidenzia il link attivo in base all'URL corrente
window.addEventListener('DOMContentLoaded', function () {
    let path = window.location.pathname.split("/").pop(); // es. "shop.html"
    if (path === "") path = "index.html"; // gestisce la root senza nome file

    const navLinks = document.querySelectorAll("nav ul li a");

    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href === path) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
});


// MENU HAMBURGER
document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.getElementById("menu-toggle");
    const navbar = document.getElementById("navbar").querySelector("ul");

    menuToggle.addEventListener("click", function () {
        navbar.classList.toggle("show");
    });
});
