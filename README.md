# Maikini Knigi — Independent Bookshop

Website for Maikini Knigi ("Майкини книги", Mum's books), a small bookshop at ul. "Otets Paisiy" 18, Plovdiv.

- **Frontend** (this folder): plain HTML, CSS and JavaScript, no build step.
- **Backend** (`backend/`): Spring Boot API with PostgreSQL, Redis and Stripe. See [backend/README.md](backend/README.md).

## Run

1. Start the backend (see [backend/README.md](backend/README.md)); it listens on http://localhost:8080.
2. Serve this folder on port 5500 and open http://localhost:5500:

   ```sh
   python3 -m http.server 5500
   ```

The books, their prices and stock, the basket and checkout all come from the backend. If the backend runs
somewhere else, set its address in `js/config.js`.

## Structure

- `index.html` — page markup (hero, categories, shop, book of the month, about, newsletter, visit, footer, book dialog, basket, checkout)
- `css/styles.css` — all styles, responsive down to small phones; book covers are drawn in CSS
- `js/config.js` — backend address
- `js/main.js` — talks to the backend; also holds each book's author, category, cover and description
  (matched to the backend's books by title), search / category filter / sorting, opening hours

The newsletter form is front-end only.
