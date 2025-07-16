document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const menuItems = navMenu.querySelectorAll('li');

  let isOpen = false;

  function openMenu() {
    navMenu.classList.add('active');
    hamburger.classList.add('active');

    menuItems.forEach((item, index) => {
      item.style.transitionDelay = `${index * 80}ms`;
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    });

    isOpen = true;
  }

  function closeMenu() {
    menuItems.forEach((item, index) => {
      item.style.transitionDelay = `${(menuItems.length - index) * 40}ms`;
      item.style.opacity = '0';
      item.style.transform = 'translateY(-10px)';
    });

    setTimeout(() => {
      navMenu.classList.remove('active');
      hamburger.classList.remove('active');
    }, menuItems.length * 40 + 300);

    isOpen = false;
  }

  hamburger.addEventListener('click', () => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target) && isOpen) {
      closeMenu();
    }
  });
});

