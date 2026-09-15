# 🐾 PawFinder — Dog Breed Explorer

PawFinder is a student-built full-stack-ready web application for the **Dogs** API niche challenge. It consumes real dog image data from the **Dog CEO API** using JavaScript `fetch()` and HTTP GET requests.

## ✨ Features

- 🐶 Random dog generator
- 🔎 Interactive breed search
- 🐾 Breed dropdown populated from the API
- 🖼️ Breed-specific photo galleries
- ⭐ Popular breed cards
- ❤️ Favorite dog collection using `localStorage`
- 🔍 Image lightbox for larger photos
- ⏳ Loading and error messages
- 📱 Responsive mobile-friendly design
- 🪟 Glassmorphism UI with frosted-glass cards and orange accents
- 🌗 Small appearance toggle for an alternate warm glass theme

## 🌐 API Used

**Dog CEO API**

Documentation: https://dog.ceo/dog-api/documentation/

The public endpoints used by PawFinder do **not require an API key**, so no secret key is stored in this repository.

### Main GET endpoints used

```text
GET https://dog.ceo/api/breeds/list/all
GET https://dog.ceo/api/breeds/image/random
GET https://dog.ceo/api/breeds/image/random/6
GET https://dog.ceo/api/breed/{breed}/images/random
GET https://dog.ceo/api/breed/{breed}/images/random/8
```

## 🛠️ Technologies

- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API
- REST API / HTTP GET
- LocalStorage
- Google Fonts
- GitHub
- Netlify

## 📁 Project Structure

```text
pawfinder/
├── index.html
├── README.md
├── .gitignore
├── css/
│   └── style.css
└── js/
    └── app.js
```

## ▶️ Run Locally

1. Download or clone this repository.
2. Open the project folder in VS Code.
3. Use **Live Server** or another local HTTP server.
4. Open the generated local URL in your browser.
5. Test Random Dog, breed search, galleries, and favorites.

A local server is recommended instead of opening the HTML file directly so browser behavior is consistent with deployment.

## 🚀 Deploy to Netlify

### Method 1 — GitHub connection (recommended)

1. Create a public GitHub repository named `pawfinder`.
2. Upload all files in this folder.
3. Log in to Netlify.
4. Select **Add new project → Import an existing project**.
5. Choose **GitHub** and authorize your account if requested.
6. Select the `pawfinder` repository.
7. Leave the build command blank.
8. Set the publish directory to the project root (`.`).
9. Click **Deploy site**.
10. Wait for Netlify to generate the live URL.

### Method 2 — Drag and Drop

You can also deploy the project folder directly through Netlify's manual deploy interface.

## 🔐 API Key Handling

No API key is required for the public Dog CEO endpoints used in this project. Therefore, there is no secret credential to commit or expose.

If a future version uses an API that requires a private key, the key should be stored in a serverless function or environment variable rather than committed to frontend JavaScript.

## 📋 Assignment Submission

Submit both links in Canvas:

```text
GitHub Repository:
https://github.com/YOUR-USERNAME/pawfinder

Live App:
https://YOUR-SITE-NAME.netlify.app
```

Replace the placeholders with your real links after deployment.

## 👨‍💻 Student Project

Built as an individual API niche challenge project for the Dogs category.


## Missing/Common Breed Recognition

PawFinder also includes a small local catalog of common breeds that may not currently
exist in the Dog CEO API. These breeds remain searchable (for example, **Cavalier King
Charles Spaniel**) and are labeled as unavailable when the selected API has no image
collection for them. The app does not pretend that a random image belongs to a breed
when the API cannot verify it.

This demonstrates graceful handling of API coverage limitations while keeping the
Dog CEO API as the primary data source.


## Missing/Common Breed Recognition

PawFinder recognizes a local list of common breeds that may not currently exist in
the Dog CEO API. For example, **Cavalier King Charles Spaniel** can be searched using
`cavalier`, `cavalier king charles`, `king charles`, or `ckcs`.

When a recognized breed has no Dog CEO image collection, PawFinder clearly tells the
user that the breed is recognized but its images are unavailable. It does not label
an unrelated random image as that breed.
