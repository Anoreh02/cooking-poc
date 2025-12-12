// Data (Mock Database)
const RECIPES = [
  { 
    id: "1", 
    name: "Chicken Adobo", 
    cuisine: "Filipino", 
    difficulty: "Easy", 
    isHealthy: false,
    image: "images/adobo.jpg" 
  },
  { 
    id: "2", 
    name: "Sinigang na Baboy", 
    cuisine: "Filipino", 
    difficulty: "Medium", 
    isHealthy: true,
    image: "images/sinigang.jpg" 
  },
  { 
    id: "3", 
    name: "Sushi Roll", 
    cuisine: "Japanese", 
    difficulty: "Hard", 
    isHealthy: true,
    image: "images/sushi.jpg" 
  },
  { 
    id: "4", 
    name: "Ramen", 
    cuisine: "Japanese", 
    difficulty: "Medium", 
    isHealthy: false,
    image: "images/ramen.jpg" 
  },
  { 
    id: "5", 
    name: "Spaghetti Bolognese", 
    cuisine: "Italian", 
    difficulty: "Easy", 
    isHealthy: false,
    image: "images/spaghetti.jpg" 
  },
  { 
    id: "6", 
    name: "Margherita Pizza", 
    cuisine: "Italian", 
    difficulty: "Medium", 
    isHealthy: false,
    image: "images/pizza.jpg" 
  },
  { 
    id: "7", 
    name: "Chicken Curry", 
    cuisine: "Indian", 
    difficulty: "Medium", 
    isHealthy: true,
    image: "images/curry.jpg" 
  },
  { 
    id: "8", 
    name: "Chana Masala", 
    cuisine: "Indian", 
    difficulty: "Easy", 
    isHealthy: true,
    image: "images/chana.jpg" 
  }
];

// State Management
let cuisineCounts = {};
let inclusiveMode = true;

// DOM Elements
const recipesGrid = document.getElementById("recipesGrid");
const inclusiveToggle = document.getElementById("inclusiveToggle");
const resetBtn = document.getElementById("resetBtn");
const explanationPanel = document.getElementById("explanationPanel");
const explanationText = document.getElementById("explanationText");
const chipsContainer = document.getElementById("chipsContainer");

// Helper Functions
function getDominantCuisine() {
  let maxCount = 0;
  let dominant = null;
  for (const [cuisine, count] of Object.entries(cuisineCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominant = cuisine;
    }
  }
  return dominant;
}

function computeVisibleRecipes() {
  const dominantCuisine = getDominantCuisine();

  // Scenario 1: No learning yet (Cold Start) -> Show all
  if (!dominantCuisine) {
    return RECIPES.slice();
  }

  // Scenario 2: Aggressive Personalization (Mode OFF)
  // FILTER OUT anything that isn't the dominant cuisine
  if (!inclusiveMode) {
    return RECIPES.filter((r) => r.cuisine === dominantCuisine);
  }

  // Scenario 3: Inclusive Mode (Mode ON)
  // Show everything, but sort dominant to top to be helpful
  const dominant = [];
  const others = [];
  for (const r of RECIPES) {
    if (r.cuisine === dominantCuisine) {
      dominant.push(r);
    } else {
      others.push(r);
    }
  }
  return dominant.concat(others);
}

// Render Functions
function renderUI() {
  const dominantCuisine = getDominantCuisine();
  const visibleRecipes = computeVisibleRecipes();

  // 1. Update Explanation
  if (!dominantCuisine) {
    explanationPanel.classList.add("hidden");
  } else {
    explanationPanel.classList.remove("hidden");
    renderDebugChips();
    
    if (inclusiveMode) {
      explanationText.innerHTML = `
        Preference detected: <span class="highlight-text">${dominantCuisine}</span>. 
        <br>System is <strong style="color:var(--success)">highlighting</strong> matches but keeping options open.
      `;
    } else {
      explanationText.innerHTML = `
        Preference detected: <span class="highlight-text">${dominantCuisine}</span>. 
        <br>System has <strong style="color:red">hidden</strong> other cuisines (Echo Chamber).
      `;
    }
  }

  // 2. Render Grid
  recipesGrid.innerHTML = "";
  
  if(visibleRecipes.length === 0) {
    recipesGrid.innerHTML = `<p style="text-align:center; padding:20px; grid-column:span 2;">No recipes found.</p>`;
    return;
  }

  visibleRecipes.forEach((recipe) => {
    const isRecommended = dominantCuisine && recipe.cuisine === dominantCuisine;
    const card = document.createElement("div");
    
    // Add 'recommended' class if matches
    card.className = "recipe-card" + (inclusiveMode && isRecommended ? " recommended" : "");

    card.innerHTML = `
      <div class="image-wrapper">
        <img src="${recipe.image}" alt="${recipe.name}" class="recipe-image" loading="lazy" />
        ${isRecommended && inclusiveMode ? '<span class="rec-badge-overlay">Best Match</span>' : ''}
      </div>
      
      <div class="card-content">
        <div class="card-header">
          <span class="card-title">${recipe.name}</span>
        </div>
        
        <div class="card-meta">
          <div class="ingredient-item">• ${recipe.cuisine} | ${recipe.difficulty}</div>
          <div class="substitution-note">
            ${recipe.isHealthy ? 'Healthier option' : 'Comfort food'}
          </div>
        </div>
      </div>

      <div class="card-actions">
        <button class="action-button btn-primary" onclick="handleCook('${recipe.cuisine}')">
           Cook This
        </button>
      </div>
    `;

    recipesGrid.appendChild(card);
  });
}


// Interaction Handlers

window.handleCook = (cuisine) => {
  cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;
  renderUI();
};

function resetApp() {
  cuisineCounts = {};
  renderUI();
}

// Initialization
inclusiveToggle.addEventListener("change", () => {
  inclusiveMode = inclusiveToggle.checked;
  renderUI();
});

resetBtn.addEventListener("click", resetApp);

// Start
renderUI();