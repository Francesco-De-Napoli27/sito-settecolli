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
    hamburger.classList.add('active');
    navMenu.style.maxHeight = navMenu.scrollHeight + 'px';

    menuItems.forEach((item, index) => {
      item.style.transitionDelay = `${index * 80}ms`;
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      isOpen = true;
      isAnimating = false;
    }, menuItems.length * 80 + 200);
  }

  function closeMenu() {
    if (isAnimating) return;
    isAnimating = true;

    menuItems.forEach((item, index) => {
      item.style.transitionDelay = `${(menuItems.length - index) * 40}ms`;
      item.style.opacity = '0';
      item.style.transform = 'translateY(-10px)';
    });

    setTimeout(() => {
      navMenu.classList.remove('active');
      navMenu.style.maxHeight = null;
      hamburger.classList.remove('active');
      isOpen = false;
      isAnimating = false;
    }, menuItems.length * 40 + 300);
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
