document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.querySelector('.nav-menu');
  let isOpen = false;

  hamburger.addEventListener('click', () => {
    isOpen = !isOpen;

    if (isOpen) {
      navMenu.classList.add('active');
      const scrollHeight = navMenu.scrollHeight;
      navMenu.style.maxHeight = scrollHeight + 'px';

      // Aggiungi delay progressivo
      const items = navMenu.querySelectorAll('li');
      items.forEach((item, index) => {
        item.style.transitionDelay = `${index * 100}ms`;
      });

    } else {
      // Chiusura progressiva inversa
      const items = navMenu.querySelectorAll('li');
      items.forEach((item, index) => {
        item.style.transitionDelay = `${(items.length - index) * 50}ms`;
        item.style.opacity = '0';
        item.style.transform = 'translateY(-10px)';
      });

      // Dopo la durata della transizione, chiudi il menu
      setTimeout(() => {
        navMenu.classList.remove('active');
        navMenu.style.maxHeight = null;
      }, items.length * 50 + 200);
    }
  });

  // Chiudi cliccando fuori
  document.addEventListener('click', function (e) {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
      isOpen = false;
      const items = navMenu.querySelectorAll('li');
      items.forEach((item, index) => {
        item.style.transitionDelay = `${(items.length - index) * 50}ms`;
        item.style.opacity = '0';
        item.style.transform = 'translateY(-10px)';
      });

      setTimeout(() => {
        navMenu.classList.remove('active');
        navMenu.style.maxHeight = null;
      }, items.length * 50 + 200);
    }
  });
});

