const translations = {
    it: {
        // Navbar
        "nav_club": "CLUB ▾",
        "nav_maschile": "MASCHILE ▾",
        "nav_femminile": "FEMMINILE ▾",
        "nav_giovanile": "GIOVANILE ▾",
        "nav_news": "NEWS ▾",
        "nav_partner": "PARTNER",
        "nav_marketing": "MARKETING",
        "nav_shop": "SHOP",
        
        // Club Dropdown
        "drop_chisiamo": "CHI SIAMO",
        "drop_organigramma": "ORGANIGRAMMA",
        "drop_storia": "LA STORIA",
        "drop_palmares": "PALMARES",
        "drop_etico": "CODICE ETICO",

        // Maschile / Femminile Dropdown
        "drop_roster": "ROSTER",
        "drop_tuttedate": "TUTTE LE DATE",
        "drop_calendario": "CALENDARIO",
        "drop_storico": "STORICO",
        "drop_campo": "CAMPO DA GIOCO",

        // Giovanile Dropdown
        "drop_cas": "C.A.S.",
        "drop_minivolley": "MINIVOLLEY",
        "drop_u15f": "UNDER 15 FEMMINILE",
        "drop_u15m": "UNDER 15 MASCHILE",
        "drop_u19f": "UNDER 19 FEMMINILE",
        "drop_u19m": "UNDER 19 MASCHILE",
        "drop_impianti": "IMPIANTI DI GIOCO",
        "drop_palmaresgio": "PALMARES",

        // News Dropdown
        "drop_newsm": "MASCHILE",
        "drop_newsf": "FEMMINILE",
        "drop_newsg": "GIOVANILE",
        "drop_agenda": "AGENDA DEI MEDIA",
        "drop_stampa": "UFFICIO STAMPA",
        "drop_whatsapp": "CANALE WHATSAPP",
        "drop_app": "APP UFFICIALE",

        // Partner Page Specifics
        "partners_title": "I Nostri Partner",
        "partners_desc": "Far parte del Pool degli sponsor di Settecolli Member è un'esperienza che va al di là dell'inserire il proprio marchio in uno spazio pubblicitario. Essere partner giallorosso significa sentirsi parte integrante di un progetto, condividerne i valori e lavorare insieme per raggiungere gli obiettivi. Per maggiori informazioni:",
        "tier_main": "Main Sponsor",
        "tier_golden": "Golden Sponsor",
        "tier_tech": "Technical Sponsor",
        "tier_supplier": "Official Supplier",

        // Footer
        "footer_rights": "Tutti i diritti riservati",
        "footer_privacy": "PRIVACY POLICY",
        "footer_cookie": "COOKIE POLICY",
        "footer_contacts": "CONTATTI"
    },
    en: {
        // Navbar
        "nav_club": "CLUB ▾",
        "nav_maschile": "MEN'S ▾",
        "nav_femminile": "WOMEN'S ▾",
        "nav_giovanile": "YOUTH ▾",
        "nav_news": "NEWS ▾",
        "nav_partner": "PARTNERS",
        "nav_marketing": "MARKETING",
        "nav_shop": "SHOP",
        
        // Club Dropdown
        "drop_chisiamo": "ABOUT US",
        "drop_organigramma": "ORGANIZATION",
        "drop_storia": "HISTORY",
        "drop_palmares": "HONORS",
        "drop_etico": "ETHICS CODE",

        // Maschile / Femminile Dropdown
        "drop_roster": "ROSTER",
        "drop_tuttedate": "ALL DATES",
        "drop_calendario": "SCHEDULE",
        "drop_storico": "HISTORY",
        "drop_campo": "ARENA",

        // Giovanile Dropdown
        "drop_cas": "C.A.S.",
        "drop_minivolley": "MINIVOLLEY",
        "drop_u15f": "UNDER 15 WOMEN",
        "drop_u15m": "UNDER 15 MEN",
        "drop_u19f": "UNDER 19 WOMEN",
        "drop_u19m": "UNDER 19 MEN",
        "drop_impianti": "FACILITIES",
        "drop_palmaresgio": "HONORS",

        // News Dropdown
        "drop_newsm": "MEN'S",
        "drop_newsf": "WOMEN'S",
        "drop_newsg": "YOUTH",
        "drop_agenda": "MEDIA AGENDA",
        "drop_stampa": "PRESS OFFICE",
        "drop_whatsapp": "WHATSAPP CHANNEL",
        "drop_app": "OFFICIAL APP",

        // Partner Page Specifics
        "partners_title": "Our Partners",
        "partners_desc": "Being part of the Settecolli Member sponsor pool goes beyond placing your brand in an advertising space. Being a yellow-red partner means feeling an integral part of a project, sharing its values and working together to achieve goals. For more info:",
        "tier_main": "Main Sponsor",
        "tier_golden": "Golden Sponsor",
        "tier_tech": "Technical Sponsor",
        "tier_supplier": "Official Supplier",

        // Footer
        "footer_rights": "All rights reserved",
        "footer_privacy": "PRIVACY POLICY",
        "footer_cookie": "COOKIE POLICY",
        "footer_contacts": "CONTACTS"
    }
};

function setLanguage(lang) {
    localStorage.setItem('site_lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.innerHTML = translations[lang][key];
        }
    });

    // Aggiorna lo stile visivo del selettore IT | EN
    const langSelector = document.querySelectorAll('.lang-selector span');
    langSelector.forEach(el => {
        if (el.textContent.trim().toLowerCase() === lang) {
            el.classList.add('active');
            el.style.color = '#ffc107';
        } else {
            el.classList.remove('active');
            el.style.color = '#888';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('site_lang') || 'it';
    setLanguage(savedLang);

    // Collega i click ai selettori di lingua IT ed EN
    document.querySelectorAll('.lang-selector span').forEach(el => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => {
            const lang = el.textContent.trim().toLowerCase();
            if (lang === 'it' || lang === 'en') {
                setLanguage(lang);
            }
        });
    });
});