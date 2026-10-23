/**
 * Application Controller - The Little Herb Garden Pro (app.js)
 * Modified by: Ruha
 * Manages SPA navigation, dynamic JSON loading, hero carousel, voice recognition, localStorage state, and interactive tools.
 */

let herbsData = [];
let favorites = JSON.parse(localStorage.getItem('herb_favorites') || '[]');
let growthProgress = JSON.parse(localStorage.getItem('herb_growth') || '{}');
let gardenLayout = JSON.parse(localStorage.getItem('garden_layout') || '{}');
let compareSelection = [];
let activeHerbId = null;

// Carousel State
let currentSlideIndex = 0;
let carouselInterval = null;

const herbFiles = [
  'data/basil.json',
  'data/spearmint.json',
  'data/rosemary.json',
  'data/thyme.json',
  'data/lavender.json',
  'data/sage.json',
  'data/chamomile.json',
  'data/chives.json'
];

// DOM Selectors
const navBtns = document.querySelectorAll('.nav-btn, [data-tab-switch], .brand');
const spaSections = document.querySelectorAll('.spa-section');
const herbsGrid = document.getElementById('herbs-grid');
const homeAllHerbsGrid = document.getElementById('home-all-herbs-grid');
const favoritesGrid = document.getElementById('favorites-grid');
const recipesGrid = document.getElementById('recipes-grid');
const calendarTbody = document.getElementById('calendar-tbody');
const herbSearchInput = document.getElementById('herb-search-input');
const pillBtns = document.querySelectorAll('.pill-btn');
const herbCount = document.getElementById('herb-count');
const favBadgeCount = document.getElementById('fav-badge-count');

// Carousel Selectors
const heroSlider = document.getElementById('hero-slider');
const sliderPrev = document.getElementById('slider-prev');
const sliderNext = document.getElementById('slider-next');
const sliderDots = document.getElementById('slider-dots');

// Voice Search Selectors
const voiceSearchBtn = document.getElementById('voice-search-btn');
const voiceStatusBar = document.getElementById('voice-status-bar');
const voiceStatusText = document.getElementById('voice-status-text');

// Detail Panel Elements
const detailPanel = document.getElementById('herb-detail-panel');
const detailCloseBtn = document.getElementById('detail-close-btn');
const detailImage = document.getElementById('detail-image');
const detailTitle = document.getElementById('detail-title');
const detailScientific = document.getElementById('detail-scientific');
const detailDesc = document.getElementById('detail-desc');
const detailBadge = document.getElementById('detail-badge');
const detailDiff = document.getElementById('detail-diff');
const detailAroma = document.getElementById('detail-aroma');
const detailSoil = document.getElementById('detail-soil');
const detailSun = document.getElementById('detail-sun');
const detailWater = document.getElementById('detail-water');
const detailSeason = document.getElementById('detail-season');
const detailFact = document.getElementById('detail-fact');
const detailCare = document.getElementById('detail-care');
const detailPairings = document.getElementById('detail-pairings');
const detailRecipes = document.getElementById('detail-recipes');
const detailFavBtn = document.getElementById('detail-fav-btn');
const detailCompareBtn = document.getElementById('detail-compare-btn');

// Tracker & Modals
const stageBtns = document.querySelectorAll('.stage-btn');
const trackerStatusText = document.getElementById('tracker-status-text');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const compareOpenBtn = document.getElementById('compare-open-btn');
const compareModal = document.getElementById('compare-modal');
const compareCloseBtn = document.getElementById('compare-close-btn');
const compareContent = document.getElementById('compare-content');

// Checker
const runCheckerBtn = document.getElementById('run-checker');
const checkSoilSelect = document.getElementById('check-soil');
const checkSunSelect = document.getElementById('check-sun');
const checkerResults = document.getElementById('checker-results');

/**
 * Initialize and load all JSON files asynchronously
 */
async function initApp() {
  try {
    const promises = herbFiles.map(file => fetch(file).then(res => {
      if (!res.ok) throw new Error(`Failed to load ${file}`);
      return res.json();
    }));
    herbsData = await Promise.all(promises);
    
    initHeroCarousel();
    renderAllHerbsOnHome();
    renderHerbsGrid(herbsData);
    renderFavorites();
    renderSeasonalCalendar();
    renderRecipes();
    initGardenPlanner();
    updateFavBadge();
  } catch (error) {
    console.error("Error loading herb data:", error);
    if (herbCount) herbCount.textContent = "Failed to load herb database.";
  }
}

/**
 * SPA Tab Navigation Switcher
 */
function switchTab(targetTab) {
  spaSections.forEach(section => section.classList.remove('active'));
  navBtns.forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });

  const activeSec = document.getElementById(`tab-${targetTab}`);
  if (activeSec) activeSec.classList.add('active');

  navBtns.forEach(btn => {
    if (btn.getAttribute('data-tab') === targetTab || btn.getAttribute('data-tab-switch') === targetTab) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    }
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.getAttribute('data-tab') || btn.getAttribute('data-tab-switch');
    if (tab) switchTab(tab);
  });
});

/**
 * Hero Carousel / Slider Implementation
 */
function initHeroCarousel() {
  if (!heroSlider) return;
  heroSlider.innerHTML = '';
  sliderDots.innerHTML = '';

  herbsData.forEach((herb, index) => {
    const slide = document.createElement('div');
    slide.className = 'slide-item';
    slide.innerHTML = `
      <div class="slide-text">
        <h2 class="slide-title">${herb.name}</h2>
        <p class="slide-sci">${herb.scientificName}</p>
        <p class="slide-desc">${herb.description}</p>
        <button class="btn-primary" onclick="switchTab('herbs'); openHerbDetail('${herb.id}')">Explore ${herb.name} →</button>
      </div>
      <div class="slide-image-col">
        <img src="${herb.image}" alt="${herb.name}" class="slide-img">
      </div>
    `;
    heroSlider.appendChild(slide);

    const dot = document.createElement('div');
    dot.className = `dot ${index === 0 ? 'active' : ''}`;
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    dot.setAttribute('aria-label', `Slide ${index + 1}: ${herb.name}`);
    dot.addEventListener('click', () => goToSlide(index));
    sliderDots.appendChild(dot);
  });

  startCarousel();

  const wrapper = document.querySelector('.hero-slider-wrapper');
  if (wrapper) {
    wrapper.addEventListener('mouseenter', stopCarousel);
    wrapper.addEventListener('mouseleave', startCarousel);
  }

  if (sliderPrev) sliderPrev.addEventListener('click', prevSlide);
  if (sliderNext) sliderNext.addEventListener('click', nextSlide);
}

function updateSliderPosition() {
  heroSlider.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
  const dots = sliderDots.querySelectorAll('.dot');
  dots.forEach((dot, idx) => {
    const isActive = idx === currentSlideIndex;
    dot.classList.toggle('active', isActive);
    dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
}

function goToSlide(index) {
  currentSlideIndex = index;
  updateSliderPosition();
}

function nextSlide() {
  currentSlideIndex = (currentSlideIndex + 1) % herbsData.length;
  updateSliderPosition();
}

function prevSlide() {
  currentSlideIndex = (currentSlideIndex - 1 + herbsData.length) % herbsData.length;
  updateSliderPosition();
}

function startCarousel() {
  stopCarousel();
  carouselInterval = setInterval(nextSlide, 4000);
}

function stopCarousel() {
  if (carouselInterval) clearInterval(carouselInterval);
}

/**
 * Render ALL herbs on the Home Tab index view
 */
function renderAllHerbsOnHome() {
  if (!homeAllHerbsGrid) return;
  homeAllHerbsGrid.innerHTML = '';
  herbsData.forEach(herb => {
    homeAllHerbsGrid.appendChild(createHerbCardElement(herb));
  });
}

/**
 * Render Full Herbs Grid with filters and search
 */
function renderHerbsGrid(dataToRender, filter = 'all', searchQuery = '') {
  if (!herbsGrid) return;
  herbsGrid.innerHTML = '';

  const filtered = dataToRender.filter(herb => {
    let matchesFilter = true;
    if (filter === 'annual') matchesFilter = herb.annualOrPerennial.toLowerCase() === 'annual';
    if (filter === 'perennial') matchesFilter = herb.annualOrPerennial.toLowerCase() === 'perennial';
    if (filter === 'easy') matchesFilter = herb.difficulty.toLowerCase() === 'easy';

    const q = searchQuery.toLowerCase();
    const matchesSearch = herb.name.toLowerCase().includes(q) ||
                          herb.scientificName.toLowerCase().includes(q) ||
                          herb.description.toLowerCase().includes(q) ||
                          (herb.uses && herb.uses.some(u => u.toLowerCase().includes(q))) ||
                          (herb.aromaLevel && herb.aromaLevel.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  if (herbCount) herbCount.textContent = `${filtered.length} herb${filtered.length === 1 ? '' : 's'} found.`;

  if (filtered.length === 0) {
    herbsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No matching herbs found.</p>`;
    return;
  }

  filtered.forEach(herb => {
    herbsGrid.appendChild(createHerbCardElement(herb));
  });
}

/**
 * Factory function to build an accessible Herb Card element
 */
function createHerbCardElement(herb) {
  const isFav = favorites.includes(herb.id);
  const isCompared = compareSelection.includes(herb.id);

  const card = document.createElement('article');
  card.className = 'herb-card';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `${herb.name}, ${herb.scientificName}. Press Enter to open details.`);

  card.innerHTML = `
    <div>
      <div class="card-top">
        <img src="${herb.image}" alt="${herb.name}" class="card-herb-img" width="70" height="70">
        <div>
          <h3 class="card-title">${herb.name}</h3>
          <p class="scientific-text">${herb.scientificName}</p>
        </div>
      </div>
      <p class="herb-desc">${herb.description}</p>
    </div>
    <div class="card-bottom">
      <span class="badge ${herb.annualOrPerennial}">${herb.annualOrPerennial}</span>
      <div class="card-actions-row" onclick="event.stopPropagation()">
        <button class="icon-action-btn fav-toggle-btn ${isFav ? 'is-fav' : ''}" data-id="${herb.id}" aria-label="Toggle favorite ${herb.name}">♥</button>
        <button class="icon-action-btn compare-toggle-btn ${isCompared ? 'is-fav' : ''}" data-id="${herb.id}" aria-label="Compare ${herb.name}" title="Compare">⚖</button>
      </div>
    </div>
  `;

  card.addEventListener('click', () => {
    switchTab('herbs');
    openHerbDetail(herb.id);
  });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      switchTab('herbs');
      openHerbDetail(herb.id);
    }
  });

  card.querySelector('.fav-toggle-btn').addEventListener('click', () => toggleFavorite(herb.id));
  card.querySelector('.compare-toggle-btn').addEventListener('click', () => toggleCompare(herb.id));

  return card;
}

/**
 * Open Herb Detail Panel (SPA same-page view)
 */
function openHerbDetail(herbId) {
  const herb = herbsData.find(h => h.id === herbId);
  if (!herb) return;
  activeHerbId = herbId;

  detailImage.src = herb.image;
  detailImage.alt = herb.name;
  detailTitle.textContent = herb.name;
  detailScientific.textContent = herb.scientificName;
  detailDesc.textContent = herb.description;
  detailBadge.textContent = herb.annualOrPerennial;
  detailBadge.className = `badge ${herb.annualOrPerennial}`;

  detailDiff.textContent = herb.difficulty;
  detailAroma.textContent = herb.aromaLevel;
  detailSoil.textContent = herb.soilTypes.join(', ');
  detailSun.textContent = herb.sunlight;
  detailWater.textContent = herb.watering;
  detailSeason.textContent = herb.season;

  detailFact.textContent = `💡 Fun Fact: ${herb.funFact}`;
  detailCare.textContent = `🌿 Care Tip: ${herb.careTip}`;
  detailPairings.textContent = herb.pairings ? herb.pairings.join(', ') : 'None';
  detailRecipes.textContent = herb.recipes ? herb.recipes[0] : 'None';

  const isFav = favorites.includes(herb.id);
  detailFavBtn.textContent = isFav ? '♥ Remove Favorite' : '♥ Add to Favorites';

  const currentStage = growthProgress[herb.id] || 'Seed';
  updateGrowthTrackerUI(currentStage);

  detailPanel.classList.remove('hidden');
  detailPanel.scrollIntoView({ behavior: 'smooth' });
}

if (detailCloseBtn) {
  detailCloseBtn.addEventListener('click', () => {
    detailPanel.classList.add('hidden');
    activeHerbId = null;
  });
}

// Growth Tracker Controls
stageBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (!activeHerbId) return;
    const stage = btn.getAttribute('data-stage');
    growthProgress[activeHerbId] = stage;
    localStorage.setItem('herb_growth', JSON.stringify(growthProgress));
    updateGrowthTrackerUI(stage);
  });
});

function updateGrowthTrackerUI(stage) {
  stageBtns.forEach(btn => {
    if (btn.getAttribute('data-stage') === stage) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  trackerStatusText.textContent = `Current growth stage: ${stage}`;
}

// Favorites Management
function toggleFavorite(herbId) {
  if (favorites.includes(herbId)) {
    favorites = favorites.filter(id => id !== herbId);
  } else {
    favorites.push(herbId);
  }
  localStorage.setItem('herb_favorites', JSON.stringify(favorites));
  updateFavBadge();
  renderFavorites();
  renderHerbsGrid(herbsData, getCurrentFilter(), herbSearchInput ? herbSearchInput.value : '');
  renderAllHerbsOnHome();
  if (activeHerbId === herbId) {
    const isFav = favorites.includes(herbId);
    detailFavBtn.textContent = isFav ? '♥ Remove Favorite' : '♥ Add to Favorites';
  }
}

function updateFavBadge() {
  if (favBadgeCount) favBadgeCount.textContent = favorites.length;
}

function renderFavorites() {
  if (!favoritesGrid) return;
  favoritesGrid.innerHTML = '';
  const favHerbs = herbsData.filter(h => favorites.includes(h.id));
  if (favHerbs.length === 0) {
    favoritesGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No favorite herbs saved yet.</p>`;
    return;
  }
  favHerbs.forEach(herb => {
    favoritesGrid.appendChild(createHerbCardElement(herb));
  });
}

if (detailFavBtn) {
  detailFavBtn.addEventListener('click', () => {
    if (activeHerbId) toggleFavorite(activeHerbId);
  });
}

// Comparison Tool
function toggleCompare(herbId) {
  if (compareSelection.includes(herbId)) {
    compareSelection = compareSelection.filter(id => id !== herbId);
  } else {
    if (compareSelection.length >= 2) {
      compareSelection.shift();
    }
    compareSelection.push(herbId);
  }
  updateCompareButtonState();
  renderHerbsGrid(herbsData, getCurrentFilter(), herbSearchInput ? herbSearchInput.value : '');
  renderAllHerbsOnHome();
}

function updateCompareButtonState() {
  if (!compareOpenBtn) return;
  compareOpenBtn.textContent = `Compare Selected (${compareSelection.length}/2)`;
  compareOpenBtn.disabled = compareSelection.length === 0;
}

if (compareOpenBtn) {
  compareOpenBtn.addEventListener('click', () => {
    if (compareSelection.length === 0) return;
    openCompareModal();
  });
}

function openCompareModal() {
  compareContent.innerHTML = '';
  compareSelection.forEach(id => {
    const herb = herbsData.find(h => h.id === id);
    if (!herb) return;
    const col = document.createElement('div');
    col.innerHTML = `
      <img src="${herb.image}" alt="${herb.name}" style="width:100%; height:160px; object-fit:cover; border-radius:8px;">
      <h3 style="color:var(--primary-green); margin-top:0.5rem;">${herb.name}</h3>
      <p style="font-style:italic; font-size:0.85rem; color:var(--text-muted);">${herb.scientificName}</p>
      <p style="margin-top:0.5rem; font-size:0.9rem;"><strong>Type:</strong> ${herb.annualOrPerennial}</p>
      <p style="font-size:0.9rem;"><strong>Difficulty:</strong> ${herb.difficulty}</p>
      <p style="font-size:0.9rem;"><strong>Aroma:</strong> ${herb.aromaLevel}</p>
      <p style="font-size:0.9rem;"><strong>Soil:</strong> ${herb.soilTypes.join(', ')}</p>
      <p style="font-size:0.9rem;"><strong>Sunlight:</strong> ${herb.sunlight}</p>
      <p style="font-size:0.9rem;"><strong>Watering:</strong> ${herb.watering}</p>
    `;
    compareContent.appendChild(col);
  });
  compareModal.classList.remove('hidden');
}

if (compareCloseBtn) {
  compareCloseBtn.addEventListener('click', () => compareModal.classList.add('hidden'));
}

if (detailCompareBtn) {
  detailCompareBtn.addEventListener('click', () => {
    if (activeHerbId) {
      toggleCompare(activeHerbId);
      openCompareModal();
    }
  });
}

// Search and Filter Listeners
function getCurrentFilter() {
  const activePill = document.querySelector('.pill-btn.active');
  return activePill ? activePill.getAttribute('data-filter') : 'all';
}

if (herbSearchInput) {
  herbSearchInput.addEventListener('input', (e) => {
    renderHerbsGrid(herbsData, getCurrentFilter(), e.target.value);
  });
}

pillBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    pillBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    renderHerbsGrid(herbsData, btn.getAttribute('data-filter'), herbSearchInput ? herbSearchInput.value : '');
  });
});

// Seasonal Calendar Tab
function renderSeasonalCalendar() {
  if (!calendarTbody) return;
  calendarTbody.innerHTML = '';
  herbsData.forEach(herb => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${herb.name}</strong></td>
      <td>${herb.season}</td>
      <td>Spring to Autumn</td>
      <td>${herb.careTip}</td>
    `;
    calendarTbody.appendChild(tr);
  });
}

// Recipes Tab
function renderRecipes() {
  if (!recipesGrid) return;
  recipesGrid.innerHTML = '';
  herbsData.forEach(herb => {
    if (herb.recipes) {
      herb.recipes.forEach(recipeName => {
        const card = document.createElement('article');
        card.className = 'recipe-card';
        card.innerHTML = `
          <h3>${recipeName}</h3>
          <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:0.5rem;">Featured Herb: <strong>${herb.name}</strong></p>
          <p style="font-size:0.92rem;">A delicious culinary preparation highlighting the aromatic flavor notes of ${herb.name}. Perfect for home cooks.</p>
        `;
        recipesGrid.appendChild(card);
      });
    }
  });
}

// Garden Layout Planner
function initGardenPlanner() {
  const toolbox = document.getElementById('toolbox-herbs');
  const plots = document.querySelectorAll('.garden-plot');
  const clearBtn = document.getElementById('clear-garden-btn');

  if (!toolbox) return;
  toolbox.innerHTML = '';

  herbsData.forEach(herb => {
    const item = document.createElement('div');
    item.className = 'toolbox-herb-item';
    item.draggable = true;
    item.textContent = `🌿 ${herb.name}`;
    item.setAttribute('data-herb-id', herb.id);

    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', herb.id);
    });
    toolbox.appendChild(item);
  });

  plots.forEach(plot => {
    const plotId = plot.getAttribute('data-plot-id');
    if (gardenLayout[plotId]) {
      const savedHerb = herbsData.find(h => h.id === gardenLayout[plotId]);
      if (savedHerb) {
        plot.textContent = `🌿 ${savedHerb.name}`;
        plot.classList.add('occupied');
      }
    }

    plot.addEventListener('dragover', (e) => {
      e.preventDefault();
      plot.classList.add('drag-over');
    });
    plot.addEventListener('dragleave', () => {
      plot.classList.remove('drag-over');
    });
    plot.addEventListener('drop', (e) => {
      e.preventDefault();
      plot.classList.remove('drag-over');
      const herbId = e.dataTransfer.getData('text/plain');
      const herb = herbsData.find(h => h.id === herbId);
      if (herb) {
        plot.textContent = `🌿 ${herb.name}`;
        plot.classList.add('occupied');
        gardenLayout[plotId] = herb.id;
        localStorage.setItem('garden_layout', JSON.stringify(gardenLayout));
      }
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      gardenLayout = {};
      localStorage.removeItem('garden_layout');
      plots.forEach((plot, index) => {
        plot.textContent = `Plot ${index + 1} (Empty)`;
        plot.classList.remove('occupied');
      });
    });
  }
}

// Soil & Water Compatibility Checker
if (runCheckerBtn) {
  runCheckerBtn.addEventListener('click', () => {
    const soil = checkSoilSelect.value;
    const sun = checkSunSelect.value;
    if (!soil && !sun) {
      checkerResults.textContent = "Please select at least one condition.";
      return;
    }
    const matches = herbsData.filter(herb => {
      let matchSoil = soil ? herb.soilTypes.includes(soil) : true;
      let matchSun = sun ? herb.sunlight.toLowerCase().includes(sun.toLowerCase()) : true;
      return matchSoil && matchSun;
    });
    if (matches.length > 0) {
      checkerResults.textContent = `Suitable herbs: ${matches.map(m => m.name).join(', ')}`;
    } else {
      checkerResults.textContent = "No herbs match exact conditions. Try broader settings.";
    }
  });
}

// Dark Mode Toggle
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });
}

/**
 * FIXED Voice Search Support (Web Speech API)
 * Allows voice commands: "Show me basil", "Find perennial herbs", etc.
 */
if (voiceSearchBtn) {
  voiceSearchBtn.addEventListener('click', () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    voiceSearchBtn.classList.add('listening');
    voiceStatusBar.classList.remove('hidden');
    voiceStatusText.textContent = "Listening... Say 'Show basil' or 'Find perennial'";

    recognition.start();

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript.toLowerCase();
      voiceStatusText.textContent = `Heard: "${speechToText}"`;
      
      setTimeout(() => {
        voiceStatusBar.classList.add('hidden');
        voiceSearchBtn.classList.remove('listening');
      }, 2500);

      switchTab('herbs');

      let filterToApply = 'all';
      if (speechToText.includes('annual')) filterToApply = 'annual';
      if (speechToText.includes('perennial')) filterToApply = 'perennial';
      if (speechToText.includes('easy')) filterToApply = 'easy';

      let cleanedQuery = speechToText.replace(/show|me|find|herbs|herb|search/g, '').trim();

      pillBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
        if (b.getAttribute('data-filter') === filterToApply) {
          b.classList.add('active');
          b.setAttribute('aria-selected', 'true');
        }
      });

      if (herbSearchInput) {
        herbSearchInput.value = cleanedQuery;
        renderHerbsGrid(herbsData, filterToApply, cleanedQuery);
      }
    };

    recognition.onerror = () => {
      voiceStatusText.textContent = "Voice search error or permission denied.";
      setTimeout(() => {
        voiceStatusBar.classList.add('hidden');
        voiceSearchBtn.classList.remove('listening');
      }, 2500);
    };

    recognition.onend = () => {
      voiceSearchBtn.classList.remove('listening');
    };
  });
}

// Run initialization on DOM load
document.addEventListener('DOMContentLoaded', initApp);
