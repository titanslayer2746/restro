# Restro — Restaurant POS

A point-of-sale system for running a restaurant floor: seat guests, take orders, track them through the kitchen, record payments and reconcile them in a daily ledger.

Built with React + Vite on the front end and Node.js, Express and MongoDB on the back end.

## Features

- **Tables** — a live floor plan. Admins add tables by seat count; table numbers are assigned automatically. Seating a guest books the table; clearing it frees the table and marks its open orders as completed.
- **Menu** — categories and dishes stored in MongoDB. Admins add categories and dishes from the dashboard; a seed script loads a starter menu.
- **Orders** — build a cart per table and place it. The same guest can order as many times as they like during a sitting; every order is linked to a customer record (matched by phone number).
- **Kitchen tickets** — orders appear on a rail as tickets and move through *In Progress → Ready → Completed*.
- **Payments ledger** — orders are paid by **Cash** or **Online** and start as *Pending*. A cashier checks the money and marks each payment *Verified*. The ledger groups entries by day, shows totals, filters by method and status, and exports to CSV.
- **Receipts** — a printable receipt for every order.
- **Dashboard** — revenue, orders, new customers and average order value for the last 30 days, compared with the 30 days before; plus staff management.
- **Roles** — Waiter, Cashier and Admin, enforced on the server.

## Roles

| Role    | Can do                                                                 |
| ------- | ---------------------------------------------------------------------- |
| Waiter  | Seat guests, take and place orders, clear tables                       |
| Cashier | Everything a waiter can, plus verify payments in the ledger            |
| Admin   | Everything, plus the dashboard: add tables, categories, dishes; manage staff roles |

New accounts always start as **Waiter**. The one exception is the very first account created on an empty database, which becomes **Admin** so that someone can manage roles. Admins change roles from **Dashboard → Staff**. The server never lets the last admin be demoted.

## Tech stack

| Layer    | Tools |
| -------- | ----- |
| Client   | React 19, Vite, React Router, Redux Toolkit, TanStack Query, Axios, Tailwind CSS, Framer Motion, notistack |
| Server   | Node.js, Express, Mongoose, JSON Web Tokens (HTTP-only cookie), bcrypt |
| Database | MongoDB (local or Atlas) |

## Project structure

```
restaurant-management/
├── client/                  React app (Vite)
│   └── src/
│       ├── pages/           Landing, Auth, Home, Tables, Menu, Orders, Payments, Dashboard
│       ├── components/      UI grouped by feature (menu, tables, orders, ledger, dashboard, shared…)
│       ├── hooks/           useLoadData (session), useMenu
│       ├── https/           API client and endpoints
│       ├── redux/           user, customer and cart slices
│       └── utils/           formatting helpers
└── server/                  Express API
    ├── config/              environment and MongoDB connection
    ├── controllers/         request handlers
    ├── middlewares/         auth (isVerifiedUser, isAdmin, hasRole) and error handler
    ├── models/              User, Table, Order, Customer, Category, Dish
    ├── routes/              API routes
    ├── scripts/             seedMenu, linkOrdersToCustomers
    └── seed/                starter menu data
```

## Getting started

### Prerequisites

- Node.js 18 or newer
- A MongoDB database (local, or a free MongoDB Atlas cluster)

### 1. Server

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/restro
JWT_SECRET=a-long-random-string
NODE_ENV=development
# Optional: frontend URLs allowed to call the API directly (comma-separated)
CLIENT_URL=
```

Load the starter menu (safe to run more than once — it only adds what is missing):

```bash
npm run seed:menu
```

Start the API:

```bash
npm run dev     # with auto-reload
npm start       # plain node
```

### 2. Client

```bash
cd client
npm install
```

Create `client/.env` pointing at the server:

```env
VITE_BACKEND_URL=http://localhost:8000
```

Start the app:

```bash
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173), register the first account — it becomes the admin — and add a few tables from the dashboard.

### Scripts

| Where  | Command                          | What it does |
| ------ | -------------------------------- | ------------ |
| server | `npm run dev`                    | Start the API with nodemon |
| server | `npm run seed:menu`              | Load the starter menu into MongoDB |
| server | `npm run backfill:customers`     | Preview linking older orders to customers by phone; add `-- --apply` to write |
| client | `npm run dev`                    | Start the Vite dev server |
| client | `npm run build`                  | Production build into `client/dist` |
| client | `npm run lint`                   | Run ESLint |

## How an order flows

1. **Seat** — a waiter taps **New order**, enters the guest's name, phone and party size, then picks a free table.
2. **Order** — dishes go into the cart; the bill on the right updates as a live receipt. Pick Cash or Online and place the order. The server saves it, links it to the customer and books the table.
3. **Order again** — the guest and table stay selected, so more rounds can be placed on the same table.
4. **Kitchen** — the order appears on the Orders rail; its status is updated from the dashboard.
5. **Pay** — the cashier opens **Ledger**, confirms the cash or transfer, and clicks **Verify**.
6. **Clear** — when the guest leaves, **Clear** on the table frees it and marks its open orders *Completed*.

## API

All routes are under `/api` and, apart from register and login, require the auth cookie.

| Method | Route                          | Access         | Purpose |
| ------ | ------------------------------ | -------------- | ------- |
| POST   | `/user/register`               | public         | Create an account (starts as Waiter) |
| POST   | `/user/login`                  | public         | Log in; sets the auth cookie |
| POST   | `/user/logout`                 | signed in      | Log out |
| GET    | `/user`                        | signed in      | Current user |
| GET    | `/user/staff`                  | Admin          | List staff |
| PUT    | `/user/:id/role`               | Admin          | Change a user's role |
| GET    | `/table`                       | signed in      | List tables |
| POST   | `/table`                       | Admin          | Add a table (`{ seats }`; number is assigned) |
| PUT    | `/table/:id/clear`             | signed in      | Free a table and complete its open orders |
| GET    | `/menu`                        | signed in      | Categories with their dishes |
| POST   | `/menu/category`               | Admin          | Add a category |
| POST   | `/menu/dish`                   | Admin          | Add a dish |
| GET    | `/order`                       | signed in      | List orders, newest first |
| POST   | `/order`                       | signed in      | Place an order (payment starts as Pending) |
| PUT    | `/order/:id`                   | signed in      | Update order status |
| PUT    | `/order/:id/payment`           | Cashier, Admin | Mark a payment Verified or Pending |
| GET    | `/customer`                    | signed in      | List customers |
| GET    | `/customer/:id/orders`         | signed in      | A customer's orders |

## Deployment

Both apps deploy to Vercel as separate projects (the server also runs on Render via `server/render.yaml`).

- **Server** (root directory `server`) — set `MONGODB_URI`, `JWT_SECRET` and `NODE_ENV=production`. `app.js` exports the Express app, so it runs on Vercel's serverless functions; locally it starts a normal server. In MongoDB Atlas, allow access from anywhere (`0.0.0.0/0`) under *Network Access*, since Vercel's IPs change.
- **Client** (root directory `client`) — `client/vercel.json` proxies `/api/*` to the deployed server and sends every other path to `index.html`. Leave `VITE_BACKEND_URL` **unset** in the Vercel project: the browser then talks to one origin, so no CORS setup is needed and the login cookie is first-party. Update the server URL in `vercel.json` if it changes.
- **Calling the API directly instead** — set `VITE_BACKEND_URL` to the server URL, and add the frontend URL to the server's `CLIENT_URL` variable (comma-separated for several). The auth cookie is sent with `SameSite=None; Secure`, so this needs HTTPS, and browsers that block third-party cookies may reject it — the proxy above avoids that.

Never put `MONGODB_URI` or `JWT_SECRET` in the client: every `VITE_*` variable ends up in the public JavaScript.

## License

ISC
