/* Listings page: filter and render properties dynamically from JSON data. */
(async function () {
  let properties = [];
  let communities = [];

  try {
    const data = await PFR.loadData();
    properties = data.properties;
    communities = data.communities;
  } catch {
    return;
  }

  const grid = document.getElementById("listings-grid");
  const form = document.getElementById("filters-form");
  const typeInput = document.getElementById("f-type");
  const categoryGroup = document.getElementById("f-property-category");

  populateSelectOptions();
  applyParamsToForm();
  render();

  form.addEventListener("input", PFR.debounce(render, 200));
  form.addEventListener("change", render);
  form.addEventListener("submit", (e) => e.preventDefault());
  document.getElementById("f-search-btn").addEventListener("click", render);

  categoryGroup.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    categoryGroup.querySelectorAll("button").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    typeInput.value = btn.dataset.value;
    render();
  });

  PFR.attachCardEvents(grid);

  function populateSelectOptions() {
    const emirateSel = document.getElementById("f-emirate");
    const communitySel = document.getElementById("f-community");

    [...new Set(properties.map((p) => p.emirate))]
      .sort()
      .forEach((e) => emirateSel.insertAdjacentHTML("beforeend", `<option value="${e}">${e}</option>`));

    communities
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((c) => communitySel.insertAdjacentHTML("beforeend", `<option value="${c.name}">${c.name}</option>`));
  }

  function applyParamsToForm() {
    const params = new URLSearchParams(window.location.search);
    const map = {
      q: "f-q",
      category: "f-category",
      emirate: "f-emirate",
      community: "f-community",
      beds: "f-beds",
    };
    Object.entries(map).forEach(([param, id]) => {
      const value = params.get(param);
      if (value) {
        const el = document.getElementById(id);
        if (el) el.value = value;
      }
    });
    const type = params.get("type");
    if (type) {
      typeInput.value = type;
      categoryGroup.querySelectorAll("button").forEach((b) => b.classList.toggle("is-active", b.dataset.value === type));
    }
  }

  function getFilters() {
    const fd = new FormData(form);
    return {
      q: (fd.get("q") || "").toLowerCase().trim(),
      category: fd.get("category") || "",
      emirate: fd.get("emirate") || "",
      community: fd.get("community") || "",
      type: fd.get("type") || "",
      beds: fd.get("beds") || "",
    };
  }

  function filterProperties(list, f) {
    return list.filter((p) => {
      if (f.q && !`${p.title} ${p.community} ${p.address} ${p.type}`.toLowerCase().includes(f.q)) return false;
      if (f.category && p.category !== f.category) return false;
      if (f.emirate && p.emirate !== f.emirate) return false;
      if (f.community && p.community !== f.community) return false;
      if (f.type && p.type !== f.type) return false;
      if (f.beds !== "" && p.beds < Number(f.beds)) return false;
      return true;
    });
  }

  function sortProperties(list) {
    return list.slice().sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
  }

  function render() {
    const filters = getFilters();
    let list = filterProperties(properties, filters);
    list = sortProperties(list);

    if (!list.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <h3>No properties match your search</h3>
          <p>Try widening your search criteria.</p>
        </div>`;
      return;
    }
    grid.innerHTML = list.map((p) => PFR.propertyCardHTML(p, { contact: true })).join("");
  }
})();
