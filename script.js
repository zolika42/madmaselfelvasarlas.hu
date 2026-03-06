function normalizeLang(lang) {
  return String(lang || '')
    .trim()
    .slice(0, 2)
    .toLowerCase();
}

function getLangFromPath(pathname, supported) {
  const m = String(pathname || '').match(/^\/([a-z]{2})(?=\/|$)/i);
  const candidate = normalizeLang(m ? m[1] : '');
  return supported.includes(candidate) ? candidate : '';
}

function getRelPathFromPathname(pathname, currentLangInPath) {
  // Levágjuk az elejéről a "/{lang}" prefixet, majd normalizáljuk
  let rel = String(pathname || '').replace(new RegExp(`^/${currentLangInPath}(?=/|$)`, 'i'), '');
  rel = rel.replace(/^\/+/, ''); // leading slashes off

  // "/hu/" vagy "/hu" -> legyen index.html
  if (!rel) return 'index.html';

  // Ha könyvtárra mutat (pl. "blog/"), legyen blog/index.html
  if (rel.endsWith('/')) return `${rel}index.html`;

  return rel;
}

function buildLangHref(lang, relPath, search, hash) {
  const q = search || '';
  const h = hash || '';
  return `/${lang}/${relPath}${q}${h}`;
}

// Régi API megmarad, csak okosabb: nem mindig index.html-re dob, hanem ugyanarra az oldalra
function setLanguage(lang) {
  const supported = ['en', 'hu', 'de', 'fr', 'nl', 'es'];
  const targetLang = normalizeLang(lang);
  if (!targetLang) return;

  localStorage.setItem('lang', targetLang);

  const { pathname, search, hash } = window.location;
  const pathLang = getLangFromPath(pathname, supported) || targetLang;
  const relPath = getRelPathFromPathname(pathname, pathLang);

  window.location.href = buildLangHref(targetLang, relPath, search, hash);
}

function translatePage(lang) {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.innerHTML = translations[lang][key];
    }
  });
}

function detectBrowserLanguage() {
  const supported = Object.keys(translations);
  const browserLang = navigator.language.slice(0, 2).toLowerCase();
  return supported.includes(browserLang) ? browserLang : 'en';
}

function showEmailModal() {
  let el = document.getElementById('email-modal');
  if (el) {
    el.classList.add('visible');
  }
}

function tracking(g4a_name, g4a_category, g4a_event_label, tag_send_to) {
  gtag('event', 'conversion', { send_to: tag_send_to });
  gtag('event', g4a_name, {
    event_category: g4a_category,
    event_label: g4a_event_label,
    value: 1
  });
}

let scrollTriggered = false;
window.addEventListener('scroll', () => {
  const scrollPercent = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
  if (scrollPercent > 0.4 && !scrollTriggered) {
    scrollTriggered = true;
    showEmailModal(); // saját modalod meghívása
  }
});

let exitTriggered = false;
document.addEventListener('mouseleave', (e) => {
  if (e.clientY < 10 && !exitTriggered) {
    exitTriggered = true;
    showEmailModal();
  }
});

setTimeout(() => {
  showEmailModal();
}, 30000); // 30 sec

document.addEventListener('DOMContentLoaded', () => {
  const supported = ['en', 'hu', 'de', 'fr', 'nl', 'es'];

  const savedLang = normalizeLang(localStorage.getItem('lang'));
  const { pathname, search, hash } = window.location;

  // Nyelv a path-ból (pl. /hu/..., /en/...)
  const pathLang = getLangFromPath(pathname, supported);

  // Ha a gyökérből jövünk és van mentett nyelv, irányítsuk át
  if (pathname === '/' && savedLang && supported.includes(savedLang)) {
    window.location.href = `/${savedLang}/index.html`;
    return;
  }

  // Ha van nyelv az URL-ben, az a forrás-of-truth: synceljük localStorage-be
  if (pathLang) {
    localStorage.setItem('lang', pathLang);
  } else if (!savedLang) {
    // Ha nincs mentett nyelv és nincs nyelv az URL-ben, próbáljuk böngésző alapján
    const browserLang = normalizeLang(detectBrowserLanguage());
    if (browserLang) localStorage.setItem('lang', browserLang);
  }

  const effectiveLang = pathLang || savedLang || detectBrowserLanguage();

  // --- Language selector fix (robosztus /hu/ esetén is) ---
  const selector = document.getElementById('language');
  if (selector) {
    // Relatív útvonalat mindig a *valós* pathLang alapján szedjük le
    // Ha nincs pathLang (pl. /), akkor default index.html
    const relPath = pathLang ? getRelPathFromPathname(pathname, pathLang) : 'index.html';

    // Minden option value-t átírunk, hogy ugyanarra a relPath-re mutasson a saját nyelvén
    Array.from(selector.options).forEach((opt) => {
      const optLang = getLangFromPath(opt.value, supported); // pl. "/hu/index.html" -> "hu"
      if (optLang) {
        opt.value = buildLangHref(optLang, relPath, search, hash);
      }
    });

    // Aktuális nyelv kijelölése (ha pathLang van, az az elsődleges)
    const selectedLang = pathLang || normalizeLang(effectiveLang) || 'hu';
    const targetValue = buildLangHref(selectedLang, relPath, search, hash);
    selector.value = targetValue;

    // Best-effort fallback, ha valamiért nincs exact match
    if (selector.value !== targetValue) {
      const fallback = Array.from(selector.options).find((o) =>
        String(o.value || '').startsWith(`/${selectedLang}/`)
      );
      if (fallback) selector.value = fallback.value;
    }

    selector.addEventListener('change', (e) => {
      const url = e.target && e.target.value;
      if (url) window.location.href = url;
    });
  }
  // --- /Language selector fix ---

  // Lefordítjuk az oldalt
  translatePage(effectiveLang);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        gtag('event', 'conversion', { send_to: 'AW-16905609495/lEufCJjsrv4aEJfCnP0-' });
        observer.disconnect(); // egyszeri trigger
      }
    });
  });

  const contactSection = document.getElementById('contact');
  if (contactSection) {
    observer.observe(contactSection);
  }

  const loader = document.getElementById('site-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 300);
  }
});
