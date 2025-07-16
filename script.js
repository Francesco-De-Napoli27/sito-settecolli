document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const menuItems = navMenu.querySelectorAll('li');

  let isOpen = false;
  let isAnimating = false;

  function openMenu() {
    if (isAnimating) return;
    isAnimating = true;

    navMenu.classList.add('active');

    // Forza layout e calcola altezza
    navMenu.style.maxHeight = navMenu.scrollHeight + 'px';
    hamburger.classList.add('active');

    menuItems.forEach((item, index) => {
      item.style.transitionDelay = `${index * 80}ms`;
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    });

   setTimeout(() => {
     navMenu.style.maxHeight = 'none'; // libera completamente lo spazio
     navMenu.style.overflow = 'visible'; // abilita scroll naturale se servisse
     isOpen = true;
     isAnimating = false;
   }, 500);
  }

  function closeMenu() {
    if (isAnimating) return;
    isAnimating = true;

    // Ripristina altezza attuale prima di ridurre
    navMenu.style.maxHeight = navMenu.scrollHeight + 'px';

    // Forza reflow per riapplicare la transizione ↓
    void navMenu.offsetHeight;

    navMenu.style.maxHeight = '0';
    hamburger.classList.remove('active');

    menuItems.forEach((item, index) => {
      item.style.transitionDelay = `${(menuItems.length - index) * 40}ms`;
      item.style.opacity = '0';
      item.style.transform = 'translateY(-10px)';
    });

    setTimeout(() => {
      navMenu.classList.remove('active');
      isOpen = false;
      isAnimating = false;
    }, 500);
  }

  hamburger.addEventListener('click', () => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  document.addEventListener('click', function (e) {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target) && isOpen) {
      closeMenu();
    }
  });
});
