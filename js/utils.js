/* Shared helpers used across all pages. Everything lives on the PFR namespace. */
const PFR = (() => {
  const DATA_CACHE = {};

  async function loadData() {
    if (DATA_CACHE.properties && DATA_CACHE.communities) return DATA_CACHE;
    try {
      const [propsRes, commRes] = await Promise.all([
        fetch("data/properties.json"),
        fetch("data/communities.json"),
      ]);
      if (!propsRes.ok || !commRes.ok) throw new Error("Bad response");
      DATA_CACHE.properties = await propsRes.json();
      DATA_CACHE.communities = await commRes.json();
      return DATA_CACHE;
    } catch (err) {
      showDataError();
      throw err;
    }
  }

  function showDataError() {
    if (document.getElementById("pfr-data-error")) return;
    const bar = document.createElement("div");
    bar.id = "pfr-data-error";
    bar.className = "data-error-banner";
    bar.innerHTML =
      "Couldn't load listing data. If you opened this file directly (file://), " +
      "browsers block local JSON fetches &mdash; serve the folder instead, e.g. " +
      "<code>npx serve .</code> or <code>python3 -m http.server</code>, then open it via http://localhost.";
    document.body.prepend(bar);
  }

  function formatPrice(amount, currency = "AED") {
    return `${currency} ${Number(amount).toLocaleString("en-US")}`;
  }

  function formatPriceWithPeriod(property) {
    const base = formatPrice(property.price, property.currency);
    return property.category === "rent" && property.period ? `${base} /${property.period}` : base;
  }

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }

  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function debounce(fn, wait = 250) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  const FAVORITES_KEY = "pfr_favorites";

  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    } catch {
      return [];
    }
  }

  function isFavorite(id) {
    return getFavorites().includes(id);
  }

  function toggleFavorite(id) {
    const favs = getFavorites();
    const idx = favs.indexOf(id);
    if (idx > -1) favs.splice(idx, 1);
    else favs.push(id);
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    } catch {
      /* private-mode storage may be unavailable — favoriting just won't persist */
    }
    return favs.includes(id);
  }

  function bedsBathsLabel(property) {
    const beds = property.beds === 0 ? "Studio" : `${property.beds}`;
    return beds;
  }

  const FALLBACK_LUXURY_PHOTOS = [
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=80"
  ];

  /** Deterministic set of luxury listing photos per property (stable across renders/pages). */
  function propertyImages(property, count = 5) {
    if (Array.isArray(property.images) && property.images.length > 0) {
      return property.images;
    }
    const offset = Math.abs(
      (property.id || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
    ) % FALLBACK_LUXURY_PHOTOS.length;
    return Array.from({ length: count }, (_, i) => {
      return FALLBACK_LUXURY_PHOTOS[(offset + i) % FALLBACK_LUXURY_PHOTOS.length];
    });
  }

  /** Card markup matching the luxury UI design in the reference screenshot.
   *  Pass { contact: true } to also render Call/Mail/WhatsApp action pills (used in the listings list view). */
  function propertyCardHTML(property, { contact = false } = {}) {
    const fav = isFavorite(property.id) ? "is-active" : "";
    const favIcon = isFavorite(property.id) ? ICONS.heartFilled : ICONS.heart;
    const images = propertyImages(property, 5);
    const tagsText = (property.tags || []).slice(0, 4).join(" &nbsp;|&nbsp; ");
    const priceFormatted = Number(property.price).toLocaleString("en-US");
    const waNumber = (property.agent?.phone || "").replace(/[^\d]/g, "");

    return `
    <article class="property-card" data-id="${property.id}">
      <div class="card-media">
        ${property.featured ? `<span class="badge">Trending Property</span>` : ""}
        <div class="card-image-track">
          ${images
            .map(
              (src, i) =>
                `<img src="${src}" alt="${property.title}" loading="${i === 0 ? "eager" : "lazy"}" />`
            )
            .join("")}
        </div>
        <button type="button" class="card-fav-btn fav-btn ${fav}" data-fav-id="${property.id}" aria-label="Toggle favorite">
          ${favIcon}
        </button>
        <button type="button" class="media-nav media-prev" aria-label="Previous photo">${ICONS.chevronLeft}</button>
        <button type="button" class="media-nav media-next" aria-label="Next photo">${ICONS.chevronRight}</button>
        <div class="card-dots">
          ${images.map((_, i) => `<span class="dot ${i === 0 ? "is-active" : ""}"></span>`).join("")}
        </div>
      </div>
      <div class="card-body">
        <div class="card-title-row">
          <h3 class="card-title">${property.title}</h3>
          <span class="agency-badge">fām</span>
        </div>
        <div class="card-price"><span class="price-symbol">Đ</span> ${priceFormatted}</div>
        <div class="card-specs">
          <span class="spec-type">${property.type}</span>
          <span class="spec-divider">|</span>
          <span class="spec-item">${ICONS.bed} <span>${bedsBathsLabel(property)}</span></span>
          <span class="spec-item">${ICONS.bath} <span>${property.baths}</span></span>
          <span class="spec-divider">|</span>
          <span class="spec-item">${ICONS.area} <span>${Number(property.areaSqft).toLocaleString("en-US")} sqft</span></span>
        </div>
        <div class="card-tags-line">
          ${tagsText}
        </div>
        <div class="card-location">
          <span class="location-icon">${ICONS.pin}</span>
          <span class="location-text" title="${property.address}">${property.address}</span>
        </div>
        ${
          contact && property.agent
            ? `<div class="card-contact-row">
                <a class="contact-pill" href="tel:${property.agent.phone.replace(/\s/g, "")}">${ICONS.phone}<span>Call</span></a>
                <a class="contact-pill" href="mailto:${property.agent.email}">${ICONS.mail}<span>Mail</span></a>
                <a class="contact-pill" href="https://wa.me/${waNumber}" target="_blank" rel="noopener">${ICONS.whatsapp}<span>Whatsapp</span></a>
              </div>`
            : ""
        }
      </div>
    </article>`;
  }

  /** Delegated click & touch handling for favorites, photo carousel, and direct navigation to details. */
  function attachCardEvents(container) {
    let touchStartX = 0;
    let touchStartY = 0;
    let didMove = false;

    container.addEventListener(
      "touchstart",
      (e) => {
        didMove = false;
        const touch = e.changedTouches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      },
      { passive: true }
    );

    container.addEventListener(
      "touchmove",
      (e) => {
        const touch = e.changedTouches[0];
        if (
          Math.abs(touch.clientX - touchStartX) > 8 ||
          Math.abs(touch.clientY - touchStartY) > 8
        ) {
          didMove = true;
        }
      },
      { passive: true }
    );

    container.addEventListener("click", (e) => {
      // If user was swiping or dragging on mobile, do not treat as click
      if (didMove) {
        didMove = false;
        return;
      }

      const contactPill = e.target.closest(".contact-pill");
      if (contactPill) {
        e.stopPropagation();
        return;
      }

      const favBtn = e.target.closest(".fav-btn, .card-fav-btn");
      if (favBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = favBtn.dataset.favId;
        const active = toggleFavorite(id);
        favBtn.classList.toggle("is-active", active);
        favBtn.innerHTML = active ? ICONS.heartFilled : ICONS.heart;
        return;
      }

      const navBtn = e.target.closest(".media-nav");
      if (navBtn) {
        e.preventDefault();
        e.stopPropagation();
        const media = navBtn.closest(".card-media");
        const track = media.querySelector(".card-image-track");
        const dots = [...media.querySelectorAll(".dot")];
        const slideCount = dots.length;
        let idx = dots.findIndex((d) => d.classList.contains("is-active"));
        idx = navBtn.classList.contains("media-next")
          ? (idx + 1) % slideCount
          : (idx - 1 + slideCount) % slideCount;
        track.style.transform = `translateX(-${idx * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
        return;
      }

      const card = e.target.closest(".property-card");
      if (card) {
        const id = card.dataset.id;
        if (id) {
          window.location.href = `details.html?id=${id}`;
        }
      }
    });
  }

  const COMMUNITY_PHOTOS = {
    c1: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=700&q=80", // Burj Al Arab turquoise aerial
    c2: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=700&q=80", // Night skyline across water
    c3: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=700&q=80", // Palm Jumeirah aerial
    c4: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=700&q=80", // Night skyline across water
    c5: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=700&q=80", // Burj Al Arab aerial
    c6: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=700&q=80", // Night skyline across water
    c7: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&w=700&q=80", // Dubai Marina
    c8: "https://images.unsplash.com/photo-1546412414-e1885259563a?auto=format&fit=crop&w=700&q=80"  // Downtown Dubai
  };

  /** High-resolution landmark photos per community matching reference design. */
  function communityImage(community) {
    if (community && COMMUNITY_PHOTOS[community.id]) {
      return COMMUNITY_PHOTOS[community.id];
    }
    const nameLower = (community?.name || "").toLowerCase();
    if (nameLower.includes("palm")) return COMMUNITY_PHOTOS.c3;
    if (nameLower.includes("abu dhabi")) return COMMUNITY_PHOTOS.c2;
    if (nameLower.includes("downtown")) return COMMUNITY_PHOTOS.c5;
    if (nameLower.includes("marina")) return COMMUNITY_PHOTOS.c6;
    return COMMUNITY_PHOTOS.c1;
  }

  function communityCardHTML(community) {
    return `
    <a class="community-card" href="listings.html?emirate=${encodeURIComponent(community.emirate)}&community=${encodeURIComponent(community.name)}">
      <img src="${communityImage(community)}" alt="${community.name}" loading="lazy" />
      <div class="community-overlay">
        <h3>${community.name}</h3>
        <p>${community.propertyCount} Properties Available</p>
      </div>
    </a>`;
  }

  return {
    loadData,
    formatPrice,
    formatPriceWithPeriod,
    getQueryParam,
    qs,
    qsa,
    debounce,
    getFavorites,
    isFavorite,
    toggleFavorite,
    propertyImages,
    propertyCardHTML,
    communityCardHTML,
    attachCardEvents,
  };
})();
