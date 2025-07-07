
document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.getElementById("menu-toggle");
    const nav = document.querySelector("nav ul");

    toggle.addEventListener("click", () => {
        nav.classList.toggle("active");
    });

    // Chiudi menu al clic su un link
    const links = document.querySelectorAll("nav ul li a");
    links.forEach(link => {
        link.addEventListener("click", () => {
            nav.classList.remove("active");
        });
    });
});
