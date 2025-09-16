
// JAPFLIX - búsqueda y visualización de películas
// Requisitos: Bootstrap 5 (bundle), FontAwesome 4.x (para estrellas)

(() => {
  const URL = "https://japceibal.github.io/japflix_api/movies-data.json";

  const inputBuscar = document.getElementById("inputBuscar");
  const btnBuscar = document.getElementById("btnBuscar");
  const lista = document.getElementById("lista");

  // Offcanvas elements
  const ocEl = document.getElementById("movieOffcanvas");
  const ocTitle = document.getElementById("oc-title");
  const ocOverview = document.getElementById("oc-overview");
  const ocGenres = document.getElementById("oc-genres");
  const ddMeta = document.getElementById("dd-meta");

  let MOVIES = [];
  let offcanvas;

  document.addEventListener("DOMContentLoaded", async () => {
    // Prefetch movies but don't render
    try {
      const res = await fetch(URL);
      MOVIES = await res.json();
    } catch (e) {
      console.error("Error al cargar películas:", e);
    }
    // Prepare offcanvas instance
    if (ocEl) {
      offcanvas = new bootstrap.Offcanvas(ocEl);
    }
  });

  function toStars(voteAverage) {
    // vote_average es 0-10. Lo convertimos a 0-5
    const rating = Math.max(0, Math.min(5, (voteAverage || 0) / 2));
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    let html = '<span class="text-warning">';
    for (let i = 0; i < full; i++) html += '<i class="fa fa-star"></i>';
    if (half) html += '<i class="fa fa-star-half-o"></i>';
    for (let i = 0; i < empty; i++) html += '<i class="fa fa-star-o"></i>';
    html += '</span>';
    return html;
  }

  function normalizar(str) {
    return (str || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // sin acentos
  }

  function filtrarPeliculas(q) {
    const query = normalizar(q);
    if (!query) return [];
    return MOVIES.filter(m => {
      const title = normalizar(m.title);
      const tagline = normalizar(m.tagline);
      const overview = normalizar(m.overview);
      const genres = Array.isArray(m.genres) ? normalizar(m.genres.join(" ")) : "";
      return (
        title.includes(query) ||
        tagline.includes(query) ||
        overview.includes(query) ||
        genres.includes(query)
      );
    });
  }

  function money(n) {
    if (n === null || n === undefined) return "N/A";
    const num = Number(n);
    if (!isFinite(num) || num <= 0) return "N/A";
    return "$ " + num.toLocaleString("en-US");
  }

  function yearFromDate(dateStr) {
    if (!dateStr) return "N/A";
    const y = String(dateStr).slice(0,4);
    return /^\d{4}$/.test(y) ? y : "N/A";
  }

  function renderLista(arr) {
    lista.innerHTML = "";
    if (!arr.length) {
      lista.innerHTML = `<li class="list-group-item list-group-item-dark text-center">No se encontraron resultados.</li>`;
      return;
    }
    const frag = document.createDocumentFragment();
    arr.forEach((m, idx) => {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center list-group-item-action";
      li.tabIndex = 0;
      li.dataset.index = idx;
      li.innerHTML = `
        <div class="me-3">
          <div class="fw-bold text-light">${m.title ?? ""}</div>
          <div class="text-muted small">${m.tagline ?? ""}</div>
        </div>
        <div class="ms-auto">
          ${toStars(m.vote_average)}
        </div>
      `;
      li.addEventListener("click", () => mostrarOffcanvas(m));
      li.addEventListener("keypress", (e) => { if (e.key === "Enter") mostrarOffcanvas(m); });
      frag.appendChild(li);
    });
    lista.appendChild(frag);
  }

  function mostrarOffcanvas(m) {
    // Title & overview
    ocTitle.textContent = m.title ?? "";
    ocOverview.textContent = m.overview ?? "";
    // Genres as badges
    ocGenres.innerHTML = "";
    (m.genres || []).forEach(g => {
      const span = document.createElement("span");
      span.className = "badge text-bg-secondary me-1 mb-1";
      span.textContent = g;
      ocGenres.appendChild(span);
    });

    // Dropdown meta
    const y = yearFromDate(m.release_date);
    const runtime = m.runtime ? `${m.runtime} min` : "N/A";
    const budget = money(m.budget);
    const revenue = money(m.revenue);
    ddMeta.innerHTML = `
      <li><span class="dropdown-item"><strong>Año:</strong> ${y}</span></li>
      <li><span class="dropdown-item"><strong>Duración:</strong> ${runtime}</span></li>
      <li><hr class="dropdown-divider"></li>
      <li><span class="dropdown-item"><strong>Presupuesto:</strong> ${budget}</span></li>
      <li><span class="dropdown-item"><strong>Ganancias:</strong> ${revenue}</span></li>
    `;

    offcanvas && offcanvas.show();
  }

  // Buscar al hacer click o con Enter
  btnBuscar?.addEventListener("click", () => {
    const q = inputBuscar.value.trim();
    const resultados = filtrarPeliculas(q);
    renderLista(resultados);
  });
  inputBuscar?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      btnBuscar.click();
    }
  });
})();
