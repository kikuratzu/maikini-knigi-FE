# Maikini Knigi — Independent Bookshop

Front-end design for Maikini Knigi ("Майкини книги", Mum's books), a small bookshop at
ul. "Otets Paisiy" 18, Plovdiv. Plain HTML, CSS and JavaScript, with no build step and no dependencies.

## Run

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

## Structure

- `index.html` — page markup (hero, categories, shop, book of the month, about, newsletter, visit, footer, book dialog, basket)
- `css/styles.css` — all styles, responsive down to small phones; book covers are drawn in CSS
- `js/main.js` — book data, search / category filter / sorting, book details dialog, basket (saved in `localStorage`), open-now status (Europe/Sofia time), newsletter validation

Prices are in euro. Checkout and the newsletter form are front-end only: nothing is sent to a server.
