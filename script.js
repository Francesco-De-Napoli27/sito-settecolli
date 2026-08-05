document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const menuItems = navMenu ? navMenu.querySelectorAll('li') : [];

  let isOpen = false;
  let isAnimating = false;

  function openMenu() {
    if (isAnimating || !navMenu || !hamburger) return;
    isAnimating = true;

    navMenu.classList.add('active');
    navMenu.style.maxHeight = navMenu.scrollHeight + 'px';
    hamburger.classList.add('active');

    menuItems.forEach((item, index) => {
      item.style.transitionDelay = `${index * 80}ms`;
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    });

   setTimeout(() => {
     navMenu.style.maxHeight = 'none';
     navMenu.style.overflow = 'visible';
     isOpen = true;
     isAnimating = false;
   }, 500);
  }

  function closeMenu() {
    if (isAnimating || !navMenu || !hamburger) return;
    isAnimating = true;

    navMenu.style.maxHeight = navMenu.scrollHeight + 'px';
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

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  document.addEventListener('click', function (e) {
    if (hamburger && navMenu) {
      if (!hamburger.contains(e.target) && !navMenu.contains(e.target) && isOpen) {
        closeMenu();
      }
    }
  });

  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  reveals.forEach(element => {
    observer.observe(element);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const extraMenuBtn = document.getElementById('extraMenuBtn');
  const extraMenuPanel = document.getElementById('extraMenuPanel');
  const galleryToggle = document.getElementById('galleryToggle');
  const gallerySubmenu = document.getElementById('gallerySubmenu');

  if (extraMenuBtn && extraMenuPanel) {
    extraMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      extraMenuPanel.classList.toggle('open');
      extraMenuBtn.classList.toggle('is-active');
    });
  }

  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('#extraMenuCloseBtn');
    if (closeBtn) {
      e.stopPropagation();
      if (extraMenuPanel) extraMenuPanel.classList.remove('open');
      if (extraMenuBtn) extraMenuBtn.classList.remove('is-active');
      return;
    }

    if (extraMenuPanel && extraMenuBtn) {
      if (!extraMenuPanel.contains(e.target) && !extraMenuBtn.contains(e.target)) {
        extraMenuPanel.classList.remove('open');
        extraMenuBtn.classList.remove('is-active');
      }
    }
  });

  if (galleryToggle && gallerySubmenu) {
    galleryToggle.addEventListener('click', (e) => {
      e.preventDefault();
      gallerySubmenu.classList.toggle('open');
    });
  }
});