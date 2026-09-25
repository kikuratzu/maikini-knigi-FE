/* =========================================================
   Maikini Knigi — Independent bookshop
   Talks to the Spring Boot backend in /backend (books, basket, orders).
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Settings ---------- */
  // Backend address: js/config.js can set window.MAIKINI_API_BASE; otherwise the backend is
  // expected on port 8080 of the same host that serves this page.
  var API_BASE = (window.MAIKINI_API_BASE ||
    (/^https?:$/.test(location.protocol) ? location.protocol + "//" + location.hostname + ":8080" : "http://localhost:8080")
  ).replace(/\/+$/, "") + "/api";
  var TIME_ZONE = "Europe/Sofia";
  var LOW_STOCK = 3;

  // Opening hours in minutes from midnight; null = closed. 0 = Sunday.
  var HOURS = {
    0: null,
    1: [600, 1140],
    2: [600, 1140],
    3: [600, 1140],
    4: [600, 1260],
    5: [600, 1140],
    6: [600, 1080]
  };
  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  var GENRES = [
    { id: "fiction", name: "Fiction", color: "#8a4b2a" },
    { id: "classics", name: "Classics", color: "#6b1e1e" },
    { id: "fantasy", name: "Fantasy & Sci-Fi", color: "#34425a" },
    { id: "nonfiction", name: "Non-fiction", color: "#6b5a2e" },
    { id: "children", name: "Children", color: "#a0782b" },
    { id: "bulgarian", name: "Bulgarian authors", color: "#3f5a36" }
  ];
  var GENRE_BY_ID = {};
  GENRES.forEach(function (g) { GENRE_BY_ID[g.id] = g; });

  /* ---------- Book details ----------
     The backend only knows each book's name, price and stock. Everything else shown on the page
     (author, category, cover, description) lives here and is matched to the backend by title. */
  var CATALOG = [
    { title: "Time Shelter", author: "Georgi Gospodinov", genre: "bulgarian", year: 2020, format: "Paperback", badge: "pick", cover: ["#5c1f24", "#d8bd7c", "ornate"],
      desc: "A clinic for the past opens in Zurich, each floor faithfully recreating a different decade to comfort patients with memory loss. Soon whole countries want to go back in time. Winner of the 2023 International Booker Prize." },
    { title: "The Midnight Library", author: "Matt Haig", genre: "fiction", year: 2020, format: "Paperback", badge: "best", cover: ["#1f2d3d", "#d8bd7c", "arch"],
      desc: "Between life and death there is a library, and every book in it lets Nora try a different version of the life she could have lived. A warm, hopeful novel about regret and second chances." },
    { title: "Pride and Prejudice", author: "Jane Austen", genre: "classics", year: 1813, format: "Hardcover", badge: "", cover: ["#3b4a2f", "#e3cf98", "frame"],
      desc: "Elizabeth Bennet meets the proud Mr Darcy, and first impressions turn out to be anything but reliable. Witty, sharp and endlessly re-readable." },
    { title: "Dune", author: "Frank Herbert", genre: "fantasy", year: 1965, format: "Paperback", badge: "best", cover: ["#8a5a2b", "#f0dfb4", "circle"],
      desc: "On the desert planet Arrakis, young Paul Atreides is drawn into a struggle over the most valuable substance in the universe. A landmark of science fiction." },
    { title: "Sapiens", author: "Yuval Noah Harari", genre: "nonfiction", year: 2011, format: "Paperback", badge: "", cover: ["#d9c9a3", "#3a2a1c", "band"],
      desc: "A brief history of humankind, from the first humans walking the earth to the revolutions — cognitive, agricultural and scientific — that shaped the world we live in." },
    { title: "The Little Prince", author: "Antoine de Saint-Exupéry", genre: "children", year: 1943, format: "Hardcover", badge: "", cover: ["#2d4660", "#e6c97a", "circle"],
      desc: "A pilot stranded in the desert meets a little prince from a tiny asteroid. A gentle, wise story for children and grown-ups alike." },
    { title: "Under the Yoke", author: "Ivan Vazov", genre: "bulgarian", year: 1894, format: "Paperback", badge: "", cover: ["#4a2e1f", "#d8bd7c", "ornate"],
      desc: "The great Bulgarian novel of the April Uprising of 1876 — a story of love, courage and a small town on the eve of revolt." },
    { title: "One Hundred Years of Solitude", author: "Gabriel García Márquez", genre: "classics", year: 1967, format: "Paperback", badge: "", cover: ["#a3782f", "#2b1d14", "frame"],
      desc: "Seven generations of the Buendía family in the town of Macondo, told with humour, magic and unforgettable imagination." },
    { title: "The Hobbit", author: "J. R. R. Tolkien", genre: "fantasy", year: 1937, format: "Hardcover", badge: "", cover: ["#2f4a33", "#d8bd7c", "arch"],
      desc: "Bilbo Baggins is perfectly happy at home — until a wizard and thirteen dwarves arrive and sweep him off on an adventure to a dragon's mountain." },
    { title: "Atomic Habits", author: "James Clear", genre: "nonfiction", year: 2018, format: "Paperback", badge: "best", cover: ["#e3d6b6", "#5c1f24", "band"],
      desc: "A practical guide to building good habits and breaking bad ones through small, steady changes that add up over time." },
    { title: "The Master and Margarita", author: "Mikhail Bulgakov", genre: "classics", year: 1967, format: "Paperback", badge: "", cover: ["#1e1b24", "#c9a55a", "circle"],
      desc: "The Devil comes to Moscow with a very strange retinue, and nothing is ever the same. A dazzling satire, love story and fantasy in one." },
    { title: "Norwegian Wood", author: "Haruki Murakami", genre: "fiction", year: 1987, format: "Paperback", badge: "", cover: ["#56663f", "#efe2c2", "band"],
      desc: "In late-1960s Tokyo, student Toru Watanabe looks back on his friendships, first loves and loss. Quiet, melancholic and beautifully written." },
    { title: "The Physics of Sorrow", author: "Georgi Gospodinov", genre: "bulgarian", year: 2011, format: "Paperback", badge: "", cover: ["#2b3f55", "#e3cf98", "arch"],
      desc: "A labyrinth of memories and stories, from the myth of the Minotaur to a childhood in socialist Bulgaria. Playful, moving and original." },
    { title: "The Very Hungry Caterpillar", author: "Eric Carle", genre: "children", year: 1969, format: "Board book", badge: "", cover: ["#6d7f3a", "#f0dfb4", "circle"],
      desc: "One little caterpillar eats his way through the week before a wonderful surprise. A classic picture book for the very youngest readers." },
    { title: "The Name of the Rose", author: "Umberto Eco", genre: "classics", year: 1980, format: "Paperback", badge: "", cover: ["#5a1d1d", "#d8bd7c", "ornate"],
      desc: "A series of mysterious deaths in a 14th-century Italian abbey, investigated by a brilliant Franciscan friar and his young novice." },
    { title: "Educated", author: "Tara Westover", genre: "nonfiction", year: 2018, format: "Paperback", badge: "new", cover: ["#c7b893", "#3a2a1c", "frame"],
      desc: "A memoir of a young woman who grew up without school in rural Idaho and went on to earn a PhD from Cambridge." },
    { title: "Harry Potter and the Philosopher's Stone", author: "J. K. Rowling", genre: "children", year: 1997, format: "Paperback", badge: "", cover: ["#6b1e2a", "#d8bd7c", "frame"],
      desc: "On his eleventh birthday, Harry learns he is a wizard and sets off for Hogwarts School of Witchcraft and Wizardry." },
    { title: "1984", author: "George Orwell", genre: "classics", year: 1949, format: "Paperback", badge: "", cover: ["#7a2a22", "#efe2c2", "band"],
      desc: "Winston Smith lives under the constant watch of Big Brother. A chilling, still-relevant novel about truth, power and freedom." },
    { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", genre: "nonfiction", year: 2011, format: "Paperback", badge: "", cover: ["#e0d2ae", "#34425a", "circle"],
      desc: "A Nobel Prize-winning psychologist explains the two systems that drive the way we think — and why we are so often wrong." },
    { title: "Crime and Punishment", author: "Fyodor Dostoevsky", genre: "classics", year: 1866, format: "Paperback", badge: "", cover: ["#241c17", "#c9a55a", "ornate"],
      desc: "A poor former student in St Petersburg commits a terrible crime and is consumed by guilt. A gripping psychological masterpiece." }
  ];

  var DEFAULT_DETAILS = { author: "", genre: null, year: null, format: "Paperback", badge: "", cover: ["#3b2a1e", "#d8bd7c", "frame"], desc: "" };

  var BADGES = {
    pick: { label: "Staff pick", cls: "badge--pick" },
    best: { label: "Bestseller", cls: "" },
    new: { label: "New", cls: "badge--new" }
  };

  /* ---------- Helpers ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  // Prices are handled in cents to avoid rounding errors
  function toCents(euros) { return Math.round(Number(euros) * 100); }
  function money(cents) { return "€" + (cents / 100).toFixed(2); }

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Lower-case and strip accents so "garcia marquez" finds "García Márquez"
  function normalize(str) {
    return String(str).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function hhmm(min) { return pad(Math.floor(min / 60)) + ":" + pad(min % 60); }

  function coverHtml(book) {
    return '<span class="cover cover--' + book.cover[2] + '" style="--c1:' + book.cover[0] + ";--c2:" + book.cover[1] + '">' +
      '<span class="cover__art"></span>' +
      '<span class="cover__title">' + esc(book.title) + "</span>" +
      '<span class="cover__author">' + esc(book.author) + "</span>" +
      "</span>";
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  var DETAILS_BY_TITLE = {};
  CATALOG.forEach(function (d) { DETAILS_BY_TITLE[normalize(d.title)] = d; });

  function detailsFor(title) {
    return DETAILS_BY_TITLE[normalize(title)] || DEFAULT_DETAILS;
  }

  function genreName(book) {
    return book.genre && GENRE_BY_ID[book.genre] ? GENRE_BY_ID[book.genre].name : "Books";
  }

  /* ---------- Backend API ---------- */
  // Every call sends cookies, so the backend can recognise this shopper's basket (anon_id cookie).
  function api(path, options) {
    options = options || {};
    var init = { method: options.method || "GET", credentials: "include", headers: { Accept: "application/json" } };
    if (options.body !== undefined) {
      init.headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(options.body);
    }
    return fetch(API_BASE + path, init).then(function (res) {
      return res.text().then(function (text) {
        var data = null;
        if (text) {
          try { data = JSON.parse(text); } catch (err) { data = null; }
        }
        if (!res.ok) {
          var error = new Error((data && data.detail) || "Something went wrong (error " + res.status + ").");
          error.status = res.status;
          error.fields = (data && data.errors) || null;
          throw error;
        }
        return data;
      });
    }, function () {
      throw new Error("Can't reach the shop right now. Please try again in a moment.");
    });
  }

  /* ---------- Toast ---------- */
  var toastEl = $("#toast");
  var toastTimer = null;
  function toast(msg, duration) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-visible"); }, duration || 2800);
  }

  /* ---------- Header ---------- */
  var header = $("#header");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 4); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var burger = $("#burger");
  var nav = $("#nav");
  function setNav(open) {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  burger.addEventListener("click", function () { setNav(!nav.classList.contains("is-open")); });
  $$(".nav__link").forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 880 && nav.classList.contains("is-open")) setNav(false);
  });
  document.addEventListener("click", function (e) {
    if (nav.classList.contains("is-open") && !nav.contains(e.target) && !burger.contains(e.target)) setNav(false);
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Decorative covers ---------- */
  $("#heroBooks").innerHTML = ["Pride and Prejudice", "The Midnight Library", "Dune"]
    .map(function (title) { return coverHtml(detailsFor(title)); }).join("");
  $("#featuredCover").innerHTML = coverHtml(detailsFor("Time Shelter"));

  /* ---------- Books from the backend ---------- */
  var books = [];
  var BOOK_BY_ID = {};
  var booksLoaded = false;

  function loadBooks() {
    return api("/items").then(function (items) {
      books = items.map(function (item, i) {
        var d = detailsFor(item.name);
        return {
          id: String(item.id),
          title: item.name,
          price: toCents(item.price),
          stock: item.quantity,
          author: d.author,
          genre: d.genre,
          year: d.year,
          format: d.format,
          badge: d.badge,
          cover: d.cover,
          desc: d.desc,
          order: i
        };
      });
      BOOK_BY_ID = {};
      books.forEach(function (b) { BOOK_BY_ID[b.id] = b; });
      booksLoaded = true;
      $("#loadError").hidden = true;
      renderGenreOptions();
      renderCategories();
      renderBooks();
      renderFeatured();
    }).catch(function (err) {
      if (booksLoaded) return; // keep showing the last good list
      grid.innerHTML = "";
      grid.hidden = true;
      emptyEl.hidden = true;
      resultsEl.textContent = "";
      $("#loadErrorText").textContent = err.message;
      $("#loadError").hidden = false;
      categoryGrid.innerHTML = "";
    });
  }

  /* ---------- Shop: filters, search, sort ---------- */
  var grid = $("#bookGrid");
  var searchInput = $("#search");
  var genreSelect = $("#genre");
  var sortSelect = $("#sort");
  var resultsEl = $("#results");
  var emptyEl = $("#emptyState");

  var SORTERS = {
    featured: function (a, b) { return a.order - b.order; },
    "price-asc": function (a, b) { return a.price - b.price || a.order - b.order; },
    "price-desc": function (a, b) { return b.price - a.price || a.order - b.order; },
    title: function (a, b) { return a.title.localeCompare(b.title, "en", { sensitivity: "base" }); },
    newest: function (a, b) { return (b.year || 0) - (a.year || 0) || a.order - b.order; }
  };

  function genresInStock() {
    return GENRES.filter(function (g) { return books.some(function (b) { return b.genre === g.id; }); });
  }

  function renderGenreOptions() {
    var current = genreSelect.value || "all";
    var genres = genresInStock();
    genreSelect.innerHTML = '<option value="all">All categories</option>' +
      genres.map(function (g) { return '<option value="' + g.id + '">' + esc(g.name) + "</option>"; }).join("");
    genreSelect.value = genres.some(function (g) { return g.id === current; }) ? current : "all";
  }

  function stockNote(book) {
    if (book.stock <= 0) return '<p class="book__stock book__stock--out">Out of stock</p>';
    if (book.stock <= LOW_STOCK) return '<p class="book__stock">Only ' + book.stock + " left</p>";
    return "";
  }

  function renderBooks() {
    if (!booksLoaded) return;
    var q = normalize(searchInput.value.trim());
    var genre = genreSelect.value;
    var sorter = SORTERS[sortSelect.value] || SORTERS.featured;

    var list = books.filter(function (b) {
      if (genre !== "all" && b.genre !== genre) return false;
      if (!q) return true;
      return normalize(b.title).indexOf(q) !== -1 || normalize(b.author).indexOf(q) !== -1;
    }).sort(sorter);

    grid.innerHTML = list.map(function (b, i) {
      var badge = BADGES[b.badge];
      var soldOut = b.stock <= 0;
      return '' +
        '<article class="book" style="animation-delay:' + Math.min(i * 40, 400) + 'ms">' +
          '<button class="book__open" type="button" data-open="' + b.id + '" tabindex="-1" aria-hidden="true">' +
            (badge ? '<span class="badge ' + badge.cls + '">' + badge.label + "</span>" : "") +
            coverHtml(b) +
          "</button>" +
          '<p class="book__genre">' + esc(genreName(b)) + "</p>" +
          '<h3 class="book__title"><button type="button" data-open="' + b.id + '">' + esc(b.title) + "</button></h3>" +
          (b.author ? '<p class="book__author">' + esc(b.author) + "</p>" : "") +
          stockNote(b) +
          '<div class="book__foot">' +
            '<span class="book__price">' + money(b.price) + "</span>" +
            '<button class="add" type="button" data-add="' + b.id + '"' + (soldOut ? " disabled" : "") +
              ' aria-label="Add ' + esc(b.title) + ' to basket">' +
              '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>' +
              "<span>" + (soldOut ? "Sold out" : "Add") + "</span>" +
            "</button>" +
          "</div>" +
        "</article>";
    }).join("");

    var total = list.length;
    resultsEl.textContent = total === 1 ? "Showing 1 book" : "Showing " + total + " books";
    emptyEl.hidden = total > 0;
    grid.hidden = total === 0;
  }

  searchInput.addEventListener("input", renderBooks);
  genreSelect.addEventListener("change", renderBooks);
  sortSelect.addEventListener("change", renderBooks);

  $("#resetFilters").addEventListener("click", function () {
    searchInput.value = "";
    genreSelect.value = "all";
    sortSelect.value = "featured";
    renderBooks();
    searchInput.focus();
  });

  $("#retryLoad").addEventListener("click", function () {
    resultsEl.textContent = "Loading books…";
    $("#loadError").hidden = true;
    loadBooks();
  });

  $("#searchJump").addEventListener("click", function (e) {
    e.preventDefault();
    $("#shop").scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
    searchInput.focus({ preventScroll: true });
  });

  /* ---------- Categories ---------- */
  var categoryGrid = $("#categoryGrid");

  function renderCategories() {
    categoryGrid.innerHTML = genresInStock().map(function (g) {
      var count = books.filter(function (b) { return b.genre === g.id; }).length;
      return '<button class="category" type="button" data-genre="' + g.id + '">' +
        '<span class="category__dot" style="background:' + g.color + '" aria-hidden="true"></span>' +
        '<span class="category__name">' + esc(g.name) + "</span>" +
        '<span class="category__count">' + count + (count === 1 ? " book" : " books") + "</span>" +
        "</button>";
    }).join("");
  }

  categoryGrid.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-genre]");
    if (!btn) return;
    genreSelect.value = btn.getAttribute("data-genre");
    searchInput.value = "";
    renderBooks();
    $("#shop").scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
  });

  /* ---------- Book of the month ---------- */
  function renderFeatured() {
    var featured = books.filter(function (b) { return normalize(b.title) === normalize("Time Shelter"); })[0];
    var buy = $("#featuredBuy");
    if (!featured) {
      buy.hidden = true;
      return;
    }
    buy.hidden = false;
    $("#featuredPrice").textContent = money(featured.price);
    var addBtn = $("#featuredAdd");
    addBtn.setAttribute("data-add", featured.id);
    addBtn.disabled = featured.stock <= 0;
    addBtn.textContent = featured.stock <= 0 ? "Sold out" : "Add to basket";
    $("#featuredMore").setAttribute("data-open", featured.id);
  }

  /* ---------- Dialogs (book details, checkout) ---------- */
  var supportsDialog = typeof HTMLDialogElement === "function" && typeof $("#bookModal").showModal === "function";

  function openDialog(dialog) {
    if (supportsDialog) {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    document.body.classList.add("no-scroll");
  }

  function closeDialog(dialog) {
    if (supportsDialog) {
      if (dialog.open) dialog.close();
    } else {
      dialog.removeAttribute("open");
      onDialogClosed();
    }
  }

  function anyDialogOpen() {
    return $$("dialog").some(function (d) { return d.hasAttribute("open"); });
  }

  function onDialogClosed() {
    if (!cartEl.classList.contains("is-open") && !anyDialogOpen()) document.body.classList.remove("no-scroll");
  }

  $$("dialog").forEach(function (dialog) {
    dialog.addEventListener("close", onDialogClosed);
    // A click on the backdrop (outside the dialog box) closes it
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) closeDialog(dialog);
    });
  });

  /* ---------- Book details ---------- */
  var modal = $("#bookModal");
  var modalAdd = $("#modalAdd");
  var currentBookId = null;

  function openBook(id) {
    var b = BOOK_BY_ID[id];
    if (!b) return;
    currentBookId = id;
    $("#modalCover").innerHTML = coverHtml(b);
    $("#modalGenre").textContent = genreName(b);
    $("#modalTitle").textContent = b.title;
    $("#modalAuthor").textContent = b.author ? "by " + b.author : "";
    $("#modalDesc").textContent = b.desc;
    $("#modalYear").textContent = b.year ? String(b.year) : "—";
    $("#modalFormat").textContent = b.format;
    $("#modalStock").textContent = b.stock <= 0 ? "Out of stock" : b.stock + " in stock";
    $("#modalPrice").textContent = money(b.price);
    modalAdd.disabled = b.stock <= 0;
    modalAdd.textContent = b.stock <= 0 ? "Sold out" : "Add to basket";
    modalAdd.setAttribute("aria-label", "Add " + b.title + " to basket");
    openDialog(modal);
  }

  $("#modalClose").addEventListener("click", function () { closeDialog(modal); });
  modalAdd.addEventListener("click", function () {
    if (!currentBookId) return;
    addToCart(currentBookId, modalAdd).then(function (ok) {
      if (ok) closeDialog(modal);
    });
  });

  /* ---------- Basket (stored by the backend in Redis) ---------- */
  var EMPTY_CART = { items: [], totalQuantity: 0, subtotal: 0, deliveryFee: 0, total: 0 };
  var cart = EMPTY_CART;

  var cartEl = $("#cart");
  var cartBtn = $("#cartOpen");
  var cartClose = $("#cartClose");
  var cartList = $("#cartList");
  var overlay = $("#overlay");
  var lastFocus = null;
  var overlayTimer = null;

  function setCart(data) {
    cart = data || EMPTY_CART;
    renderCart();
  }

  function loadCart() {
    return api("/cart").then(setCart).catch(function () { /* the shop error message already explains */ });
  }

  function withBusy(btn, promise) {
    if (btn) btn.disabled = true;
    return promise.then(function (value) {
      if (btn) btn.disabled = false;
      return value;
    }, function (err) {
      if (btn) btn.disabled = false;
      throw err;
    });
  }

  // Resolves to true when the book was added
  function addToCart(id, btn) {
    var b = BOOK_BY_ID[id];
    if (!b) return Promise.resolve(false);
    return withBusy(btn, api("/cart/items", { method: "POST", body: { itemId: Number(id), quantity: 1 } }))
      .then(function (data) {
        setCart(data);
        cartBtn.classList.remove("bump");
        void cartBtn.offsetWidth; // restart the animation
        cartBtn.classList.add("bump");
        toast("“" + b.title + "” added to your basket");
        return true;
      })
      .catch(function (err) {
        toast(err.message, 4000);
        if (err.status === 409) loadBooks(); // stock changed: refresh what the shop shows
        return false;
      });
  }

  function setQty(id, qty, btn) {
    return withBusy(btn, api("/cart/items/" + encodeURIComponent(id), { method: "PUT", body: { quantity: qty } }))
      .then(setCart)
      .catch(function (err) { toast(err.message, 4000); });
  }

  function renderCart() {
    var items = cart.items || [];
    var count = cart.totalQuantity || 0;
    var countEl = $("#cartCount");
    countEl.textContent = String(count);
    countEl.classList.toggle("is-visible", count > 0);
    cartBtn.setAttribute("aria-label", "Open basket, " + count + (count === 1 ? " item" : " items"));

    $("#cartEmpty").hidden = items.length > 0;
    $("#cartFoot").hidden = items.length === 0;

    cartList.innerHTML = items.map(function (line) {
      var d = detailsFor(line.name);
      var book = { title: line.name, author: d.author, cover: d.cover };
      var id = String(line.itemId);
      var price = toCents(line.price);
      return '<li class="cart__item">' +
        coverHtml(book) +
        "<div>" +
          '<p class="cart__name">' + esc(line.name) + "</p>" +
          '<p class="cart__meta">' + (d.author ? esc(d.author) + " · " : "") + money(price) + "</p>" +
        "</div>" +
        '<div class="cart__right">' +
          '<span class="cart__line">' + money(toCents(line.lineTotal)) + "</span>" +
          '<div class="qty">' +
            '<button type="button" data-dec="' + id + '" data-qty="' + line.quantity + '" aria-label="Remove one copy of ' + esc(line.name) + '">−</button>' +
            '<span aria-label="Quantity ' + line.quantity + '">' + line.quantity + "</span>" +
            '<button type="button" data-inc="' + id + '" data-qty="' + line.quantity + '" aria-label="Add one copy of ' + esc(line.name) + '">+</button>' +
          "</div>" +
        "</div>" +
      "</li>";
    }).join("");

    if (!items.length) return;

    var sub = toCents(cart.subtotal);
    var ship = toCents(cart.deliveryFee);
    $("#cartSubtotal").textContent = money(sub);
    $("#cartDelivery").textContent = ship === 0 ? "Free" : money(ship);
    $("#cartTotal").textContent = money(toCents(cart.total));
    $("#cartShipping").textContent = ship === 0
      ? "Your order qualifies for free delivery."
      : "Add " + money(toCents(cart.freeDeliveryFrom) - sub) + " more for free delivery.";
  }

  cartList.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-inc], [data-dec]");
    if (!btn) return;
    var inc = btn.hasAttribute("data-inc");
    var id = btn.getAttribute(inc ? "data-inc" : "data-dec");
    var qty = Number(btn.getAttribute("data-qty")) + (inc ? 1 : -1);
    setQty(id, qty, btn).then(function () {
      // Keep keyboard focus in a sensible place after re-render
      var again = cartList.querySelector("[" + (inc ? "data-inc" : "data-dec") + '="' + id + '"]');
      (again || cartClose).focus();
    });
  });

  function openCart() {
    lastFocus = document.activeElement;
    setNav(false);
    toastEl.classList.remove("is-visible");
    clearTimeout(overlayTimer);
    overlay.hidden = false;
    void overlay.offsetWidth; // let the fade-in transition run
    overlay.classList.add("is-visible");
    cartEl.classList.add("is-open");
    cartEl.removeAttribute("inert");
    cartEl.setAttribute("aria-hidden", "false");
    cartBtn.setAttribute("aria-expanded", "true");
    document.body.classList.add("no-scroll");
    cartClose.focus();
    loadCart();
  }

  function closeCart(restoreFocus) {
    if (!cartEl.classList.contains("is-open")) return;
    overlay.classList.remove("is-visible");
    cartEl.classList.remove("is-open");
    cartEl.setAttribute("inert", "");
    cartEl.setAttribute("aria-hidden", "true");
    cartBtn.setAttribute("aria-expanded", "false");
    if (!anyDialogOpen()) document.body.classList.remove("no-scroll");
    overlayTimer = setTimeout(function () { overlay.hidden = true; }, 300);
    if (restoreFocus !== false && lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  cartBtn.addEventListener("click", openCart);
  cartClose.addEventListener("click", function () { closeCart(); });
  overlay.addEventListener("click", function () { closeCart(); });
  $("#cartBrowse").addEventListener("click", function () { closeCart(false); });

  $("#cartClear").addEventListener("click", function () {
    var btn = this;
    withBusy(btn, api("/cart", { method: "DELETE" }))
      .then(function (data) {
        setCart(data);
        cartClose.focus();
      })
      .catch(function (err) { toast(err.message, 4000); });
  });

  /* ---------- Checkout ---------- */
  var checkoutModal = $("#checkoutModal");
  var checkoutForm = $("#checkoutForm");
  var checkoutError = $("#checkoutError");
  var checkoutSubmit = $("#checkoutSubmit");

  var CHECKS = {
    firstName: function (v) { return v ? "" : "Please enter your first name"; },
    lastName: function (v) { return v ? "" : "Please enter your last name"; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Please enter a valid email"; },
    phoneNumber: function (v) { return /^\+?[0-9 ()-]{7,20}$/.test(v) ? "" : "Please enter a valid phone number"; },
    address: function (v) { return v ? "" : "Please enter your delivery address"; }
  };

  function setFieldError(name, message) {
    var input = checkoutForm.elements[name];
    var error = $('[data-error-for="' + name + '"]', checkoutForm);
    if (!input || !error) return;
    error.textContent = message || "";
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }

  function clearCheckoutErrors() {
    Object.keys(CHECKS).forEach(function (name) { setFieldError(name, ""); });
    checkoutError.textContent = "";
  }

  function paymentLabel() {
    var type = checkoutForm.elements.paymentType.value;
    checkoutSubmit.textContent = type === "CARD" ? "Continue to secure payment" : "Place order";
  }

  $("#checkout").addEventListener("click", function () {
    if (!cart.items || !cart.items.length) return;
    closeCart(false);
    clearCheckoutErrors();
    $("#checkoutSummary").textContent = cart.totalQuantity + (cart.totalQuantity === 1 ? " book" : " books") +
      " · total " + money(toCents(cart.total)) + (toCents(cart.deliveryFee) === 0 ? " (free delivery)" : " incl. delivery");
    paymentLabel();
    openDialog(checkoutModal);
    checkoutForm.elements.firstName.focus();
  });

  $("#checkoutClose").addEventListener("click", function () { closeDialog(checkoutModal); });
  $$('input[name="paymentType"]', checkoutForm).forEach(function (r) { r.addEventListener("change", paymentLabel); });

  Object.keys(CHECKS).forEach(function (name) {
    checkoutForm.elements[name].addEventListener("input", function () {
      if (this.getAttribute("aria-invalid") === "true") setFieldError(name, CHECKS[name](this.value.trim()));
    });
  });

  checkoutForm.addEventListener("submit", function (e) {
    e.preventDefault();
    clearCheckoutErrors();

    var body = { paymentType: checkoutForm.elements.paymentType.value };
    var firstInvalid = null;
    Object.keys(CHECKS).forEach(function (name) {
      var value = checkoutForm.elements[name].value.trim();
      body[name] = value;
      var message = CHECKS[name](value);
      if (message) {
        setFieldError(name, message);
        if (!firstInvalid) firstInvalid = checkoutForm.elements[name];
      }
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    var label = checkoutSubmit.textContent;
    checkoutSubmit.textContent = body.paymentType === "CARD" ? "Redirecting to payment…" : "Placing order…";
    withBusy(checkoutSubmit, api("/orders", { method: "POST", body: body }))
      .then(function (result) {
        if (result.paymentType === "CARD" && result.checkoutUrl) {
          // Stripe takes over; the order is created once the payment is completed
          window.location.href = result.checkoutUrl;
          return;
        }
        checkoutSubmit.textContent = label;
        closeDialog(checkoutModal);
        checkoutForm.reset();
        paymentLabel();
        setCart(EMPTY_CART);
        loadBooks();
        toast("Thank you, " + body.firstName + "! Order #" + result.orderId + " is placed — please pay " +
          money(toCents(result.total)) + " in cash on delivery.", 6000);
      })
      .catch(function (err) {
        checkoutSubmit.textContent = label;
        if (err.fields) {
          Object.keys(err.fields).forEach(function (name) { setFieldError(name, err.fields[name]); });
        }
        checkoutError.textContent = err.message;
        if (err.status === 409) {
          loadBooks();
          loadCart();
        }
      });
  });

  // Coming back from Stripe Checkout
  (function handlePaymentReturn() {
    var params = new URLSearchParams(window.location.search);
    var status = params.get("payment");
    if (!status) return;
    if (status === "success") {
      toast("Payment received — thank you! Your order is confirmed.", 6000);
      // The backend empties the basket when Stripe confirms the payment; check again shortly
      setTimeout(loadCart, 2500);
    } else if (status === "cancelled") {
      toast("Payment cancelled — your basket is still here.", 5000);
    }
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", window.location.pathname + window.location.hash);
    }
  })();

  // Add / open buttons anywhere on the page (grid, featured section)
  document.addEventListener("click", function (e) {
    var addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      if (addBtn.disabled) return;
      addToCart(addBtn.getAttribute("data-add"), addBtn).then(function (ok) {
        if (!ok || !addBtn.classList.contains("add")) return;
        var label = addBtn.querySelector("span");
        if (!label) return;
        addBtn.classList.add("is-added");
        label.textContent = "Added";
        clearTimeout(addBtn._t);
        addBtn._t = setTimeout(function () {
          addBtn.classList.remove("is-added");
          label.textContent = "Add";
        }, 1200);
      });
      return;
    }
    var openBtn = e.target.closest("[data-open]");
    if (openBtn) openBook(openBtn.getAttribute("data-open"));
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (cartEl.classList.contains("is-open")) closeCart();
      else if (!supportsDialog && anyDialogOpen()) $$("dialog[open]").forEach(closeDialog);
      else if (nav.classList.contains("is-open")) { setNav(false); burger.focus(); }
      return;
    }
    // Keep Tab focus inside the open basket
    if (e.key === "Tab" && cartEl.classList.contains("is-open")) {
      var items = $$('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])', cartEl)
        .filter(function (el) { return !el.disabled && el.offsetParent !== null; });
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  resultsEl.textContent = "Loading books…";
  loadBooks();
  loadCart();

  /* ---------- Opening hours ---------- */
  function sofiaNow() {
    try {
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: TIME_ZONE, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
      }).formatToParts(new Date());
      var m = {};
      parts.forEach(function (p) { m[p.type] = p.value; });
      var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { day: days[m.weekday], minutes: (parseInt(m.hour, 10) % 24) * 60 + parseInt(m.minute, 10) };
    } catch (err) {
      var d = new Date();
      return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function updateStatus() {
    var el = $("#openStatus");
    var now = sofiaNow();
    var today = HOURS[now.day];
    var open = !!today && now.minutes >= today[0] && now.minutes < today[1];
    var text;

    if (open) {
      text = "Open now · until " + hhmm(today[1]);
    } else if (today && now.minutes < today[0]) {
      text = "Closed · opens at " + hhmm(today[0]);
    } else {
      // Find the next day the shop is open
      for (var i = 1; i <= 7; i++) {
        var d = (now.day + i) % 7;
        if (HOURS[d]) {
          text = "Closed · opens " + (i === 1 ? "tomorrow" : DAY_NAMES[d]) + " at " + hhmm(HOURS[d][0]);
          break;
        }
      }
    }

    el.classList.toggle("is-open", open);
    el.classList.toggle("is-closed", !open);
    $(".status__text", el).textContent = text;
    $$(".hours__table tr[data-day]").forEach(function (row) {
      row.classList.toggle("is-today", Number(row.getAttribute("data-day")) === now.day);
    });
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  /* ---------- Newsletter ---------- */
  var newsForm = $("#newsletterForm");
  var emailInput = $("#email");
  var newsMsg = $("#newsletterMsg");

  newsForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var value = emailInput.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      emailInput.setAttribute("aria-invalid", "true");
      newsMsg.textContent = "Please enter a valid email address.";
      emailInput.focus();
      return;
    }
    emailInput.removeAttribute("aria-invalid");
    newsMsg.textContent = "Thank you! You're on the list — see you in your inbox.";
    newsForm.reset();
  });

  emailInput.addEventListener("input", function () {
    if (emailInput.getAttribute("aria-invalid") === "true") {
      emailInput.removeAttribute("aria-invalid");
      newsMsg.textContent = "";
    }
  });

  /* ---------- Footer year ---------- */
  $("#year").textContent = String(new Date().getFullYear());
})();
