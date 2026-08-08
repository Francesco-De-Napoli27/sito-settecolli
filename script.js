document.addEventListener('DOMContentLoaded', function () {
  // Gestione animazioni di comparsa (reveal)
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

document.addEventListener("DOMContentLoaded", () => {
    // 1. Caricamento Dinamico Navbar e Pannello Laterale
    const navbarContainer = document.getElementById("navbar-container");
    
    if (navbarContainer) {
        fetch('navbar.html')
            .then(response => {
                if (!response.ok) throw new Error("Errore nel caricamento della navbar");
                return response.text();
            })
            .then(data => {
                navbarContainer.innerHTML = data;

                // Scroll della navbar desktop
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

                // Apertura/Chiusura Pannello Hamburger
                const extraMenuBtn = document.getElementById('extraMenuBtn');
                const extraMenuPanel = document.getElementById('extraMenuPanel');
                
                if (extraMenuBtn && extraMenuPanel) {
                    extraMenuBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        extraMenuPanel.classList.toggle('open');
                        extraMenuBtn.classList.toggle('is-active');
                    });
                }

                // Chiusura pannello cliccando fuori o sul bottone X
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

                // Gestione Sottomenu del Menu Laterale (Metodo diretto display block/none)
                var menuLinks = document.querySelectorAll('.extra-menu-list a');
                menuLinks.forEach(function(link) {
                    var submenu = link.nextElementSibling;
                    if (submenu && submenu.tagName.toLowerCase() === 'ul') {
                        link.addEventListener('click', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            var currentDisplay = window.getComputedStyle(submenu).display;
                            if (currentDisplay === 'none') {
                                submenu.style.setProperty('display', 'block', 'important');
                                link.style.color = '#ff2800';
                            } else {
                                submenu.style.setProperty('display', 'none', 'important');
                                link.style.color = '';
                            }
                        });
                    }
                });
            })
            .catch(error => console.error("Errore navbar:", error));
    }

    // 2. Caricamento Dinamico Footer
    const footerContainer = document.getElementById("footer-container");
    if (footerContainer) {
        fetch('footer.html')
            .then(res => {
                if (!res.ok) throw new Error("Errore nel caricamento del footer");
                return res.text();
            })
            .then(data => {
                footerContainer.innerHTML = data;
            })
            .catch(err => console.error("Errore footer:", err));
    }
});