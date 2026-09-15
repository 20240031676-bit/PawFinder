const API_BASE = "https://dog.ceo/api";
const FAVORITES_KEY = "pawfinder-favorites";

const els = {
  breedSearch: document.querySelector("#breedSearch"),
  breedSelect: document.querySelector("#breedSelect"),
  randomBtn: document.querySelector("#randomBtn"),
  sideRandomBtn: document.querySelector("#sideRandomBtn"),
  focusSearchBtn: document.querySelector("#focusSearchBtn"),
  searchBtn: document.querySelector("#randomBtn"),
  status: document.querySelector("#status"),
  heroDogImage: document.querySelector("#heroDogImage"),
  featuredImage: document.querySelector("#featuredImage"),
  featuredBreed: document.querySelector("#featuredBreed"),
  featuredDescription: document.querySelector("#featuredDescription"),
  favoriteBtn: document.querySelector("#favoriteBtn"),
  newPhotoBtn: document.querySelector("#newPhotoBtn"),
  galleryBtn: document.querySelector("#galleryBtn"),
  galleryTitle: document.querySelector("#galleryTitle"),
  gallerySubtitle: document.querySelector("#gallerySubtitle"),
  gallery: document.querySelector("#gallery"),
  popularBreeds: document.querySelector("#popularBreeds"),
  favoriteCount: document.querySelector("#favoriteCount"),
  favoritePreview: document.querySelector("#favoritePreview"),
  randomGallery: document.querySelector("#randomGallery"),
  favoritesGrid: document.querySelector("#favoritesGrid"),
  clearFavoritesBtn: document.querySelector("#clearFavoritesBtn"),
  showAllBtn: document.querySelector("#showAllBtn"),
  themeBtn: document.querySelector("#themeBtn"),
  lightbox: document.querySelector("#lightbox"),
  lightboxImage: document.querySelector("#lightboxImage"),
  closeLightbox: document.querySelector("#closeLightbox")
};

let breeds = {};
let currentDog = { image: "", breed: "Random Dog", value: "" };
let favorites = loadFavorites();

// Common breeds that may be missing from the Dog CEO breed list.
// These are searchable and clearly marked as "not available in the selected image API"
// instead of being silently omitted.
const COMMON_MISSING_BREEDS = [
  { name: "Cavalier King Charles Spaniel", aliases: ["cavalier", "cavalier king charles", "king charles", "ckcs"] },
  { name: "American Pit Bull Terrier", aliases: ["pit bull", "pitbull", "american pit bull", "apbt"] },
  { name: "American Staffordshire Terrier", aliases: ["amstaff", "american staffy", "american staffordshire"] },
  { name: "Australian Labradoodle", aliases: ["labradoodle"] },
  { name: "Goldendoodle", aliases: ["goldendoodle", "golden doodle"] },
  { name: "Cockapoo", aliases: ["cockapoo"] },
  { name: "Maltipoo", aliases: ["maltipoo"] },
  { name: "Bernedoodle", aliases: ["bernedoodle"] },
  { name: "Shih-Poo", aliases: ["shih poo", "shihpoo"] },
  { name: "Yorkipoo", aliases: ["yorkipoo"] },
  { name: "Chow Chow", aliases: ["chow", "chowchow"] },
  { name: "Belgian Malinois", aliases: ["malinois", "belgian malinois"] },
  { name: "Cane Corso", aliases: ["cane corso"] },
  { name: "Miniature Schnauzer", aliases: ["mini schnauzer", "miniature schnauzer"] },
  { name: "Giant Schnauzer", aliases: ["giant schnauzer"] },
  { name: "Standard Schnauzer", aliases: ["standard schnauzer"] },
  { name: "Papillon", aliases: ["papillon"] },
  { name: "Havanese", aliases: ["havanese"] },
  { name: "Lagotto Romagnolo", aliases: ["lagotto"] },
  { name: "Leonberger", aliases: ["leonberger"] },
  { name: "Newfoundland", aliases: ["newfoundland", "newfie"] },
  { name: "Old English Sheepdog", aliases: ["old english sheepdog", "oes"] },
  { name: "Samoyed", aliases: ["samoyed", "sammy"] }
];

function missingBreedScore(query, item) {
  const words = searchWords(query);
  if (!words.length) return 0;

  const aliasText = item.aliases.join(" ");
  const searchable = normalizeSearch(`${item.name} ${aliasText}`);
  const matches = words.every(word => wordMatches(word, searchable));
  if (!matches) return -1;

  const normalizedName = normalizeSearch(item.name);
  const fullQuery = words.join(" ");
  let score = 0;

  if (normalizedName === fullQuery) score += 120;
  if (normalizedName.startsWith(fullQuery)) score += 60;
  if (searchable.includes(fullQuery)) score += 35;

  words.forEach(word => {
    if (searchable.includes(word)) score += 10;
  });

  return score;
}

function prettify(text = "") {
  return text.split("-").map(part => part ? part.charAt(0).toUpperCase() + part.slice(1) : "").join(" ");
}

function breedLabel(breed, subBreed = "") {
  return subBreed ? `${prettify(subBreed)} ${prettify(breed)}` : prettify(breed);
}

function setStatus(message = "", type = "") {
  els.status.textContent = message;
  els.status.className = `status ${type}`.trim();
}

async function apiGet(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
  const data = await response.json();
  if (data.status !== "success") throw new Error(data.message || "API returned an error.");
  return data.message;
}

async function loadBreeds() {
  try {
    setStatus("Loading dog breeds...");
    breeds = await apiGet("/breeds/list/all");
    populateBreedSelect();
    renderPopularBreeds();
    await loadRandomDog(false);
    setStatus(`${Object.keys(breeds).length} breeds loaded. Pick one or try a random dog.`, "success");
    await loadRandomGallery();
  } catch (error) {
    setStatus("Could not load the dog breed list. Please check your connection and try again.", "error");
    console.error(error);
  }
}

function normalizeSearch(text = "") {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function searchWords(text = "") {
  return normalizeSearch(text).split(/\s+/).filter(Boolean);
}

function editDistance(a, b) {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const previous = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i++) {
    let current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = a[i - 1] === b[j - 1]
        ? previous[j - 1]
        : Math.min(previous[j - 1] + 1, previous[j] + 1, current[j - 1] + 1);
    }
    for (let j = 0; j <= b.length; j++) previous[j] = current[j];
  }

  return previous[b.length];
}

function wordMatches(word, text) {
  if (!word) return true;
  if (text.includes(word)) return true;

  // Allow small spelling mistakes: e.g. "golden retriver" or "sheperd".
  const candidates = text.split(" ");
  return candidates.some(candidate => {
    if (candidate.length < 4 || word.length < 4) return false;
    const limit = word.length >= 7 ? 2 : 1;
    return editDistance(word, candidate) <= limit;
  });
}

function getBreedSearchScore(query, breed, subBreed = "") {
  const words = searchWords(query);
  if (!words.length) return 0;

  const label = normalizeSearch(breedLabel(breed, subBreed));
  const breedText = normalizeSearch(breed);
  const subText = normalizeSearch(subBreed);
  const searchable = `${label} ${breedText} ${subText}`.trim();

  // Common shortcuts make the search feel more natural.
  const aliases = {
    lab: "labrador",
    labs: "labrador",
    shep: "shepherd",
    shepard: "shepherd",
    pom: "pomeranian",
    chi: "chihuahua",
    doberman: "dobermann",
    staffy: "staffordshire",
    staffie: "staffordshire"
  };

  const expandedWords = words.map(word => aliases[word] || word);
  const matches = expandedWords.every(word => wordMatches(word, searchable));
  if (!matches) return -1;

  let score = 0;
  const fullQuery = expandedWords.join(" ");

  if (label === fullQuery) score += 100;
  if (label.startsWith(fullQuery)) score += 50;
  if (searchable.includes(fullQuery)) score += 30;

  expandedWords.forEach(word => {
    if (breedText.includes(word)) score += 12;
    if (subText.includes(word)) score += 12;
    if (label.includes(word)) score += 8;
  });

  return score;
}

function getBreedOptions(filter = "") {
  const options = [];

  Object.entries(breeds).forEach(([breed, subBreeds]) => {
    const mainScore = getBreedSearchScore(filter, breed);

    if (subBreeds.length === 0) {
      if (!filter.trim() || mainScore >= 0) {
        options.push({
          value: breed,
          label: prettify(breed),
          score: filter.trim() ? mainScore : 0,
          available: true
        });
      }
      return;
    }

    if (!filter.trim() || mainScore >= 0) {
      options.push({
        value: breed,
        label: prettify(breed),
        score: filter.trim() ? mainScore + 2 : 0,
        available: true
      });
    }

    subBreeds.forEach(sub => {
      const score = getBreedSearchScore(filter, breed, sub);
      if (!filter.trim() || score >= 0) {
        options.push({
          value: `${breed}/${sub}`,
          label: breedLabel(breed, sub),
          score: filter.trim() ? score : 0,
          available: true
        });
      }
    });
  });

  // Add common breeds that are not represented by Dog CEO.
  COMMON_MISSING_BREEDS.forEach(item => {
    const score = missingBreedScore(filter, item);
    if (!filter.trim() || score >= 0) {
      options.push({
        value: `missing:${encodeURIComponent(item.name)}`,
        label: `${item.name} — API image unavailable`,
        score: filter.trim() ? score : -1,
        available: false,
        missingName: item.name
      });
    }
  });

  if (filter.trim()) {
    options.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
  } else {
    options.sort((a, b) => a.label.replace(" — API image unavailable", "").localeCompare(
      b.label.replace(" — API image unavailable", "")
    ));
  }

  return options;
}

function populateBreedSelect(filter = "") {
  const options = getBreedOptions(filter);
  const filterText = filter.trim();

  const availableCount = options.filter(option => option.available).length;
  const missingCount = options.length - availableCount;

  els.breedSelect.innerHTML = [
    `<option value="">${filterText ? `${options.length} matches (${availableCount} available)` : "All Breeds"}</option>`,
    ...options.map(option => {
      const safeValue = option.value.replace(/"/g, "&quot;");
      const unavailable = option.available ? "" : " — not in Dog CEO";
      return `<option value="${safeValue}" ${option.available ? "" : "data-unavailable=\"true\""}>${option.available ? option.label : `${option.missingName} — image unavailable`}</option>`;
    })
  ].join("");

  // Keep the count available for status messaging.
  if (filterText && missingCount > 0) {
    setStatus(`${options.length} matches found. ${missingCount} common breed(s) are recognized but not available in the Dog CEO image API.`, "success");
  }
}

function parseBreedValue(value) {
  const [breed, subBreed] = value.split("/");
  return { breed, subBreed };
}

function imageUrlForBreed(value) {
  const { breed, subBreed } = parseBreedValue(value);
  return subBreed
    ? `/breed/${encodeURIComponent(breed)}/${encodeURIComponent(subBreed)}/images/random`
    : `/breed/${encodeURIComponent(breed)}/images/random`;
}

function imagesUrlForBreed(value, count = 8) {
  const { breed, subBreed } = parseBreedValue(value);
  return subBreed
    ? `/breed/${encodeURIComponent(breed)}/${encodeURIComponent(subBreed)}/images/random/${count}`
    : `/breed/${encodeURIComponent(breed)}/images/random/${count}`;
}

function detectBreedFromUrl(url) {
  const match = url.match(/\/breeds\/([^/]+)\/([^/]+)\.(?:jpg|jpeg|png|webp)/i);
  if (!match) return "Random Dog";
  const breed = match[1];
  const subBreed = match[2].split("-").slice(0, -1).join("-");
  if (subBreed) return breedLabel(breed, subBreed);
  return prettify(breed);
}

async function loadRandomDog(showStatus = true) {
  try {
    if (showStatus) setStatus("Finding a random dog...");
    const image = await apiGet("/breeds/image/random");
    currentDog = { image, breed: detectBreedFromUrl(image), value: "" };
    els.favoriteBtn.disabled = false;
    els.featuredImage.classList.remove("image-unavailable");
    renderFeatured();
    els.heroDogImage.src = image;
    if (showStatus) setStatus("Here is a fresh dog for you!", "success");
  } catch (error) {
    setStatus("Could not fetch a random dog. Please try again.", "error");
    console.error(error);
  }
}

async function loadBreed(value) {
  if (!value) return loadRandomDog();

  // Recognized common breed, but not represented by Dog CEO.
  if (value.startsWith("missing:")) {
    const missingName = decodeURIComponent(value.slice("missing:".length));

    currentDog = { image: "", breed: missingName, value };
    els.featuredImage.removeAttribute("src");
    els.featuredImage.classList.add("image-unavailable");
    els.featuredImage.alt = `${missingName} image unavailable`;
    els.featuredBreed.textContent = missingName;
    els.featuredDescription.textContent =
      `${missingName} is recognized by PawFinder, but the Dog CEO API does not currently provide an image collection for this breed. Try another breed or use Random Dog.`;

    els.galleryTitle.textContent = `${missingName} — API Unavailable`;
    els.gallerySubtitle.textContent =
      "The breed is recognized, but Dog CEO does not currently provide images for it.";

    els.gallery.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🐾</div>
        <h3>Breed recognized</h3>
        <p>PawFinder found <strong>${missingName}</strong>, but this breed is not available in the selected image API.</p>
      </div>
    `;

    els.favoriteBtn.disabled = true;
    setStatus(
      `${missingName} is recognized, but its images are unavailable from Dog CEO.`,
      "error"
    );
    return;
  }

  try {
    els.favoriteBtn.disabled = false;
    els.featuredImage.classList.remove("image-unavailable");

    const { breed, subBreed } = parseBreedValue(value);
    const label = breedLabel(breed, subBreed);

    setStatus(`Finding ${label}...`);

    const image = await apiGet(imageUrlForBreed(value));

    currentDog = { image, breed: label, value };
    renderFeatured();
    els.heroDogImage.src = image;

    await loadGallery(value, label);
    setStatus(`${label} is ready to explore.`, "success");
  } catch (error) {
    setStatus("Could not load that breed. Please try another one.", "error");
    console.error(error);
  }
}

async function loadGallery(value, label = "Selected breed") {
  if (!value) return;
  els.galleryTitle.textContent = `${label} Gallery`;
  els.gallerySubtitle.textContent = "Click a photo to view it larger.";
  els.gallery.innerHTML = '<div class="empty-gallery">🐾 Loading photos...</div>';
  try {
    const images = await apiGet(imagesUrlForBreed(value, 8));
    renderGallery(images);
  } catch (error) {
    els.gallery.innerHTML = '<div class="empty-gallery">We could not load this gallery. Try again.</div>';
    console.error(error);
  }
}

function renderGallery(images) {
  els.gallery.innerHTML = images.map((image, index) => `
    <button class="gallery-card" type="button" data-image="${image}" aria-label="Open dog photo ${index + 1}">
      <img src="${image}" alt="Dog photo ${index + 1}" loading="lazy">
    </button>
  `).join("");
}

function renderFeatured() {
  els.featuredImage.src = currentDog.image;
  els.featuredImage.alt = `${currentDog.breed} dog`;
  els.featuredBreed.textContent = currentDog.breed;
  els.featuredDescription.textContent = `Discover more photos of ${currentDog.breed}. Add this photo to your favorites if you like it.`;
  updateFavoriteButton();
}

function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  renderFavorites();
  renderFavoritePreview();
}

function isFavorite(image) {
  return favorites.some(item => item.image === image);
}

function toggleFavorite() {
  if (!currentDog.image) return;
  if (isFavorite(currentDog.image)) {
    favorites = favorites.filter(item => item.image !== currentDog.image);
    setStatus("Removed from favorites.");
  } else {
    favorites.unshift({ ...currentDog, savedAt: Date.now() });
    setStatus("Added to favorites! ❤️", "success");
  }
  saveFavorites();
  updateFavoriteButton();
}

function updateFavoriteButton() {
  const active = isFavorite(currentDog.image);
  els.favoriteBtn.classList.toggle("active", active);
  els.favoriteBtn.textContent = active ? "♥" : "♡";
  els.favoriteBtn.setAttribute("aria-label", active ? "Remove from favorites" : "Add current dog to favorites");
}

function renderFavorites() {
  els.favoriteCount.textContent = favorites.length;
  els.clearFavoritesBtn.hidden = favorites.length === 0;
  if (!favorites.length) {
    els.favoritesGrid.innerHTML = '<div class="empty-favorites">❤️ No favorites yet. Find a dog you love and click the heart.</div>';
    return;
  }
  els.favoritesGrid.innerHTML = favorites.map((item, index) => `
    <article class="favorite-card">
      <img src="${item.image}" alt="${item.breed} dog" loading="lazy">
      <div class="favorite-card-body">
        <strong>${item.breed}</strong>
        <button class="remove-favorite" type="button" data-remove="${index}">Remove</button>
      </div>
    </article>
  `).join("");
}

function renderFavoritePreview() {
  if (!favorites.length) {
    els.favoritePreview.innerHTML = '<div class="empty-mini">No favorites yet. Tap the heart on a dog you love.</div>';
    return;
  }
  els.favoritePreview.innerHTML = favorites.slice(0, 3).map((item, index) => `
    <div class="favorite-preview-item">
      <img src="${item.image}" alt="${item.breed}" loading="lazy">
      <strong>${item.breed}</strong>
      <button type="button" data-preview-remove="${index}" aria-label="Remove favorite">×</button>
    </div>
  `).join("");
}

async function renderPopularBreeds() {
  const preferred = ["retriever/golden", "husky", "bulldog/french", "german/shepherd"];
  const valid = preferred.filter(value => {
    const [breed, sub] = value.split("/");
    return breeds[breed] && (!sub || breeds[breed].includes(sub));
  });
  const fallback = Object.keys(breeds).slice(0, 4).map(breed => breed);
  const choices = valid.length ? valid : fallback;
  els.popularBreeds.innerHTML = choices.map(value => `
    <button class="breed-card" type="button" data-breed-value="${value}">
      <img src="" data-breed-image="${value}" alt="${breedLabel(...value.split("/").reverse())} dog" loading="lazy">
      <div><span>${breedLabel(...value.split("/").reverse())}</span><span>🐾</span></div>
    </button>
  `).join("");

  await Promise.all([...els.popularBreeds.querySelectorAll("img[data-breed-image]")].map(async img => {
    try {
      img.src = await apiGet(imageUrlForBreed(img.dataset.breedImage));
    } catch {
      img.closest(".breed-card").style.display = "none";
    }
  }));
}

async function loadRandomGallery() {
  try {
    const images = await apiGet("/breeds/image/random/6");
    els.randomGallery.innerHTML = images.map((image, index) => `
      <button type="button" data-image="${image}" aria-label="Open random dog ${index + 1}">
        <img src="${image}" alt="Random dog" loading="lazy">
      </button>
    `).join("");
  } catch {
    els.randomGallery.innerHTML = '<div class="empty-mini">Gallery unavailable.</div>';
  }
}

function clearFavorites() {
  if (!favorites.length) return;
  favorites = [];
  saveFavorites();
  updateFavoriteButton();
  setStatus("Favorites cleared.");
}

els.breedSearch.addEventListener("input", event => populateBreedSelect(event.target.value));
els.breedSearch.addEventListener("keydown", event => {
  if (event.key !== "Enter") return;

  const query = event.target.value.trim();
  if (!query) return loadRandomDog();

  const options = getBreedOptions(query);
  const best = options[0];

  if (best) {
    els.breedSelect.value = best.value;
    loadBreed(best.value);
    setStatus(`Showing ${best.label}.`, "success");
  } else {
    setStatus(`No breed matching “${query}” was found. Try a shorter name or a different spelling.`, "error");
  }
});
els.breedSelect.addEventListener("change", event => loadBreed(event.target.value));
els.randomBtn.addEventListener("click", () => loadRandomDog());
els.sideRandomBtn.addEventListener("click", () => loadRandomDog());
els.focusSearchBtn.addEventListener("click", () => {
  els.breedSearch.focus();
  els.breedSearch.scrollIntoView({ behavior: "smooth", block: "center" });
});
els.newPhotoBtn.addEventListener("click", () => {
  if (currentDog.value) loadBreed(currentDog.value);
  else loadRandomDog();
});
els.galleryBtn.addEventListener("click", () => {
  document.querySelector(".gallery-section").scrollIntoView({ behavior: "smooth" });
  if (currentDog.value) loadGallery(currentDog.value, currentDog.breed);
});
els.favoriteBtn.addEventListener("click", toggleFavorite);
els.clearFavoritesBtn.addEventListener("click", clearFavorites);
els.showAllBtn.addEventListener("click", () => {
  els.breedSearch.value = "";
  populateBreedSelect();
  els.breedSelect.focus();
  setStatus("All breeds are available in the selector.", "success");
});

els.popularBreeds.addEventListener("click", event => {
  const card = event.target.closest("[data-breed-value]");
  if (!card) return;
  els.breedSelect.value = card.dataset.breedValue;
  loadBreed(card.dataset.breedValue);
  document.querySelector(".featured").scrollIntoView({ behavior: "smooth", block: "center" });
});

els.gallery.addEventListener("click", event => {
  const card = event.target.closest("[data-image]");
  if (card) openLightbox(card.dataset.image);
});
els.randomGallery.addEventListener("click", event => {
  const card = event.target.closest("[data-image]");
  if (card) openLightbox(card.dataset.image);
});
els.favoritesGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  favorites.splice(Number(button.dataset.remove), 1);
  saveFavorites();
  updateFavoriteButton();
});
els.favoritePreview.addEventListener("click", event => {
  const button = event.target.closest("[data-preview-remove]");
  if (!button) return;
  favorites.splice(Number(button.dataset.previewRemove), 1);
  saveFavorites();
  updateFavoriteButton();
});

function openLightbox(image) {
  els.lightboxImage.src = image;
  els.lightbox.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  els.lightbox.hidden = true;
  els.lightboxImage.src = "";
  document.body.style.overflow = "";
}
els.closeLightbox.addEventListener("click", closeLightbox);
els.lightbox.addEventListener("click", event => { if (event.target === els.lightbox) closeLightbox(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeLightbox(); });

let warmMode = false;
els.themeBtn.addEventListener("click", () => {
  warmMode = !warmMode;
  document.body.classList.toggle("warm-mode", warmMode);
  els.themeBtn.textContent = warmMode ? "☼" : "◐";
});

renderFavorites();
renderFavoritePreview();
loadBreeds();
