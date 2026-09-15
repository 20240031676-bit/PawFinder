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

function populateBreedSelect(filter = "") {
  const normalized = filter.trim().toLowerCase();
  const options = ['<option value="">All Breeds</option>'];

  Object.entries(breeds).forEach(([breed, subBreeds]) => {
    const prettyBreed = prettify(breed);
    const mainMatches = breed.includes(normalized) || prettyBreed.toLowerCase().includes(normalized);
    if (subBreeds.length === 0) {
      if (!normalized || mainMatches) options.push(`<option value="${breed}">${prettyBreed}</option>`);
      return;
    }

    if (!normalized || mainMatches) options.push(`<option value="${breed}">${prettyBreed}</option>`);
    subBreeds.forEach(sub => {
      const full = `${sub} ${breed}`.toLowerCase();
      if (!normalized || mainMatches || full.includes(normalized)) {
        options.push(`<option value="${breed}/${sub}">${breedLabel(breed, sub)}</option>`);
      }
    });
  });

  els.breedSelect.innerHTML = options.join("");
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
  try {
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
  const query = event.target.value.trim().toLowerCase();
  if (!query) return loadRandomDog();
  const option = [...els.breedSelect.options].find(opt => opt.textContent.toLowerCase() === query)
    || [...els.breedSelect.options].find(opt => opt.textContent.toLowerCase().includes(query));
  if (option && option.value) {
    els.breedSelect.value = option.value;
    loadBreed(option.value);
  } else {
    setStatus(`No breed matching “${event.target.value}” was found.`, "error");
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
