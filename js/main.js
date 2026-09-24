/* =========================================================
   Maikini Knigi — Independent bookshop
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Settings ---------- */
  var CART_KEY = "maikini-knigi-basket";
  var SHIPPING = 399;             // cents
  var FREE_SHIPPING_FROM = 4000;  // cents
  var TIME_ZONE = "Europe/Sofia";
  var MAX_QTY = 20;

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

  /* ---------- Books (prices in euro cents) ---------- */
  var BOOKS = [
    { id: "time-shelter", title: "Time Shelter", author: "Georgi Gospodinov", genre: "bulgarian", year: 2020, format: "Paperback", price: 1890, badge: "pick", cover: ["#5c1f24", "#d8bd7c", "ornate"],
      desc: "A clinic for the past opens in Zurich, each floor faithfully recreating a different decade to comfort patients with memory loss. Soon whole countries want to go back in time. Winner of the 2023 International Booker Prize." },
    { id: "midnight-library", title: "The Midnight Library", author: "Matt Haig", genre: "fiction", year: 2020, format: "Paperback", price: 1490, badge: "best", cover: ["#1f2d3d", "#d8bd7c", "arch"],
      desc: "Between life and death there is a library, and every book in it lets Nora try a different version of the life she could have lived. A warm, hopeful novel about regret and second chances." },
    { id: "pride-and-prejudice", title: "Pride and Prejudice", author: "Jane Austen", genre: "classics", year: 1813, format: "Hardcover", price: 1690, badge: "", cover: ["#3b4a2f", "#e3cf98", "frame"],
      desc: "Elizabeth Bennet meets the proud Mr Darcy, and first impressions turn out to be anything but reliable. Witty, sharp and endlessly re-readable." },
    { id: "dune", title: "Dune", author: "Frank Herbert", genre: "fantasy", year: 1965, format: "Paperback", price: 1790, badge: "best", cover: ["#8a5a2b", "#f0dfb4", "circle"],
      desc: "On the desert planet Arrakis, young Paul Atreides is drawn into a struggle over the most valuable substance in the universe. A landmark of science fiction." },
    { id: "sapiens", title: "Sapiens", author: "Yuval Noah Harari", genre: "nonfiction", year: 2011, format: "Paperback", price: 1990, badge: "", cover: ["#d9c9a3", "#3a2a1c", "band"],
      desc: "A brief history of humankind, from the first humans walking the earth to the revolutions — cognitive, agricultural and scientific — that shaped the world we live in." },
    { id: "little-prince", title: "The Little Prince", author: "Antoine de Saint-Exupéry", genre: "children", year: 1943, format: "Hardcover", price: 1290, badge: "", cover: ["#2d4660", "#e6c97a", "circle"],
      desc: "A pilot stranded in the desert meets a little prince from a tiny asteroid. A gentle, wise story for children and grown-ups alike." },
    { id: "under-the-yoke", title: "Under the Yoke", author: "Ivan Vazov", genre: "bulgarian", year: 1894, format: "Paperback", price: 1590, badge: "", cover: ["#4a2e1f", "#d8bd7c", "ornate"],
      desc: "The great Bulgarian novel of the April Uprising of 1876 — a story of love, courage and a small town on the eve of revolt." },
    { id: "hundred-years", title: "One Hundred Years of Solitude", author: "Gabriel García Márquez", genre: "classics", year: 1967, format: "Paperback", price: 1790, badge: "", cover: ["#a3782f", "#2b1d14", "frame"],
      desc: "Seven generations of the Buendía family in the town of Macondo, told with humour, magic and unforgettable imagination." },
    { id: "hobbit", title: "The Hobbit", author: "J. R. R. Tolkien", genre: "fantasy", year: 1937, format: "Hardcover", price: 1890, badge: "", cover: ["#2f4a33", "#d8bd7c", "arch"],
      desc: "Bilbo Baggins is perfectly happy at home — until a wizard and thirteen dwarves arrive and sweep him off on an adventure to a dragon's mountain." },
    { id: "atomic-habits", title: "Atomic Habits", author: "James Clear", genre: "nonfiction", year: 2018, format: "Paperback", price: 1790, badge: "best", cover: ["#e3d6b6", "#5c1f24", "band"],
      desc: "A practical guide to building good habits and breaking bad ones through small, steady changes that add up over time." },
    { id: "master-and-margarita", title: "The Master and Margarita", author: "Mikhail Bulgakov", genre: "classics", year: 1967, format: "Paperback", price: 1590, badge: "", cover: ["#1e1b24", "#c9a55a", "circle"],
      desc: "The Devil comes to Moscow with a very strange retinue, and nothing is ever the same. A dazzling satire, love story and fantasy in one." },
    { id: "norwegian-wood", title: "Norwegian Wood", author: "Haruki Murakami", genre: "fiction", year: 1987, format: "Paperback", price: 1490, badge: "", cover: ["#56663f", "#efe2c2", "band"],
      desc: "In late-1960s Tokyo, student Toru Watanabe looks back on his friendships, first loves and loss. Quiet, melancholic and beautifully written." },
    { id: "physics-of-sorrow", title: "The Physics of Sorrow", author: "Georgi Gospodinov", genre: "bulgarian", year: 2011, format: "Paperback", price: 1690, badge: "", cover: ["#2b3f55", "#e3cf98", "arch"],
      desc: "A labyrinth of memories and stories, from the myth of the Minotaur to a childhood in socialist Bulgaria. Playful, moving and original." },
    { id: "hungry-caterpillar", title: "The Very Hungry Caterpillar", author: "Eric Carle", genre: "children", year: 1969, format: "Board book", price: 990, badge: "", cover: ["#6d7f3a", "#f0dfb4", "circle"],
      desc: "One little caterpillar eats his way through the week before a wonderful surprise. A classic picture book for the very youngest readers." },
    { id: "name-of-the-rose", title: "The Name of the Rose", author: "Umberto Eco", genre: "classics", year: 1980, format: "Paperback", price: 1790, badge: "", cover: ["#5a1d1d", "#d8bd7c", "ornate"],
      desc: "A series of mysterious deaths in a 14th-century Italian abbey, investigated by a brilliant Franciscan friar and his young novice." },
    { id: "educated", title: "Educated", author: "Tara Westover", genre: "nonfiction", year: 2018, format: "Paperback", price: 1690, badge: "new", cover: ["#c7b893", "#3a2a1c", "frame"],
      desc: "A memoir of a young woman who grew up without school in rural Idaho and went on to earn a PhD from Cambridge." },
    { id: "philosophers-stone", title: "Harry Potter and the Philosopher's Stone", author: "J. K. Rowling", genre: "children", year: 1997, format: "Paperback", price: 1390, badge: "", cover: ["#6b1e2a", "#d8bd7c", "frame"],
      desc: "On his eleventh birthday, Harry learns he is a wizard and sets off for Hogwarts School of Witchcraft and Wizardry." },
    { id: "nineteen-eighty-four", title: "1984", author: "George Orwell", genre: "classics", year: 1949, format: "Paperback", price: 1290, badge: "", cover: ["#7a2a22", "#efe2c2", "band"],
      desc: "Winston Smith lives under the constant watch of Big Brother. A chilling, still-relevant novel about truth, power and freedom." },
    { id: "thinking-fast-slow", title: "Thinking, Fast and Slow", author: "Daniel Kahneman", genre: "nonfiction", year: 2011, format: "Paperback", price: 1990, badge: "", cover: ["#e0d2ae", "#34425a", "circle"],
      desc: "A Nobel Prize-winning psychologist explains the two systems that drive the way we think — and why we are so often wrong." },
    { id: "crime-and-punishment", title: "Crime and Punishment", author: "Fyodor Dostoevsky", genre: "classics", year: 1866, format: "Paperback", price: 1490, badge: "", cover: ["#241c17", "#c9a55a", "ornate"],
      desc: "A poor former student in St Petersburg commits a terrible crime and is consumed by guilt. A gripping psychological masterpiece." }
  ];

  var BOOK_BY_ID = {};
  BOOKS.forEach(function (b, i) { b.order = i; BOOK_BY_ID[b.id] = b; });

  var BADGES = {
    pick: { label: "Staff pick", cls: "badge--pick" },
    best: { label: "Bestseller", cls: "" },
    new: { label: "New", cls: "badge--new" }
  };

  /* ---------- Helpers ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

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

  /* ---------- Toast ---------- */
  var toastEl = $("#toast");
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-visible"); }, 2600);
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

  /* ---------- Static covers ---------- */
  $("#heroBooks").innerHTML = ["pride-and-prejudice", "midnight-library", "dune"]
    .map(function (id) { return coverHtml(BOOK_BY_ID[id]); }).join("");
  $("#featuredCover").innerHTML = coverHtml(BOOK_BY_ID["time-shelter"]);
  $("#featuredPrice").textContent = money(BOOK_BY_ID["time-shelter"].price);

  /* ---------- Shop: filters, search, sort ---------- */
  var grid = $("#bookGrid");
  var searchInput = $("#search");
  var genreSelect = $("#genre");
  var sortSelect = $("#sort");
  var resultsEl = $("#results");
  var emptyEl = $("#emptyState");

  genreSelect.innerHTML = '<option value="all">All categories</option>' +
    GENRES.map(function (g) { return '<option value="' + g.id + '">' + esc(g.name) + "</option>"; }).join("");

  var SORTERS = {
    featured: function (a, b) { return a.order - b.order; },
    "price-asc": function (a, b) { return a.price - b.price || a.order - b.order; },
    "price-desc": function (a, b) { return b.price - a.price || a.order - b.order; },
    title: function (a, b) { return a.title.localeCompare(b.title, "en", { sensitivity: "base" }); },
    newest: function (a, b) { return b.year - a.year || a.order - b.order; }
  };

  function renderBooks() {
    var q = normalize(searchInput.value.trim());
    var genre = genreSelect.value;
    var sorter = SORTERS[sortSelect.value] || SORTERS.featured;

    var list = BOOKS.filter(function (b) {
      if (genre !== "all" && b.genre !== genre) return false;
      if (!q) return true;
      return normalize(b.title).indexOf(q) !== -1 || normalize(b.author).indexOf(q) !== -1;
    }).sort(sorter);

    grid.innerHTML = list.map(function (b, i) {
      var badge = BADGES[b.badge];
      return '' +
        '<article class="book" style="animation-delay:' + Math.min(i * 40, 400) + 'ms">' +
          '<button class="book__open" type="button" data-open="' + b.id + '" tabindex="-1" aria-hidden="true">' +
            (badge ? '<span class="badge ' + badge.cls + '">' + badge.label + "</span>" : "") +
            coverHtml(b) +
          "</button>" +
          '<p class="book__genre">' + esc(GENRE_BY_ID[b.genre].name) + "</p>" +
          '<h3 class="book__title"><button type="button" data-open="' + b.id + '">' + esc(b.title) + "</button></h3>" +
          '<p class="book__author">' + esc(b.author) + "</p>" +
          '<div class="book__foot">' +
            '<span class="book__price">' + money(b.price) + "</span>" +
            '<button class="add" type="button" data-add="' + b.id + '" aria-label="Add ' + esc(b.title) + ' to basket">' +
              '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>' +
              "<span>Add</span>" +
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

  $("#searchJump").addEventListener("click", function (e) {
    e.preventDefault();
    $("#shop").scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
    searchInput.focus({ preventScroll: true });
  });

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ---------- Categories ---------- */
  var categoryGrid = $("#categoryGrid");
  categoryGrid.innerHTML = GENRES.map(function (g) {
    var count = BOOKS.filter(function (b) { return b.genre === g.id; }).length;
    return '<button class="category" type="button" data-genre="' + g.id + '">' +
      '<span class="category__dot" style="background:' + g.color + '" aria-hidden="true"></span>' +
      '<span class="category__name">' + esc(g.name) + "</span>" +
      '<span class="category__count">' + count + (count === 1 ? " book" : " books") + "</span>" +
      "</button>";
  }).join("");

  categoryGrid.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-genre]");
    if (!btn) return;
    genreSelect.value = btn.getAttribute("data-genre");
    searchInput.value = "";
    renderBooks();
    $("#shop").scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
  });

  renderBooks();

  /* ---------- Book details dialog ---------- */
  var modal = $("#bookModal");
  var modalAdd = $("#modalAdd");
  var currentBookId = null;
  var supportsDialog = typeof modal.showModal === "function";

  function openBook(id) {
    var b = BOOK_BY_ID[id];
    if (!b) return;
    currentBookId = id;
    $("#modalCover").innerHTML = coverHtml(b);
    $("#modalGenre").textContent = GENRE_BY_ID[b.genre].name;
    $("#modalTitle").textContent = b.title;
    $("#modalAuthor").textContent = "by " + b.author;
    $("#modalDesc").textContent = b.desc;
    $("#modalYear").textContent = String(b.year);
    $("#modalFormat").textContent = b.format;
    $("#modalPrice").textContent = money(b.price);
    modalAdd.setAttribute("aria-label", "Add " + b.title + " to basket");

    if (supportsDialog) {
      if (!modal.open) modal.showModal();
    } else {
      modal.setAttribute("open", "");
    }
    document.body.classList.add("no-scroll");
  }

  function closeBook() {
    if (supportsDialog) { if (modal.open) modal.close(); }
    else { modal.removeAttribute("open"); onModalClosed(); }
  }

  function onModalClosed() {
    if (!cartEl.classList.contains("is-open")) document.body.classList.remove("no-scroll");
  }

  modal.addEventListener("close", onModalClosed);
  $("#modalClose").addEventListener("click", closeBook);
  // Click on the backdrop (outside the dialog box) closes it
  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeBook();
  });
  modalAdd.addEventListener("click", function () {
    if (currentBookId) addToCart(currentBookId);
    closeBook();
  });

  /* ---------- Basket ---------- */
  var cart = loadCart();

  function loadCart() {
    try {
      var data = JSON.parse(window.localStorage.getItem(CART_KEY) || "{}");
      var clean = {};
      if (data && typeof data === "object") {
        Object.keys(data).forEach(function (id) {
          var qty = parseInt(data[id], 10);
          if (BOOK_BY_ID[id] && qty > 0) clean[id] = Math.min(qty, MAX_QTY);
        });
      }
      return clean;
    } catch (err) {
      return {};
    }
  }

  function saveCart() {
    try { window.localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
    catch (err) { /* storage unavailable: basket still works for this visit */ }
  }

  function subtotal() {
    return Object.keys(cart).reduce(function (s, id) { return s + BOOK_BY_ID[id].price * cart[id]; }, 0);
  }
  function itemCount() {
    return Object.keys(cart).reduce(function (s, id) { return s + cart[id]; }, 0);
  }
  function shippingFor(sub) { return sub >= FREE_SHIPPING_FROM ? 0 : SHIPPING; }

  function addToCart(id) {
    var b = BOOK_BY_ID[id];
    if (!b) return;
    if ((cart[id] || 0) >= MAX_QTY) {
      toast("You can order up to " + MAX_QTY + " copies of one book");
      return;
    }
    cart[id] = (cart[id] || 0) + 1;
    saveCart();
    renderCart();
    cartBtn.classList.remove("bump");
    void cartBtn.offsetWidth; // restart the animation
    cartBtn.classList.add("bump");
    toast("“" + b.title + "” added to your basket");
  }

  function setQty(id, qty) {
    if (qty <= 0) delete cart[id];
    else cart[id] = Math.min(qty, MAX_QTY);
    saveCart();
    renderCart();
  }

  var cartEl = $("#cart");
  var cartBtn = $("#cartOpen");
  var cartClose = $("#cartClose");
  var cartList = $("#cartList");
  var overlay = $("#overlay");
  var lastFocus = null;
  var overlayTimer = null;

  function renderCart() {
    var ids = Object.keys(cart);
    var count = itemCount();
    var countEl = $("#cartCount");
    countEl.textContent = String(count);
    countEl.classList.toggle("is-visible", count > 0);
    cartBtn.setAttribute("aria-label", "Open basket, " + count + (count === 1 ? " item" : " items"));

    $("#cartEmpty").hidden = ids.length > 0;
    $("#cartFoot").hidden = ids.length === 0;

    cartList.innerHTML = ids.map(function (id) {
      var b = BOOK_BY_ID[id];
      var qty = cart[id];
      return '<li class="cart__item">' +
        coverHtml(b) +
        "<div>" +
          '<p class="cart__name">' + esc(b.title) + "</p>" +
          '<p class="cart__meta">' + esc(b.author) + " · " + money(b.price) + "</p>" +
        "</div>" +
        '<div class="cart__right">' +
          '<span class="cart__line">' + money(b.price * qty) + "</span>" +
          '<div class="qty">' +
            '<button type="button" data-dec="' + id + '" aria-label="Remove one copy of ' + esc(b.title) + '">−</button>' +
            '<span aria-label="Quantity ' + qty + '">' + qty + "</span>" +
            '<button type="button" data-inc="' + id + '" aria-label="Add one copy of ' + esc(b.title) + '">+</button>' +
          "</div>" +
        "</div>" +
      "</li>";
    }).join("");

    if (!ids.length) return;

    var sub = subtotal();
    var ship = shippingFor(sub);
    $("#cartSubtotal").textContent = money(sub);
    $("#cartDelivery").textContent = ship === 0 ? "Free" : money(ship);
    $("#cartTotal").textContent = money(sub + ship);
    $("#cartShipping").textContent = ship === 0
      ? "Your order qualifies for free delivery."
      : "Add " + money(FREE_SHIPPING_FROM - sub) + " more for free delivery.";
  }

  cartList.addEventListener("click", function (e) {
    var inc = e.target.closest("[data-inc]");
    var dec = e.target.closest("[data-dec]");
    var id, btn;
    if (inc) {
      id = inc.getAttribute("data-inc");
      if ((cart[id] || 0) >= MAX_QTY) { toast("You can order up to " + MAX_QTY + " copies of one book"); return; }
      setQty(id, (cart[id] || 0) + 1);
      btn = cartList.querySelector('[data-inc="' + id + '"]');
    } else if (dec) {
      id = dec.getAttribute("data-dec");
      setQty(id, (cart[id] || 0) - 1);
      btn = cartList.querySelector('[data-dec="' + id + '"]');
    } else {
      return;
    }
    // Keep keyboard focus in a sensible place after re-render
    (btn || cartClose).focus();
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
  }

  function closeCart(restoreFocus) {
    if (!cartEl.classList.contains("is-open")) return;
    overlay.classList.remove("is-visible");
    cartEl.classList.remove("is-open");
    cartEl.setAttribute("inert", "");
    cartEl.setAttribute("aria-hidden", "true");
    cartBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
    overlayTimer = setTimeout(function () { overlay.hidden = true; }, 300);
    if (restoreFocus !== false && lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  cartBtn.addEventListener("click", openCart);
  cartClose.addEventListener("click", function () { closeCart(); });
  overlay.addEventListener("click", function () { closeCart(); });
  $("#cartBrowse").addEventListener("click", function () { closeCart(false); });

  $("#cartClear").addEventListener("click", function () {
    cart = {};
    saveCart();
    renderCart();
    cartClose.focus();
  });

  $("#checkout").addEventListener("click", function () {
    var sub = subtotal();
    var total = sub + shippingFor(sub);
    cart = {};
    saveCart();
    renderCart();
    closeCart();
    toast("Thank you! Your order of " + money(total) + " has been placed.");
  });

  // Add / open buttons anywhere on the page (grid, featured section)
  document.addEventListener("click", function (e) {
    var addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      addToCart(addBtn.getAttribute("data-add"));
      if (addBtn.classList.contains("add")) {
        var label = addBtn.querySelector("span");
        addBtn.classList.add("is-added");
        label.textContent = "Added";
        clearTimeout(addBtn._t);
        addBtn._t = setTimeout(function () {
          addBtn.classList.remove("is-added");
          label.textContent = "Add";
        }, 1200);
      }
      return;
    }
    var openBtn = e.target.closest("[data-open]");
    if (openBtn) openBook(openBtn.getAttribute("data-open"));
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (cartEl.classList.contains("is-open")) closeCart();
      else if (!supportsDialog && modal.hasAttribute("open")) closeBook();
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

  renderCart();

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
