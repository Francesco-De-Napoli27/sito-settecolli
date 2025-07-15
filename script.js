document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const menuItems = navMenu.querySelectorAll('li');

  let isOpen = false;

  function openMenu() {
    navMenu.classList.add('active');
    navMenu.style.maxHeight = navMenu.scrollHeight + 'px';

    menuItems.forEach((item, index) => {
      item.style.transitionDelay = `${index * 80}ms`;
    });

    isOpen = true;
  }

  function closeMenu() {
    menuItems.forEach((item) => {
      item.style.transitionDelay = `0ms`;
    });

    navMenu.style.maxHeight = '0px';
    navMenu.classList.remove('active');
    isOpen = false;
    hamburger.classList.remove('active');
  }

  hamburger.addEventListener('click', () => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }

     // Attiva/disattiva animazione hamburger → X
     hamburger.classList.toggle('active');
  });

  // Chiudi cliccando fuori dal menù
  document.addEventListener('click', function (e) {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target) && isOpen) {
      closeMenu();
    }
  });
});
