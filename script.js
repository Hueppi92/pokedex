const pokeContainer = document.getElementById("pokeContainer");
const loadingSpinner = document.getElementById("loadingSpinner");
let allPokemons = [];
let displayedCount = 20;

// 1. Generation IDs
const generationRanges = { 1: [1, 151] };

// Pokémon einer Generation laden (super simple)
async function loadPokemonsOfGeneration(gen = 1) {
  const [start, end] = generationRanges[gen];

  loadingSpinner.style.display = "block";

  for (let i = start; i <= end; i++) {
    try {
      const resp = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
      const pokemon = await resp.json();
      allPokemons.push(pokemon);

      // Direkt rendern, nur die ersten 20 anzeigen
      renderPokemons(allPokemons.slice(0, displayedCount));
    } catch (err) {
      console.log("Pokémon nicht gefunden:", i);
    }
  }

  loadingSpinner.style.display = "none";
}

function renderPokemons(list) {
  pokeContainer.innerHTML = list.map(p => `
    <div class="card">
      <h5>#${p.id} ${p.name}</h5>
      <img src="${p.sprites.front_default || ''}" alt="${p.name}">
    </div>
  `).join('');
}

// Initialer Aufruf
loadPokemonsOfGeneration();
