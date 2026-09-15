PawFinder — Dog Breed Explorer

PawFinder is a web application for the **Dogs** niche built for the Free API Niche Challenge. It uses the public **Dog CEO API** to fetch real dog breed data and photos.

Live Demo & Repository
Live App**: [https://endearing-buttercream-c35ef5.netlify.app](https://endearing-buttercream-c35ef5.netlify.app/)
GitHub Repo**: [https://github.com/20240031676-bit/PawFinder](https://github.com/20240031676-bit/PawFinder)

Features
Breed Search & Filter**: Select or search from 100+ dog breeds.
Random Dog Generator**: Fetch a random dog image with a click.
Photo Gallery**: View multiple photos for a selected breed in a lightbox.
Favorites System**: Save favorite dog photos locally (`localStorage`).
Responsive Design**: Works on desktop and mobile devices.

 API & Authentication
API Used**: [Dog CEO API](https://dog.ceo/dog-api/documentation/)
Endpoints**:
  * `GET https://dog.ceo/api/breeds/list/all`
  * `GET https://dog.ceo/api/breeds/image/random`
  * `GET https://dog.ceo/api/breed/{breed}/images/random`
API Key**: No key required.

Tech Stack
* HTML5, CSS3, JavaScript (ES6+)
* Fetch API
* LocalStorage
* Netlify Hosting

 Run Locally
1. Clone or download this repository.
2. Open `index.html` in VS Code using the **Live Server** extension, or run a local Python server:
   ```bash
   python -m http.server 5500
