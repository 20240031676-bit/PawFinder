PawFinder Dog Breed Explorer

PawFinder is a full-stack-ready, responsive web application for the **Dogs** niche. It uses the public **Dog CEO API** to fetch real dog breed data and images with JavaScript `fetch()` and HTTP GET requests.

## Features

-  Search dog breeds
-  Browse the complete breed list
-  Generate a random dog
-  View a breed photo gallery
-  Save favorite dog photos using `localStorage`
-  Open gallery images in a lightbox
-  Loading/status feedback
-  API error handling
-  Responsive desktop and mobile design
-  No API key required for the public endpoints used

 API Used
Dog CEO API — an open collection of dog pictures with public REST endpoints.

Documentation: https://dog.ceo/dog-api/documentation/

Endpoints used by PawFinder include:

```text
GET https://dog.ceo/api/breeds/list/all
GET https://dog.ceo/api/breeds/image/random
GET https://dog.ceo/api/breed/{breed}/images/random
GET https://dog.ceo/api/breed/{breed}/images/random/{count}
GET https://dog.ceo/api/breed/{breed}/{sub-breed}/images/random
GET https://dog.ceo/api/breed/{breed}/{sub-breed}/images/random/{count}
```

The public endpoints used in this project do not require an API key, so no secret is committed to GitHub.

Technologies

- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API
- REST API / JSON
- LocalStorage
- GitHub
- Netlify

Project Structure

```text
pawfinder/
├── index.html
├── README.md
├── css/
│   └── style.css
└── js/
    └── app.js
```

Run Locally

Option 1 — VS Code Live Server

1. Download or clone this repository.
2. Open the folder in Visual Studio Code.
3. Install the **Live Server** extension if you do not already have it.
4. Right-click `index.html`.
5. Select **Open with Live Server**.

Option 2 — Python local server

If Python is installed, open a terminal inside the project folder and run:

```bash
python -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

Using a local server is recommended instead of opening the HTML file directly.

GitHub Setup

1. Create a new public repository named `pawfinder`.
2. Upload `index.html`, `README.md`, the `css` folder, and the `js` folder.
3. Commit the files to the `main` branch.
4. Copy your public repository URL for submission.

Example:

```text
https://github.com/YOUR-USERNAME/pawfinder
```

Netlify Deployment

Recommended: Deploy from GitHub

1. Log in to Netlify.
2. Choose **Add new project** → **Import an existing project**.
3. Select **GitHub**.
4. Authorize Netlify if prompted.
5. Select your `pawfinder` repository.
6. Because this is a plain static site, no build command is required.
7. Use the repository root as the publish directory.
8. Click **Deploy site**.
9. Netlify will provide a live `netlify.app` URL.

After GitHub and Netlify are connected, future pushes to the production branch can trigger new deployments automatically.

Alternative: Netlify Drop

You can also deploy without connecting GitHub:

1. Log in to Netlify.
2. Open Netlify Drop: https://app.netlify.com/drop
3. Drag the `pawfinder` project folder into the drop zone.
4. Wait for Netlify to publish the site.
5. Copy the generated `netlify.app` URL.

For the class submission, GitHub + Netlify connected deployment is recommended because your repository and live site remain easy to update.

API Key / Security

The Dog CEO public endpoints used by this application do not require an API key. Therefore, PawFinder does not contain a private API credential and there is no secret to commit or expose.

If a different API requiring a private key is used in a future version, the key should not be placed directly in frontend JavaScript. A serverless function or environment variable should be used instead.

Error Handling

The application checks the HTTP response and the API response status. If a request fails, the interface displays a user-friendly error message instead of leaving the page blank.

Interactive Features

The assignment requirement for user interaction is satisfied through multiple features:

1. Breed search input
2. Breed dropdown populated from API data
3. Random dog button
4. Breed gallery selection
5. Favorite/remove favorite actions
6. Image lightbox

Submission

Paste these two links into the Canvas assignment:

```text
GitHub Repository:
https://github.com/YOUR-USERNAME/pawfinder

Live App:
https://YOUR-SITE-NAME.netlify.app
```

Replace the placeholder URLs with your actual links after publishing.

Credits

Dog images/data: Dog CEO API — https://dog.ceo/dog-api/

Built as a student web API project for the Dogs niche.

Netlifly link:
https://endearing-buttercream-c35ef5.netlify.app
