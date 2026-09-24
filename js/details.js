/* Property details page: reads ?id= from the URL and renders that property dynamically. */
(async function () {
  let properties = [];

  try {
    const data = await PFR.loadData();
    properties = data.properties;
  } catch {
    return;
  }

  const id = PFR.getQueryParam("id");
  const property = properties.find((p) => p.id === id);

  if (!property) {
    document.getElementById("page-title").textContent = "Property not found";
    document.getElementById("details-content").innerHTML = `
      <div class="empty-state">
        <h3>We couldn't find that listing</h3>
        <p>It may have been removed or the link is incorrect.</p>
        <a class="tile-btn" href="listings.html" style="max-width:220px;margin:16px auto 0">Back to Listings</a>
      </div>`;
    return;
  }

  const LANDMARKS = {
    Dubai: ["Burj Khalifa", "The Dubai Mall", "Dubai Marina Walk", "Palm Jumeirah"],
    "Abu Dhabi": ["Sheikh Zayed Grand Mosque", "Yas Island", "Corniche Beach", "Louvre Abu Dhabi"],
    Sharjah: ["Al Majaz Waterfront", "Sharjah Corniche", "Al Qasba", "Sharjah Arts Museum"],
    Ajman: ["Ajman Corniche", "Ajman City Centre", "Al Zorah Beach", "Ajman Museum"],
  };

  const EMIRATE_COORDS = {
    Dubai: [25.2048, 55.2708],
    "Abu Dhabi": [24.4539, 54.3773],
    Sharjah: [25.3463, 55.4209],
    Ajman: [25.4052, 55.5136],
  };

  const COMMUNITY_COORDS = {
    "Dubai Marina": [25.08, 55.14],
    "Downtown Dubai": [25.1972, 55.2744],
    "Jumeirah Beach Residence (JBR)": [25.0787, 55.133],
    "Palm Jumeirah": [25.1124, 55.139],
    "Yas Island": [24.4972, 54.6083],
    "Saadiyat Island": [24.5468, 54.4362],
    "Al Maryah Island": [24.4993, 54.3773],
    "Al Reem Island": [24.4996, 54.4051],
    "Al Majaz": [25.3308, 55.3826],
    "Ajman Corniche": [25.4111, 55.4351],
  };

  renderBreadcrumbAndTitle();
  renderGallery();
  renderHeaderBlock();
  renderFactStrip();
  renderDescription();
  renderAdditionalDetails();
  renderAreasNearby();
  renderAmenities();
  renderLocation();
  renderRegulatory();
  renderBuildingCommunity();
  renderInsights();
  renderAgent();
  renderRelated();

  /* ---------------- Helpers ---------------- */
  function hashSeed(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
  }

  function pseudoDigits(salt, length) {
    const h = hashSeed(`${property.id}:${salt}`);
    return String(h).padStart(length, "0").slice(-length);
  }

  function formatDate(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  /* ---------------- Sections ---------------- */
  function renderBreadcrumbAndTitle() {
    document.title = `${property.title} — PropertyForRent.ae`;
    document.getElementById("page-title").textContent = property.title;
    document.getElementById("breadcrumb-title").textContent = property.title;
  }

  function renderGallery() {
    const images = PFR.propertyImages(property, 5);
    const sideImages = [images[1] || images[0], images[2] || images[0]];
    const gallery = document.getElementById("gallery");

    gallery.innerHTML = `
      <div class="gallery-grid">
        <div class="gallery-main-photo" id="gallery-main-photo" style="background-image:url('${images[0]}')">
          <button type="button" class="badge-pill badge-map" id="gallery-map-btn">${ICONS.pin}<span>Map</span></button>
        </div>
        <div class="gallery-side">
          <div class="gallery-side-photo" style="background-image:url('${sideImages[0]}')"></div>
          <div class="gallery-side-photo" style="background-image:url('${sideImages[1]}')">
            <span class="badge-pill badge-count">${ICONS.camera}<span>${images.length}</span></span>
          </div>
        </div>
      </div>
      <div class="gallery-thumbs" id="gallery-thumbs">
        ${images
          .map(
            (src, i) =>
              `<button type="button" class="${i === 0 ? "is-active" : ""}" data-src="${src}" style="background-image:url('${src}')" aria-label="Photo ${i + 1}"></button>`
          )
          .join("")}
      </div>
    `;

    document.getElementById("gallery-thumbs").addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      document.querySelectorAll("#gallery-thumbs button").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      document.getElementById("gallery-main-photo").style.backgroundImage = `url('${btn.dataset.src}')`;
    });

    document.getElementById("gallery-map-btn").addEventListener("click", () => {
      document.getElementById("location-section").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function renderHeaderBlock() {
    document.getElementById("details-title").textContent = property.title;
    document.getElementById("details-address").innerHTML = `${ICONS.pin}<span>${property.address}</span>`;
    document.getElementById("details-price").textContent = PFR.formatPriceWithPeriod(property);
  }

  function renderFactStrip() {
    const beds = property.beds === 0 ? "Studio" : `${property.beds} Beds`;
    document.getElementById("fact-strip").innerHTML = `
      <div class="fact-item">${ICONS.building}<span>${property.type}<small>Type</small></span></div>
      <div class="fact-item">${ICONS.bed}<span>${beds}<small>Bedrooms</small></span></div>
      <div class="fact-item">${ICONS.bath}<span>${property.baths}<small>Bathrooms</small></span></div>
      <div class="fact-item">${ICONS.area}<span>${property.areaSqft.toLocaleString()} sqft<small>Area</small></span></div>
    `;
  }

  function renderDescription() {
    document.getElementById("details-desc").textContent = property.description;
    document.getElementById("details-tags").innerHTML = (property.tags || [])
      .map((t) => `<span class="tag">${t}</span>`)
      .join("");
  }

  function renderAdditionalDetails() {
    const purpose = property.category === "rent" ? "For Rent" : "For Sale";
    const furnished = (property.tags || []).some((t) => /furnish/i.test(t)) ? "Furnished" : "Unfurnished";
    const rows = [
      ["Purpose", purpose],
      ["Property type", property.type],
      ["Furnishing", furnished],
      ["Updated on", formatDate(property.postedDate)],
      ["Property ref no", `PFR-${pseudoDigits("ref", 6)}`],
      ["Trakheesi Permit", pseudoDigits("trak", 8)],
      ["ORN No.", pseudoDigits("orn", 5)],
      ["BRN No.", pseudoDigits("brn", 5)],
    ];
    document.getElementById("additional-details").innerHTML = rows
      .map(([label, value]) => `<div class="detail-row"><span class="detail-label">${label}</span><span class="detail-value">${value}</span></div>`)
      .join("");
  }

  function renderAreasNearby() {
    const landmarks = LANDMARKS[property.emirate] || LANDMARKS.Dubai;
    document.getElementById("areas-nearby").innerHTML = landmarks
      .map((name) => {
        const mins = 5 + (hashSeed(`${property.id}:${name}`) % 21);
        return `<div class="nearby-item">${ICONS.pin}<span>~${mins} mins from <strong>${name}</strong></span></div>`;
      })
      .join("");
  }

  function renderAmenities() {
    document.getElementById("amenities-grid").innerHTML = (property.amenities || [])
      .map((a) => `<div class="amenity-tile">${ICONS.check}<span>${a}</span></div>`)
      .join("");
  }

  function renderLocation() {
    const [lat, lng] = COMMUNITY_COORDS[property.community] || EMIRATE_COORDS[property.emirate] || EMIRATE_COORDS.Dubai;
    const d = 0.012;
    const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
    const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
    const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address)}`;

    document.getElementById("location-block").innerHTML = `
      <div class="location-map"><iframe src="${mapSrc}" loading="lazy" title="Property location map"></iframe></div>
      <div class="location-info">
        <div class="location-address">${ICONS.pin}<span>${property.address}</span></div>
        <a class="btn btn-outline" href="${gmapsUrl}" target="_blank" rel="noopener">View on Map ${ICONS.arrowRight}</a>
      </div>
    `;
  }

  function renderRegulatory() {
    const rows = [
      ["Property ref no", `PFR-${pseudoDigits("ref", 6)}`],
      ["Trakheesi Permit", pseudoDigits("trak", 8)],
      ["ORN No.", pseudoDigits("orn", 5)],
      ["BRN No.", pseudoDigits("brn", 5)],
    ];
    const qrData = encodeURIComponent(`${window.location.origin}${window.location.pathname}?id=${property.id}`);
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=0&data=${qrData}`;

    document.getElementById("regulatory-card").innerHTML = `
      <div class="regulatory-rows">
        ${rows.map(([label, value]) => `<div class="detail-row"><span class="detail-label">${label}</span><span class="detail-value">${value}</span></div>`).join("")}
      </div>
      <div class="regulatory-qr"><img src="${qrSrc}" alt="Listing QR code" width="120" height="120" loading="lazy" /></div>
    `;

    const reportBtn = document.getElementById("report-btn");
    reportBtn.innerHTML = `${ICONS.flag}<span>Report Property</span>`;
    reportBtn.addEventListener("click", () => {
      reportBtn.disabled = true;
      reportBtn.innerHTML = `${ICONS.check}<span>Reported</span>`;
    });
  }

  function renderBuildingCommunity() {
    const buildingPeers = properties.filter((p) => p.title === property.title && p.community === property.community);
    const communityPeers = properties.filter((p) => p.community === property.community);
    const buildingThumbSource = buildingPeers.find((p) => p.id !== property.id) || property;
    const communityThumbSource = communityPeers.find((p) => p.id !== property.id) || property;
    const buildingThumb = PFR.propertyImages(buildingThumbSource, 1)[0];
    const communityThumb = PFR.propertyImages(communityThumbSource, 1)[0];
    const buildingsInCommunity = new Set(communityPeers.map((p) => p.title)).size;

    document.getElementById("building-community-grid").innerHTML = `
      <div class="info-card">
        <div class="info-card-label">Building Information</div>
        <h3 class="info-card-title">${property.title}</h3>
        <div class="info-card-meta">${ICONS.pin}<span>${property.emirate}, UAE</span></div>
        <div class="info-card-meta">${ICONS.building}<span>${property.type}</span></div>
        <div class="info-card-meta">${ICONS.check}<span>${buildingPeers.length} ${buildingPeers.length === 1 ? "Property" : "Properties"} Available</span></div>
        <img class="info-card-photo" src="${buildingThumb}" alt="${property.title}" loading="lazy" />
      </div>
      <div class="info-card">
        <div class="info-card-label">Community Information</div>
        <h3 class="info-card-title">${property.community}</h3>
        <div class="info-card-meta">${ICONS.pin}<span>${property.emirate}, UAE</span></div>
        <div class="info-card-meta">${ICONS.building}<span>${buildingsInCommunity} ${buildingsInCommunity === 1 ? "Building" : "Buildings"}</span></div>
        <div class="info-card-meta">${ICONS.check}<span>${communityPeers.length} Properties Available</span></div>
        <img class="info-card-photo" src="${communityThumb}" alt="${property.community}" loading="lazy" />
      </div>
    `;
  }

  function renderInsights() {
    const section = document.getElementById("insights-section");
    const grid = document.getElementById("insights-grid");
    const psf = property.price / property.areaSqft;

    let peers = properties.filter((p) => p.id !== property.id && p.community === property.community);
    if (!peers.length) {
      peers = properties.filter((p) => p.id !== property.id && p.emirate === property.emirate && p.type === property.type);
    }
    if (!peers.length) {
      section.style.display = "none";
      return;
    }

    const avgPrice = peers.reduce((s, p) => s + p.price, 0) / peers.length;
    const avgPsf = peers.reduce((s, p) => s + p.price / p.areaSqft, 0) / peers.length;
    const pricePct = Math.round(((avgPrice - property.price) / avgPrice) * 100);
    const psfPct = Math.round(((avgPsf - psf) / avgPsf) * 100);
    const metricLabel = property.category === "rent" ? "Rent" : "Price";

    function card(pct, label, avgAmount) {
      const less = pct >= 0;
      const icon = less ? ICONS.trendDown : ICONS.trendUp;
      return `
        <div class="insight-card ${less ? "insight-positive" : "insight-negative"}">
          <span class="insight-icon">${icon}</span>
          <div>
            <div class="insight-title">This property's ${label} is <strong>${Math.abs(pct)}% ${less ? "Less" : "More"}</strong></div>
            <div class="insight-sub">vs. the average ${label.toLowerCase()} of similar listings in ${property.community} (~${PFR.formatPrice(Math.round(avgAmount), property.currency)})</div>
          </div>
        </div>`;
    }

    grid.innerHTML = card(pricePct, metricLabel, avgPrice) + card(psfPct, `${metricLabel} per sqft`, avgPsf);
  }

  function renderAgent() {
    const initials = property.agent.name
      .split(" ")
      .map((w) => w[0])
      .join("");
    const waNumber = property.agent.phone.replace(/[^\d]/g, "");
    document.getElementById("agent-card").innerHTML = `
      <div class="agent-top">
        <div class="agent-avatar">${initials}</div>
        <div>
          <div class="agent-name">${property.agent.name}</div>
          <div class="agent-role">Listing Agent</div>
        </div>
      </div>
      <div class="agent-actions">
        <a class="tile-btn" href="tel:${property.agent.phone.replace(/\s/g, "")}">${ICONS.phone} Call Agent</a>
        <a class="tile-btn" href="https://wa.me/${waNumber}" target="_blank" rel="noopener">${ICONS.whatsapp} WhatsApp</a>
        <a class="tile-btn" href="mailto:${property.agent.email}">${ICONS.mail} Email Agent</a>
      </div>
    `;
  }

  function renderRelated() {
    const track = document.getElementById("related-track");
    const related = properties.filter((p) => p.id !== property.id && p.emirate === property.emirate).slice(0, 6);
    const list = related.length ? related : properties.filter((p) => p.id !== property.id).slice(0, 6);
    track.innerHTML = list.map(PFR.propertyCardHTML).join("");
    PFR.attachCardEvents(track);

    const prev = document.getElementById("related-prev");
    const next = document.getElementById("related-next");
    prev.innerHTML = ICONS.chevronLeft;
    next.innerHTML = ICONS.chevronRight;
    const scrollAmount = () => track.clientWidth * 0.8;
    prev.addEventListener("click", () => track.scrollBy({ left: -scrollAmount(), behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: scrollAmount(), behavior: "smooth" }));
  }
})();
