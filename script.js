document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  hamburger.addEventListener('click', function (e) {
    e.stopPropagation(); // evita che il click venga intercettato da altri handler
    navMenu.classList.toggle('active');
  });

  // Chiudi il menu se clicchi fuori
  document.addEventListener('click', function (e) {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove('active');
    }
  });
});
