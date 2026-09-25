# Maikini Knigi — Backend

Spring Boot 4.0.8 (Java 21) API for the bookshop: books, anonymous baskets, orders and Stripe card payments.

- **PostgreSQL** stores books (`items`), orders (`orders`) and order lines (`order_items`).
- **Redis** stores each shopper's basket for 2 days.
- **Stripe Checkout** takes card payments. A card order is only created once Stripe confirms the payment.

## Run it locally

You need Java 21, and PostgreSQL and Redis. The easiest way to get the databases is Docker:

```sh
cd backend
docker compose up -d          # PostgreSQL on 5432 (database maikini_knigi), Redis on 6379
./mvnw spring-boot:run        # API on http://localhost:8080  (Windows: mvnw.cmd spring-boot:run)
```

On first start the tables are created and three books are added (Time Shelter, Dune, Pride and Prejudice).

Then serve the frontend from the repository root on port 5500 and open http://localhost:5500:

```sh
python3 -m http.server 5500   # or VS Code "Live Server"
```

Open the page as `http://localhost:5500`, not as a `file://` path, so the browser keeps the basket cookie.

## Settings

All settings have local defaults and can be changed with environment variables.

| Variable | Default | What it is |
| --- | --- | --- |
| `DB_URL` | `jdbc:postgresql://localhost:5432/maikini_knigi` | PostgreSQL connection |
| `DB_USERNAME` / `DB_PASSWORD` | `postgres` / `postgres` | PostgreSQL login |
| `REDIS_HOST` / `REDIS_PORT` | `localhost` / `6379` | Redis (`SPRING_DATA_REDIS_PASSWORD` if it has a password) |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | `admin` / `change-me` | Login for the admin endpoints. **Change the password.** |
| `STRIPE_SECRET_KEY` | *(empty)* | Stripe secret key (`sk_test_…`). Without it only cash orders work. |
| `STRIPE_WEBHOOK_SECRET` | *(empty)* | Signing secret of the webhook (`whsec_…`). Without it card orders are never created. |
| `FRONTEND_URL` | `http://localhost:5500` | Where Stripe sends customers back after paying |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5500,http://127.0.0.1:5500,http://localhost:8000,http://127.0.0.1:8000` | Sites allowed to call the API |
| `COOKIE_SECURE` / `COOKIE_SAME_SITE` | `false` / `Lax` | Basket cookie options. Use `true` on HTTPS. |
| `PORT` | `8080` | HTTP port |

Basket lifetime (2 days), cookie lifetime (7 days) and delivery pricing (€3.99, free from €40) are in `src/main/resources/application.yml`.

## Card payments with Stripe (test mode)

1. Take the test secret key from the Stripe dashboard and start the backend with `STRIPE_SECRET_KEY=sk_test_…`.
2. Install the [Stripe CLI](https://docs.stripe.com/stripe-cli) and forward webhooks to the backend:
   ```sh
   stripe listen --forward-to localhost:8080/api/payments/webhook
   ```
   It prints a signing secret (`whsec_…`). Restart the backend with `STRIPE_WEBHOOK_SECRET` set to it.
3. Check out with **Card** and pay with the test card `4242 4242 4242 4242` (any future date, any CVC).
   Stripe calls the webhook, the order is created and the basket is emptied.

## How shoppers are identified

There are no customer accounts. The first time someone adds a book, the backend creates a random id and
returns it in an `anon_id` cookie that lasts 7 days (HttpOnly, SameSite=Lax). Later requests reuse that id;
a new one is only created when the cookie is missing or invalid. The basket is a Redis hash under
`cart:<id>`, with one field per book id. It expires 2 days after the last change.

## API

Errors come back as JSON with a readable `detail` message (and `errors` per field for validation problems).

| Method | Path | Who | What it does |
| --- | --- | --- | --- |
| `GET` | `/api/items` | anyone | All books, with price and copies in stock |
| `POST` | `/api/cart/items` | anyone | Add a book: `{"itemId": 1, "quantity": 1}`. Sets the `anon_id` cookie if missing. |
| `GET` | `/api/cart` | anyone | The shopper's basket with subtotal, delivery and total |
| `PUT` | `/api/cart/items/{itemId}` | anyone | Set a book's quantity: `{"quantity": 2}`; `0` removes it |
| `DELETE` | `/api/cart` | anyone | Empty the basket |
| `POST` | `/api/orders` | anyone | Check out (see below) |
| `POST` | `/api/payments/webhook` | Stripe | Stripe events; verified with the webhook signing secret |
| `GET` | `/api/admin/orders` | admin | All orders, newest first |
| `PATCH` | `/api/admin/items/{itemId}/quantity` | admin | Add copies to stock: `{"amount": 10}` |

`POST /api/orders` body:

```json
{
  "firstName": "Ana",
  "lastName": "Petrova",
  "email": "ana@example.com",
  "address": "ul. Otets Paisiy 18, Plovdiv",
  "phoneNumber": "+359 888 123 456",
  "paymentType": "CASH"
}
```

- `CASH`: the order is created immediately (`201`), stock is reduced and the basket is emptied.
- `CARD`: the response (`200`) has a `checkoutUrl`; send the customer there. The order is created when
  Stripe reports the payment as paid.

Admin endpoints use HTTP Basic auth, for example:

```sh
curl -u admin:change-me http://localhost:8080/api/admin/orders
curl -u admin:change-me -X PATCH http://localhost:8080/api/admin/items/1/quantity \
     -H 'Content-Type: application/json' -d '{"amount": 5}'
```

## Data model

- `BaseItem` (shared fields `name`, `price`, `quantity`) is extended by both `Item` and `OrderItem`.
  It is a JPA mapped superclass, so order lines get their own table and never appear as books in the inventory.
- `Item` — a book; `quantity` is the number of copies in stock.
- `Order` — first name, last name, email, address, phone number, `paymentType` (`CARD` or `CASH`),
  `createdAt` (time of purchase), and a set of `OrderItem`s. It also stores `deliveryFee`, `total` and,
  for card orders, the Stripe session id (so repeated webhook deliveries don't create duplicates).
- `OrderItem` — the book's id, name and price at the time of purchase, and the number of copies bought.

If a paid card order asks for more copies than are left (someone else bought them while the customer was
paying), the order is still saved because the money was taken, and an `ERROR` line starting with
`PAID ORDER OVERSOLD` is logged so staff can refund or restock.

## Tests

```sh
./mvnw test
```

The unit tests don't need PostgreSQL or Redis.
