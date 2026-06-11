const GTAG_SNIPPET_AW_CODE = 'AW-16905609495'; // Google Tag Manager
const GTAG_SNIPPET_GA4_CODE = 'AW-16882358510'; // Google Analytics
module.exports = {
  // Feature toggles
  features: {
    enableGoogleTags: true,
    enableHeaderFooterTemplates: true,
    enableAssetMinification: true,
    generateSitemapAndRobots: true,
    cleanUnusedTranslations: true
  },
  paths: {
    root: './',
    baseURL: 'https://beyondstart.solutions',
    templateDir: './templates',
    landingDir: './landing',
    headerTemplate: 'templates/header.template.html',
    footerTemplate: 'templates/footer.template.html',
    targetDir: 'dist',
    faviconsDir: 'favicons',
    blogDir: './blog',
    blogIndexTemplate: 'templates/blog-index.template.html',
    blogEntryTemplate: 'templates/blog.template.html',
    rootBlogHtml: './blog.html',
    indexTemplate: 'templates/index.template.html',
    blogListSelector: 'ul.blog-list'
  },
  gtag: {
    GTAG_SNIPPET_AW_CODE,
    GTAG_SNIPPET: `<script>
    (function () {
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

        function loadGoogleTags() {
            if (window.__madmaselGoogleTagsLoaded) return;
            window.__madmaselGoogleTagsLoaded = true;

            var script = document.createElement('script');
            script.async = true;
            script.src = 'https://www.googletagmanager.com/gtag/js?id=${GTAG_SNIPPET_AW_CODE}';
            document.head.appendChild(script);

            window.gtag('js', new Date());
            window.gtag('config', '${GTAG_SNIPPET_AW_CODE}');
            window.gtag('config', '${GTAG_SNIPPET_GA4_CODE}');
        }

        ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(function (eventName) {
            window.addEventListener(eventName, loadGoogleTags, { once: true, passive: true });
        });

        window.addEventListener('load', function () {
            window.setTimeout(loadGoogleTags, 15000);
        }, { once: true });
    })();
</script>`
  },
  log: {
    okColor: (str) => `\x1b[32m${str}\x1b[0m`,
    warningColor: (str) => `\x1b[33m${str}\x1b[0m`,
    errorColor: (str) => `\x1b[31m${str}\x1b[0m`
  },
  exclusions: {
    // Tags to exclude from automatic innerText translation when no data-i18n is present.
    // Used to prevent accidental overwriting of buttons, options, spans, etc.
    skipTags: ['option', 'button', 'span', 'li'],
    // Special selectors mapped to translation keys for static metadata like <title> and <meta>.
    // These elements are localized even without a data-i18n attribute.
    specialMap: {
      title: 'pageTitle',
      "meta[name='description']": 'metaDescription',
      "meta[property='og:title']": 'ogTitle',
      "meta[property='og:description']": 'ogDescription',
      "meta[name='keywords']": 'metaKeywords'
    }
  },
  node: {
    helpText: `
        🆘 \x1b[36mBeyondStart deploy.js – CLI flags\x1b[0m
        
        \x1b[33m--noGoogleTags\x1b[0m             Disable Google Tag injection and CTA tracking check
        \x1b[33m--noHeaderFooterTemplates\x1b[0m  Skip replacing <header>/<footer> using templates
        \x1b[33m--noAssetMinification\x1b[0m      Skip minifying JS and CSS assets
        \x1b[33m--noSitemap\x1b[0m                Skip generating sitemap.xml and robots.txt
        \x1b[33m--noCleanTranslations\x1b[0m      Skip cleaning unused translation keys
        \x1b[33m--dry-run\x1b[0m                   Simulate the process – no file writes, just logs
        
        \x1b[36mExample:\x1b[0m
          node deploy.js --noGoogleTags --dry-run
            `
  }
};
