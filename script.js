const pokeContainer = document.getElementById("pokeContainer");
const BASE_URL = "https://pokeapi.co/api/v2/pokemon/";

let allPokemonCache = [];
let pokemons = [];
let limit = 20;
let offset = 0;



   
async function fetchPokemonDetails(entryUrl) {
  const detailRes = await fetch(entryUrl);
  return await detailRes.json();
}



async function fetchSpeciesData(speciesUrl) {
  if (!speciesUrl) return null;
  const response = await fetch(speciesUrl);
  return response.ok ? await response.json() : null;
}

async function initAllPokemon() {
  try {  
    const url = "https://pokeapi.co/api/v2/pokemon/?limit=1328&offset=0";
    const response = await fetch(url);
    const json = await response.json();
    allPokemonCache = json.results;
  } catch (e) {
    console.error("Fehler beim Laden der Suchliste", e);
  }
}

async function loadPokemon() {
  showLoadingSpinner();
  const response = await fetch(`${BASE_URL}?limit=${limit}&offset=${offset}`);
  if (!response.ok) {
    hideLoadingSpinner();
    throw new Error("Network response was not ok: " + response.statusText);  }
  const json = await response.json();
  for (let entry of json.results) {
    const detailData = await fetchPokemonDetails(entry.url);
    pokemons.push(detailData);
  }
  renderPokemon();
  hideLoadingSpinner();
  toggleLoadMoreButton(true);
}

function loadMorePokemon() {
  offset += 20;
  loadPokemon();
}

function renderPokemon(list = pokemons) {
  pokeContainer.innerHTML = "";
  for (let p of list) {
    pokeContainer.innerHTML += getPokemonCardTemplate(p);
  }
}

function showTab(uid, tabName) {
  const btns = ["stats", "desc", "attack", "abilities"]; 
   btns.forEach((b) => {
    const btn = document.getElementById(`tab-btn-${b}-${uid}`);
    const pane = document.getElementById(`tab-${b}-${uid}`);
    if (!btn || !pane) return;
    const isActive = b === tabName;
    btn.classList.toggle("active", isActive);
    pane.classList.toggle("active", isActive);
  });
  if (tabName === "desc") {
    lazyLoadDescription(uid);
  }
}
function lazyLoadDescription(uid) {
  const descPane = document.getElementById(`tab-desc-${uid}`);
  if (!descPane) return;

  if (descPane.getAttribute("data-loaded") === "false") {
    const speciesUrl = descPane.getAttribute("data-species-url");
    if (speciesUrl) {
      loadDescription(uid, speciesUrl);
    } else {
      descPane.innerHTML = `<div class="desc-placeholder">Keine Beschreibung verfügbar.</div>`;
      descPane.setAttribute("data-loaded", "true");
    }
  }
}

async function loadDescription(uid, speciesUrl) {
  const descPane = document.getElementById(`tab-desc-${uid}`);
  try {
    const speciesData = await fetchSpeciesData(speciesUrl);
    let descriptionText = "No description found.";
    if (speciesData && speciesData.flavor_text_entries) {
      const en = speciesData.flavor_text_entries.find((e) => e.language.name === "en");
      const entry = en || speciesData.flavor_text_entries[0];
      if (entry) descriptionText = entry.flavor_text.replace(/[\n\f]/g, " ");
    }
    descPane.innerHTML = `<hr><p>${descriptionText}</p>`;
    descPane.setAttribute("data-loaded", "true");
  } catch (error) {
    console.error("Error loading description:", error);
    descPane.innerHTML = `<div class="desc-placeholder">Fehler beim Laden.</div>`;
  }
}

async function openDetails(uid) {
  const overlay = document.getElementById("detail-modal-overlay");
  const body = document.getElementById("detail-body");
  overlay.classList.add("show");
  showLoadingSpinner();
  await loadDetailsForModal(uid);
  showTab(uid, "stats");
  hideLoadingSpinner();
}

function closeDetails() {
  const overlay = document.getElementById("detail-modal-overlay");
  if (overlay) overlay.classList.remove("show");
}

function handleOverlayClick(event) {
  if (event.target.id === "detail-modal-overlay") {
    closeDetails();
  }
}

function extractPokemonInfo(p, species) {
  const height = (p.height / 10).toFixed(1) + " m";
  const weight = (p.weight / 10).toFixed(1) + " kg";
  const img =
    p.sprites.other?.["official-artwork"]?.front_default ||
    p.sprites.front_default ||
    "";
  let genus = "";
  if (species && species.genera) {
    const en = species.genera.find((g) => g.language.name === "en");
    genus = (en || species.genera[0])?.genus || "";
  }
  return { height, weight, img, genus };
}

async function loadDetailsForModal(uid) {
  const body = document.getElementById("detail-body");
  let p = pokemons.find(x => x.id === uid);
    if (!p) {p = await fetchPokemonDetails(`${BASE_URL}${uid}/`);}
    if (!body || !p) {return body.innerHTML = "<p>Pokemon Daten nicht gefunden.</p>";}
  try {
    const data = await preparePokemonData(p);
    body.innerHTML = getModalContentTemplate(data);
    document.getElementById("detail-title").textContent = `Details for ${p.name}`;
  } catch (err) {
    console.error(err);
    body.innerHTML = "<p>Fehler beim Laden der Details.</p>";
  }
}

function showLoadingSpinner() {
  const spinner = document.getElementById("loadingSpinner");
  if (spinner) {
    spinner.style.display = "flex";
  }
}

function hideLoadingSpinner() {
  const spinner = document.getElementById("loadingSpinner");
  if (spinner) {
    spinner.style.display = "none";
  }
}

async function filterPokemon() {
  const searchInput = document.getElementById("searchInput");
  const searchTerm = searchInput.value.toLowerCase(); 
  if (searchTerm.length < 3) {
    offset = 0; 
    pokemons = [];
    loadPokemon(); 
    return;
  } 
  toggleLoadMoreButton(false);  
  const filteredEntries = allPokemonCache.filter((p) =>p.name.includes(searchTerm) || String(getTempId(p.url)).startsWith(searchTerm));  
  await renderSearchResults(filteredEntries.slice(0, 10));
}

async function renderSearchResults(entries) {
  showLoadingSpinner();
  const resultList = [];
  for (const entry of entries) {
    let existing = pokemons.find((p) => p.name === entry.name);
    if (existing) {
      resultList.push(existing);
    } else {
      const details = await fetchPokemonDetails(entry.url);
      resultList.push(details);
    }
  }
  renderPokemon(resultList);
  hideLoadingSpinner();
}

function getTempId(url) {
  const parts = url.split("/");
  return parts[parts.length - 2];
}

function toggleLoadMoreButton(show) {
  const buttonContainer = document.querySelector(".button-container");
  if (buttonContainer) {
    buttonContainer.style.display = show ? "flex" : "none";
  }
}

async function preparePokemonData(p) {
  const species = await fetchSpeciesData(p.species?.url);
  const { height, weight, img, genus } = extractPokemonInfo(p, species);
  const statsList = p.stats.map(s => `<li>${capitalize(s.stat.name)}: ${s.base_stat}</li>`).join("");
  const attackList = p.moves.slice(0, 6).map(m => `<li>${capitalize(m.move.name)}</li>`).join("");
  const abilitiesList = p.abilities.map(a => `<li>${capitalize(a.ability.name)} ${a.is_hidden ? '(Hidden)' : ''}</li>`).join("");
  return {
    p, genus, height, weight, img, statsList, attackList, abilitiesList
  };
}

initAllPokemon();
loadPokemon();
