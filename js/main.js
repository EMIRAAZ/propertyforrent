/* Home page logic: hero search, featured carousel, communities, popular searches. */
(async function () {
  let properties = [];
  let communities = [];

  try {
    const data = await PFR.loadData();
    properties = data.properties;
    communities = data.communities;
  } catch {
    return; // PFR.loadData already surfaced the error banner
  }

  initHeroSearch();
  initFeaturedCarousel();
  initCommunities();
  initPopularSearches();

  /* ---------------- Hero search ---------------- */
  function initHeroSearch() {
    const emirateSel = document.getElementById("hero-emirate");
    const communitySel = document.getElementById("hero-community");
    const emirates = [...new Set(properties.map((p) => p.emirate))].sort();
    emirates.forEach((e) => emirateSel.insertAdjacentHTML("beforeend", `<option value="${e}">${e}</option>`));
    communities.forEach((c) => communitySel.insertAdjacentHTML("beforeend", `<option value="${c.name}">${c.name}</option>`));

    const categoryGroup = document.getElementById("hero-category");
    let activeCategory = "rent";
    categoryGroup.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      categoryGroup.querySelectorAll("button").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      activeCategory = btn.dataset.value;
    });

    document.getElementById("hero-search-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      const params = new URLSearchParams();
      const q = form.q.value.trim();
      if (q) params.set("q", q);
      if (form.emirate.value) params.set("emirate", form.emirate.value);
      if (form.community.value) params.set("community", form.community.value);
      if (form.beds.value) params.set("beds", form.beds.value);
      if (form.price.value) params.set("price", form.price.value);
      params.set("category", activeCategory);
      window.location.href = `listings.html?${params.toString()}`;
    });
  }

  /* ---------------- Featured carousel ---------------- */
  function initFeaturedCarousel() {
    const track = document.getElementById("featured-track");
    const tabs = document.getElementById("featured-tabs");

    function render(filter = {}) {
      const filterType =
        filter.type || (filter.emirate ? "emirate" : filter.community ? "community" : "all");
      const filterVal = (filter.value || filter.emirate || filter.community || "").toLowerCase().trim();

      let list = properties;

      if (filterType === "emirate" && filterVal && filterVal !== "more" && filterVal !== "all") {
        list = list.filter((p) => (p.emirate || "").toLowerCase().trim() === filterVal);
      } else if (filterType === "community" && filterVal) {
        list = list.filter((p) => {
          const comm = (p.community || "").toLowerCase();
          const addr = (p.address || "").toLowerCase();
          return comm.includes(filterVal) || addr.includes(filterVal) || filterVal.includes(comm);
        });
      }

      // If nothing matches for any reason, show all properties
      if (!list || list.length === 0) {
        list = properties;
      }

      // Render all properties for the category so carousel can scroll
      track.innerHTML = list.map(PFR.propertyCardHTML).join("");
      track.scrollTo({ left: 0, behavior: "smooth" });
    }

    // Default to Dubai matching active pill
    render({ type: "emirate", value: "Dubai" });
    PFR.attachCardEvents(track);

    tabs.addEventListener("click", (e) => {
      const btn = e.target.closest(".tab-pill");
      if (!btn) return;
      tabs.querySelectorAll(".tab-pill").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      // Smoothly center the clicked pill on mobile scroll bar
      try {
        btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      } catch (_) {}

      const filterType =
        btn.dataset.filter || (btn.dataset.emirate ? "emirate" : btn.dataset.community ? "community" : "all");
      const filterVal = btn.dataset.value || btn.dataset.emirate || btn.dataset.community || "";

      if (filterType === "more" || filterVal.toLowerCase() === "more") {
        render({ type: "all" });
        return;
      }

      render({ type: filterType, value: filterVal });
    });

    setupCarouselNav("featured-track", "featured-prev", "featured-next");
  }

  /* ---------------- Communities ---------------- */
  function initCommunities() {
    const track = document.getElementById("community-track");
    track.innerHTML = communities.map(PFR.communityCardHTML).join("");
    setupCarouselNav("community-track", "community-prev", "community-next");
  }

  /* ---------------- Popular searches (built dynamically from live data) ---------------- */
  function initPopularSearches() {
    const grid = document.getElementById("searches-grid");
    const categoryTabs = document.getElementById("searches-category-tabs");
    const emirateTabs = document.getElementById("searches-emirate-tabs");
    const types = ["Apartment", "Villa", "Townhouse", "Penthouse"];

    let state = { category: "sale", emirate: "Dubai" };

    function communitiesFor(emirate) {
      if (emirate === "other") {
        return communities.filter((c) => !["Dubai", "Abu Dhabi"].includes(c.emirate)).slice(0, 4);
      }
      return communities.filter((c) => c.emirate === emirate).slice(0, 4);
    }

    function render() {
      const cols = communitiesFor(state.emirate);
      const label = state.category === "sale" ? "For Sale" : "For Rent";
      grid.innerHTML = types
        .map((type, i) => {
          const community = cols[i % cols.length] || cols[0];
          if (!community) return "";
          const items = cols
            .map((c) => {
              const params = new URLSearchParams({ type, category: state.category, community: c.name });
              return `<a href="listings.html?${params.toString()}">${type}s ${label} in ${c.name}</a>`;
            })
            .join("");
          return `<div class="searches-col"><h4>${type}s</h4>${items}</div>`;
        })
        .join("");
    }

    categoryTabs.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      categoryTabs.querySelectorAll("button").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.category = btn.dataset.category;
      render();
    });

    emirateTabs.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      emirateTabs.querySelectorAll("button").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.emirate = btn.dataset.emirate;
      render();
    });

    render();
  }

  /* ---------------- Shared carousel scroll behavior ---------------- */
  function setupCarouselNav(trackId, prevId, nextId) {
    const track = document.getElementById(trackId);
    const prev = document.getElementById(prevId);
    const next = document.getElementById(nextId);
    if (!track) return;
    if (prev) prev.innerHTML = ICONS.chevronLeft;
    if (next) next.innerHTML = ICONS.chevronRight;

    const getScrollStep = () => {
      const firstCard = track.querySelector(".property-card, .community-card") || track.firstElementChild;
      if (firstCard) {
        const gap = parseFloat(window.getComputedStyle(track).gap) || 20;
        return (firstCard.offsetWidth + gap) * (trackId.includes("community") ? 2 : 1);
      }
      return track.clientWidth * 0.8;
    };

    function updateNavVisibility() {
      if (prev) {
        prev.style.opacity = track.scrollLeft <= 10 ? "0" : "1";
        prev.style.pointerEvents = track.scrollLeft <= 10 ? "none" : "auto";
      }
      if (next) {
        const maxScroll = track.scrollWidth - track.clientWidth - 10;
        next.style.opacity = track.scrollLeft >= maxScroll ? "0" : "1";
        next.style.pointerEvents = track.scrollLeft >= maxScroll ? "none" : "auto";
      }
    }

    prev?.addEventListener("click", () => {
      track.scrollBy({ left: -getScrollStep(), behavior: "smooth" });
    });
    next?.addEventListener("click", () => {
      track.scrollBy({ left: getScrollStep(), behavior: "smooth" });
    });

    track.addEventListener("scroll", PFR.debounce(updateNavVisibility, 50), { passive: true });
    updateNavVisibility();
  }
})();
