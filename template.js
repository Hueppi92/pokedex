const typeColors = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getType(pokemon) {
  return pokemon.types.map((t) => t.type.name);
}

function getBgStyle(types) {
  const colors = types.map((t) => typeColors[t] || "#F5F5F5");
  if (colors.length === 1) return colors;
  return `linear-gradient(135deg, ${colors.join(", ")})`;
}

function getPokemonCardTemplate(p) {
  const types = getType(p);
  const bgStyle = getBgStyle(types);
  const uid = p.id;

  return `
    <div class="card pokemon-card" 
         style="background: ${bgStyle};" 
         onclick="openDetails(${p.id})">
      <div class="card-info">
        <h4>#${uid} ${capitalize(p.name)}</h4>
        <img src="${p.sprites.front_default}" alt="${p.name}">
        <p>Type: ${types.map(capitalize).join(", ")}</p>
      </div>
    </div>
  `;
}

function getModalContentTemplate(
  p,
  genus,
  height,
  weight,
  img,
  statsList,
  attackList,
  abilitiesList
) {
  const speciesUrl = p.species?.url || "";
  return `
    <div style="display:flex;gap:12px; align-items:center;">
      <img src="${img}" alt="${
    p.name
  }" style="width:120px;height:120px;object-fit:contain;flex-shrink:0;">
      <div>
        <h3 style="margin:0 0 6px 0">#${p.id} ${capitalize(p.name)}</h3>
        <p style="margin:4px 0"><strong>Genus:</strong> ${
          genus || "Unknown"
        }</p>
        <p style="margin:4px 0"><strong>Height:</strong> ${height} &nbsp; <strong>Weight:</strong> ${weight}</p>
      </div>
    </div>
    <div class="card-tabs" style="margin-top:20px;">
      <nav>
        <a href="#" class="tablink active" id="tab-btn-stats-${
          p.id
        }" onclick="event.preventDefault(); showTab(${p.id}, 'stats')">Stats</a>
        <a href="#" class="tablink" id="tab-btn-desc-${
          p.id
        }" onclick="event.preventDefault(); showTab(${
    p.id
  }, 'desc')">Description</a>
        <a href="#" class="tablink" id="tab-btn-attack-${
          p.id
        }" onclick="event.preventDefault(); showTab(${
    p.id
  }, 'attack')">Attack</a>
   <a href="#" class="tablink" id="tab-btn-abilities-${
          p.id
        }" onclick="event.preventDefault(); showTab(${
    p.id
  }, 'abilities')">Abilities</a>
      </nav>
      <div class="tab-content">
        <div id="tab-stats-${
          p.id
        }" class="tab-pane active"><hr><ul>${statsList}</ul></div>
        <div id="tab-desc-${
          p.id
        }" class="tab-pane" data-loaded="false" data-species-url="${speciesUrl}"><hr><div class="desc-placeholder">Click to load description.</div></div>
        <div id="tab-attack-${
          p.id
        }" class="tab-pane"><hr><ul>${attackList}</ul></div>
          <div id="tab-abilities-${
          p.id
        }" class="tab-pane"><hr><ul>${abilitiesList}</ul></div>
      </div>
    </div>
    <div style="margin-top:20px; text-align:right;">
      
    </div>
  `;
}
