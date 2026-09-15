const API_BASE = "https://dog.ceo/api";
const FAVORITES_KEY = "pawfinderFavorites";

const els = {
  breedSearch: document.querySelector("#breedSearch"),
  breedSelect: document.querySelector("#breedSelect"),
  searchBtn: document.querySelector("#searchBtn"),
  randomBtn: document.querySelector("#randomBtn"),
  newPhotoBtn: document.querySelector("#newPhotoBtn"),
  galleryBtn: document.querySelector("#galleryBtn"),
  favoriteBtn: document.querySelector("#favoriteBtn"),
  featuredImage: document.querySelector("#featuredImage"),
  featuredBreed: document.querySelector("#featuredBreed"),
  featuredDescription: document.querySelector("#featuredDescription"),
  status: document.querySelector("#status"),
  gallery: document.querySelector("#gallery"),
  galleryTitle: document.querySelector("#galleryTitle"),
  gallerySubtitle: document.querySelector("#gallerySubtitle"),
  favoritesGrid: document.querySelector("#favoritesGrid"),
  favoriteCount: document.querySelector("#favoriteCount"),
  clearFavoritesBtn: document.querySelector("#clearFavoritesBtn"),
  lightbox: document.querySelector("#lightbox"),
  lightboxImage: document.querySelector("#lightboxImage"),
  closeLightbox: document.querySelector("#closeLightbox")
};

let breeds = {};
let currentDog = { image: "", breed: "" };
let favorites = loadFavorites();

function prettify(text) {
  return text
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
    setStatus(`${Object.keys(breeds).length} breeds loaded. Pick one or try a random dog.`, "success");
    await loadRandomDog(false);
  } catch (error) {
    setStatus("Could not load the dog breed list. Please check your connection and try again.", "error");
    console.error(error);
  }
}

function populateBreedSelect(filter = "") {
  const normalized = filter.trim().toLowerCase();
  const options = ['<option value="">Select a breed</option>'];

  Object.entries(breeds).forEach(([breed, subBreeds]) => {
    const mainMatches = breed.includes(normalized) || prettify(breed).toLowerCase().includes(normalized);
    if (subBreeds.length === 0) {
      if (!normalized || mainMatches) options.push(`<option value="${breed}">${prettify(breed)}</option>`);
      return;
    }

    if (!normalized || mainMatches) options.push(`<option value="${breed}">${prettify(breed)}</option>`);
    subBreeds.forEach(sub => {
      const full = `${sub} ${breed}`;
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
  const path = subBreed
    ? `/breed/${encodeURIComponent(breed)}/${encodeURIComponent(subBreed)}/images/random/${count}`
    : `/breed/${encodeURIComponent(breed)}/images/random/${count}`;
  return path;
}

function detectBreedFromUrl(url) {
  const match = url.match(/images\.dogs\.net\/[^/]+\/([a-z-]+)-([a-z-]+)\./i);
  if (!match) return "Random Dog";
  return prettify(`${match[1]}-${match[2]}`);
}

async function loadRandomDog(showStatus = true) {
  try {
    if (showStatus) setStatus("Finding a random dog...");
    const image = await apiGet("/breeds/image/random");
    currentDog = { image, breed: detectBreedFromUrl(image) };
    renderFeatured();
    if (showStatus) setStatus("Here is a fresh dog for you!", "success");
  } catch (error) {
    setStatus("Could not fetch a random dog. Please try again.", "error");
    console.error(error);
  }
}

async function loadBreed(value) {
  if (!value) return loadRandomDog();
  try {
    const label = breedLabel(...value.split("/").reverse());
    setStatus(`Finding ${label}...`);
    const image = await apiGet(imageUrlForBreed(value));
    currentDog = { image, breed: label };
    renderFeatured();
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
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []; }
  catch { return []; }
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  renderFavorites();
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

function clearFavorites() {
  if (!favorites.length) return;
  favorites = [];
  saveFavorites();
  updateFavoriteButton();
  setStatus("Favorites cleared.");
}

els.breedSearch.addEventListener("input", event => populateBreedSelect(event.target.value));
els.breedSearch.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    const selected = els.breedSelect.value;
    if (selected) loadBreed(selected);
  }
});
els.breedSelect.addEventListener("change", event => loadBreed(event.target.value));
els.searchBtn.addEventListener("click", () => {
  const query = els.breedSearch.value.trim().toLowerCase();
  if (!query) return loadRandomDog();
  populateBreedSelect(query);
  const option = [...els.breedSelect.options].find(opt => opt.textContent.toLowerCase() === query);
  if (option) {
    els.breedSelect.value = option.value;
    loadBreed(option.value);
  } else {
    const partial = [...els.breedSelect.options].find(opt => opt.textContent.toLowerCase().includes(query));
    if (partial && partial.value) {
      els.breedSelect.value = partial.value;
      loadBreed(partial.value);
    } else {
      setStatus(`No breed matching “${els.breedSearch.value}” was found.`, "error");
    }
  }
});
els.randomBtn.addEventListener("click", () => loadRandomDog());
els.newPhotoBtn.addEventListener("click", async () => {
  const value = els.breedSelect.value;
  if (value) return loadBreed(value);
  loadRandomDog();
});
els.galleryBtn.addEventListener("click", () => {
  const value = els.breedSelect.value;
  if (value) loadGallery(value, els.featuredBreed.textContent);
  document.querySelector(".gallery-section").scrollIntoView({ behavior: "smooth" });
});
els.favoriteBtn.addEventListener("click", toggleFavorite);
els.clearFavoritesBtn.addEventListener("click", clearFavorites);

els.gallery.addEventListener("click", event => {
  const card = event.target.closest("[data-image]");
  if (!card) return;
  openLightbox(card.dataset.image);
});
els.favoritesGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  favorites.splice(Number(button.dataset.remove), 1);
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

renderFavorites();
loadBreeds();
