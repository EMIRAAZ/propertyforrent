/* Shared chrome: header icons, footer markup, mobile nav — included on every page. */
(function () {
  function socialIconsHTML() {
    return `
      <a href="#" aria-label="LinkedIn">${ICONS.linkedin}</a>
      <a href="#" aria-label="Facebook">${ICONS.facebook}</a>
      <a href="#" aria-label="Instagram">${ICONS.instagram}</a>
    `;
  }

  function renderHeaderIcons() {
    const social = document.getElementById("header-social-icons");
    if (social) social.innerHTML = socialIconsHTML();

    const chevron = document.getElementById("currency-chevron");
    if (chevron) chevron.innerHTML = ICONS.chevronDown;

    const loginIcon = document.getElementById("login-icon");
    if (loginIcon) loginIcon.innerHTML = ICONS.user;

    const searchIcon = document.getElementById("icon-search");
    if (searchIcon) searchIcon.innerHTML = ICONS.search;
  }

  function renderMobileMenu() {
    const panel = document.getElementById("mobile-menu");
    const toggle = document.getElementById("mobile-nav-toggle");
    if (!panel || !toggle) return;

    const navLinks = Array.from(document.querySelectorAll(".main-nav a"))
      .map((a) => `<a href="${a.getAttribute("href")}">${a.textContent}</a>`)
      .join("");

    panel.innerHTML = `
      ${navLinks}
      <div class="mobile-menu-row">
        <div class="social-icons">${socialIconsHTML()}</div>
        <div class="select-wrap">
          <select class="currency-select" aria-label="Currency">
            <option>AED</option>
            <option>USD</option>
            <option>EUR</option>
          </select>
          <span class="select-chevron">${ICONS.chevronDown}</span>
        </div>
      </div>
      <button class="btn btn-primary btn-block"><span>${ICONS.user}</span>Login</button>
    `;

    toggle.innerHTML = ICONS.menu;
    toggle.addEventListener("click", () => {
      const isOpen = panel.classList.toggle("is-open");
      toggle.innerHTML = isOpen ? ICONS.x : ICONS.menu;
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    panel.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        panel.classList.remove("is-open");
        toggle.innerHTML = ICONS.menu;
      }
    });
  }

  const FOOTER_ICONS = {
    linkedin: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#0066ff" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" transform="translate(2.5, 0) scale(0.88)"/>
      </svg>
    `,
    facebook: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11" fill="#0066ff"/>
        <path d="M15.2 12.3h-2.3V19h-2.8v-6.7H8.3V9.9h1.8V8.2c0-2.2 1.3-3.6 3.5-3.6 1 0 2 .1 2 .1v2.3h-1.2c-1.1 0-1.5.7-1.5 1.5v1.4h2.6l-.3 2.4z" fill="#ffffff"/>
      </svg>
    `,
    instagram: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="6" stroke="#0066ff" stroke-width="2.2"/>
        <circle cx="12" cy="12" r="4.3" stroke="#0066ff" stroke-width="2.2"/>
        <circle cx="17.2" cy="6.8" r="1.3" fill="#0066ff"/>
      </svg>
    `
  };

  const GOOGLE_PLAY_BADGE = `
    <a href="#" class="store-badge" aria-label="Get it on Google Play">
      <svg width="140" height="42" viewBox="0 0 140 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="0.5" width="139" height="41" rx="8" fill="#000000" stroke="#a6a6a6" stroke-width="1"/>
        <g transform="translate(12, 8)">
          <path d="M2.5 1.5C2.2 1.8 2 2.3 2 3v20c0 .7.2 1.2.5 1.5l11-11.5L2.5 1.5z" fill="#00E5FF"/>
          <path d="M17.5 9.5L14 13 2.5 1.5c.5-.3 1.1-.3 1.7.1l13.3 7.9z" fill="#FFEB3B"/>
          <path d="M2.5 24.5c.6.4 1.2.4 1.7.1l13.3-7.9-3.5-3.7-11.5 11.5z" fill="#F44336"/>
          <path d="M20.2 11.3l-2.7-1.8L14 13l3.5 3.5 2.7-1.7c1-.6 1-1.6 0-2.2l-.2-.3z" fill="#00C853"/>
        </g>
        <text x="42" y="15" fill="#ffffff" font-size="8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" letter-spacing="0.4">GET IT ON</text>
        <text x="42" y="30" fill="#ffffff" font-size="14.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700">Google Play</text>
      </svg>
    </a>
  `;

  const APP_STORE_BADGE = `
    <a href="#" class="store-badge" aria-label="Download on the App Store">
      <svg width="140" height="42" viewBox="0 0 140 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="0.5" width="139" height="41" rx="8" fill="#000000" stroke="#a6a6a6" stroke-width="1"/>
        <g transform="translate(13, 7)" fill="#ffffff">
          <path d="M15.22 13.9c-.04-2.82 2.3-4.18 2.4-4.25-1.32-1.92-3.36-2.18-4.08-2.22-1.74-.18-3.41 1.03-4.29 1.03-.89 0-2.27-1-3.72-.98-1.92.03-3.69 1.12-4.68 2.84-2 3.47-.51 8.6 1.44 11.41.95 1.38 2.09 2.92 3.58 2.87 1.43-.06 1.98-.93 3.71-.93 1.73 0 2.22.93 3.73.9 1.54-.03 2.51-1.39 3.46-2.78 1.1-1.6 1.55-3.15 1.58-3.23-.04-.02-3.02-1.16-3.13-4.66z"/>
          <path d="M12.98 5.4c.78-.95 1.31-2.27 1.17-3.6-1.13.05-2.5 1.13-3.3 2.08-.71.82-1.33 2.17-1.16 3.45 1.26.1 2.51-.98 3.29-1.93z"/>
        </g>
        <text x="42" y="15" fill="#ffffff" font-size="7.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" letter-spacing="0.2">Download on the</text>
        <text x="42" y="30" fill="#ffffff" font-size="14.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700">App Store</text>
      </svg>
    </a>
  `;

  function renderFooter() {
    const el = document.getElementById("site-footer");
    if (!el) return;
    el.innerHTML = `
      <div class="container">
        <div class="footer-top">
          <div class="footer-brand">
            <a href="index.html" class="footer-logo">PropertyForRent.ae</a>
            <div class="footer-social-icons">
              <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn">${FOOTER_ICONS.linkedin}</a>
              <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook">${FOOTER_ICONS.facebook}</a>
              <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">${FOOTER_ICONS.instagram}</a>
            </div>
            <div class="footer-store-badges">
              ${GOOGLE_PLAY_BADGE}
              ${APP_STORE_BADGE}
            </div>
          </div>
          <div class="footer-col">
            <h4>Explore</h4>
            <a href="index.html">Home</a>
            <a href="#about">About</a>
            <a href="#blog">Blog</a>
            <a href="#news">News</a>
          </div>
          <div class="footer-col">
            <h4>Explore</h4>
            <a href="index.html">Home</a>
            <a href="#about">About</a>
            <a href="#blog">Blog</a>
            <a href="#news">News</a>
          </div>
          <div class="footer-col">
            <h4>Explore</h4>
            <a href="index.html">Home</a>
            <a href="#about">About</a>
            <a href="#blog">Blog</a>
            <a href="#news">News</a>
          </div>
          <div class="footer-col">
            <h4>Quick Links</h4>
            <a href="#terms">Terms &amp; Conditions</a>
            <a href="#privacy">Privacy &amp; Policy</a>
          </div>
          <div class="footer-col">
            <h4>Account</h4>
            <a href="#login">Login</a>
            <a href="#register">Registration</a>
          </div>
        </div>
        <div class="footer-bottom">Copyright &copy; 2025 PropertyForRent. All Rights Reserved</div>
      </div>
    `;
  }

  function markActiveNav() {
    const page = window.location.pathname.split("/").pop() || "index.html";
    const isListingsSection = page === "listings.html" || page === "details.html";
    document.querySelectorAll(".main-nav a, .mobile-menu a").forEach((a) => {
      const href = a.getAttribute("href");
      const isListingsLink = href === "listings.html";
      a.classList.toggle("is-active", isListingsLink ? isListingsSection : href === page);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderHeaderIcons();
    renderMobileMenu();
    renderFooter();
    markActiveNav();
  });
})();
