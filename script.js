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

document.addEventListener('DOMContentLoaded', function() {
    // Prende tutti i link dentro il menu laterale
    var menuLinks = document.querySelectorAll('.extra-menu-list a');
    
    menuLinks.forEach(function(link) {
        // Cerca se subito dopo il link c'è una lista (ul)
        var submenu = link.nextElementSibling;
        
        if (submenu && submenu.tagName.toLowerCase() === 'ul') {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Controlla se la tendina è chiusa
                var currentDisplay = window.getComputedStyle(submenu).display;
                
                if (currentDisplay === 'none') {
                    // La apre con la forza e colora la voce di rosso
                    submenu.style.setProperty('display', 'block', 'important');
                    link.style.color = '#ff2800';
                } else {
                    // La richiude e toglie il colore
                    submenu.style.setProperty('display', 'none', 'important');
                    link.style.color = '';
                }
            });
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const navbarContainer = document.getElementById("navbar-container");
    
    if (navbarContainer) {
        fetch('navbar.html')
            .then(response => {
                if (!response.ok) throw new Error("Errore nel caricamento della navbar");
                return response.text();
            })
            .then(data => {
                navbarContainer.innerHTML = data;

                // 1. Riattiva lo script dello scroll della navbar desktop
                const body = document.body;
                function checkScroll() {
                    if (window.innerWidth > 992) {
                        if (window.scrollY === 0) {
                            body.classList.add("top-page");
                        } else {
                            body.classList.remove("top-page");
                        }
                    } else {
                        body.classList.remove("top-page");
                    }
                }
                checkScroll();
                window.addEventListener("scroll", checkScroll);
                window.addEventListener("resize", checkScroll);

                // 2. ATTIVAZIONE CORRETTA DEL MENU HAMBURGER (Extra Menu Panel)
                const extraMenuBtn = document.getElementById('extraMenuBtn');
                const extraMenuPanel = document.getElementById('extraMenuPanel');
                
                if (extraMenuBtn && extraMenuPanel) {
                    extraMenuBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        extraMenuPanel.classList.toggle('open');
                        extraMenuBtn.classList.toggle('is-active');
                    });
                }

                // Chiusura cliccando fuori o sul pulsante di chiusura
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

                // 3. Riattiva i sottomenu mobile all'interno del pannello
                const mobileToggles = document.querySelectorAll('.mobile-dropdown-toggle');
                mobileToggles.forEach(toggle => {
                    toggle.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation(); 
                        const submenu = this.nextElementSibling;
                        if (submenu && submenu.classList.contains('mobile-submenu')) {
                            submenu.classList.toggle('open');
                        }
                    });
                });
            })
            .catch(error => console.error("Errore navbar:", error));
    }
});

document.addEventListener("DOMContentLoaded", () => {
    // Caricamento Dinamico Navbar
    const navbarContainer = document.getElementById("navbar-container");
    if (navbarContainer) {
        fetch('navbar.html')
            .then(res => res.text())
            .then(data => {
                navbarContainer.innerHTML = data;

                // Scroll desktop
                const body = document.body;
                function checkScroll() {
                    if (window.innerWidth > 992) {
                        body.classList.toggle("top-page", window.scrollY === 0);
                    } else {
                        body.classList.remove("top-page");
                    }
                }
                checkScroll();
                window.addEventListener("scroll", checkScroll);
                window.addEventListener("resize", checkScroll);

                // Menu hamburger
                const extraMenuBtn = document.getElementById('extraMenuBtn');
                const extraMenuPanel = document.getElementById('extraMenuPanel');
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

                // Sottomenu mobile
                const mobileToggles = document.querySelectorAll('.mobile-dropdown-toggle');
                mobileToggles.forEach(toggle => {
                    toggle.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation(); 
                        const submenu = this.nextElementSibling;
                        if (submenu && submenu.classList.contains('mobile-submenu')) {
                            submenu.classList.toggle('open');
                        }
                    });
                });
            });
    }

    // Caricamento Dinamico Footer
    const footerContainer = document.getElementById("footer-container");
    if (footerContainer) {
        fetch('footer.html')
            .then(res => res.text())
            .then(data => {
                footerContainer.innerHTML = data;
            })
            .catch(err => console.error("Errore footer:", err));
    }
});