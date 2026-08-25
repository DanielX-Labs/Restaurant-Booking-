# Restaurant

Restaurant is a full-stack food ordering, table-reservation, and restaurant-management platform. It combines a React and Vite customer experience with an Express API, MongoDB persistence, cookie-based JWT authentication, Cloudinary image storage, and Brevo email delivery.

Customers can browse the live menu, manage a cart, place an order, reserve a table, and access payment receipts from their account. Restaurant administrators can manage categories, menu items, orders, reservations, their profile, and physical payments from a responsive management dashboard.

All payments are completed physically at the restaurant. The application does not collect card or bank details and does not process online payments. Instead, each order or reservation receives a unique payment reference, receipt number, and QR code that staff can verify before confirming payment.

## Problems Restaurant solves

- **Disconnected ordering:** Customers can discover dishes, review details, maintain quantities, and place orders through one consistent flow.
- **Manual reservation tracking:** Table bookings capture guest information, date, time, party size, and notes in a searchable admin view.
- **Unclear payment status:** Booking/order status and payment status remain separate, so restaurant operations and money collection can be managed independently.
- **Slow physical-payment verification:** Unique references, receipt numbers, QR codes, and manual search help staff locate the correct record quickly.
- **Duplicate payment confirmation:** Atomic backend checks prevent an already-paid record from being confirmed again.
- **Unstructured menu administration:** Categories, dishes, pricing, availability, and images are managed from one protected dashboard.
- **Poor customer feedback:** Loading states, confirmation dialogs, friendly authentication prompts, and Sonner notifications provide clear interaction feedback.
- **Unsafe administrative actions:** Admin-only middleware protects management APIs, while confirmation dialogs guard logout, cancellation, deletion, and payment confirmation actions.

## Platform features

### Authentication and accounts

- Register and sign in with email and password.
- Hash customer passwords with bcrypt.
- Authenticate customers and administrators using HTTP-only JWT cookies.
- Keep customer and administrator authorization separate.
- Verify customer email addresses when Brevo email is configured.
- Request and complete password resets through expiring email links.
- Show or hide every password field with an accessible toggle.
- Return users to the public page they were viewing after authentication.
- Confirm every logout action before destroying the session cookie.

### Menu and categories

- Browse available menu items and view detailed descriptions.
- Search dishes by name.
- Organize dishes into administrator-managed categories.
- Upload category and menu images to Cloudinary.
- Set menu-item prices in Nigerian Naira.
- Mark items available or unavailable.
- Prevent unavailable or deleted items from being ordered.

### Cart and orders

- Add authenticated customers' menu items to a persistent MongoDB cart.
- Prompt signed-out customers to sign in before sending protected cart requests.
- Increase, decrease, or remove cart quantities.
- Calculate totals from current menu prices on the backend.
- Place orders with a delivery address.
- Track order status independently from payment status.
- Allow customers to cancel eligible pending orders.
- Prevent delivered orders from being changed again.

### Table reservations

- Prompt unauthenticated customers to sign in before reserving a table.
- Store customer name, email, phone, date, time, guest count, and optional notes.
- Reject past reservation dates and conflicting active time slots.
- Display customer booking times in a 12-hour AM/PM format.
- Allow administrators to approve or cancel reservations.
- Allow customers to view and cancel eligible reservations.

### Physical payments and receipts

- Set every new payment method to **Pay at Restaurant**.
- Initialize each payment as **Payment Pending**.
- Generate a unique payment reference, receipt number, and QR-code reference.
- Encode only a secure lookup reference in the QR code.
- Display mobile-friendly order and booking receipts.
- Print or download receipts through the browser's print/PDF support.
- Search payments by reference, receipt number, record ID, customer name, or email.
- Confirm physical payment through an administrator confirmation dialog.
- Store confirmation date, confirming administrator, and confirmed amount.
- Prevent duplicate confirmation with an atomic backend status check.
- Update an existing pending receipt to show paid information.

### Admin dashboard

- Responsive desktop, tablet, and mobile navigation.
- Collapsible desktop sidebar and mobile off-canvas drawer.
- Dynamic page titles and administrator account dropdown.
- Dashboard KPIs, recent orders, and reservation summaries.
- Manage categories, menu items, orders, bookings, and payments.
- Display all monetary values in Nigerian Naira.
- Upload and replace the administrator profile image through Cloudinary.
- Persist administrator display name, title, phone number, and avatar.
- Verify QR/reference payments and confirm money received at the restaurant.

### Notifications and email

- Use Sonner for frontend success and error notifications.
- Send verification and password-reset emails when Brevo is configured.
- Email order and reservation receipt information to customers.
- Inform customers that no online payment is required.
- Email customers after restaurant staff confirm payment.
- Queue email delivery so a temporary SMTP problem does not fail a completed order or booking.

### Application experience

- Responsive public pages, authentication, menu, cart, booking, account, receipt, and admin interfaces.
- Accessible focus states, keyboard controls, dropdowns, password toggles, and modals.
- Automatic scroll-to-top for normal public route navigation.
- Intentional hash navigation, including receipt QR links, remains supported.
- Sonner notifications and customer-friendly authentication prompts.
- Structured backend HTTP logs with method, route, status, duration, and IP address.
- Reduced-motion support for customers who request it at operating-system level.

## How the system works

### 1. Customer authentication

1. A customer registers with a name, normalized email address, and password.
2. The backend hashes the password with bcrypt and stores the user in MongoDB.
3. When email delivery is configured, the backend emails a verification link.
4. On successful sign-in, Express signs a JWT and stores it in an HTTP-only cookie.
5. Axios sends credentials with API requests.
6. Customer middleware verifies that the token contains a valid customer role and ID.
7. Protected frontend actions check authentication before calling the API, while backend middleware remains the security authority.

The browser never receives password hashes. In production, cookies are secure and use `SameSite=None` for the Vercel-to-Render deployment.

### 2. Building a cart and placing an order

1. An authenticated customer adds an available menu item to their cart.
2. MongoDB stores item references and quantities for that customer.
3. The customer adjusts quantities and reviews the computed total.
4. At checkout, the backend reloads current menu records and calculates the authoritative amount.
5. The backend creates one order, clears the cart, and generates physical-payment metadata.
6. The customer is redirected to the generated receipt.
7. If configured, Brevo emails the receipt reference and payment instructions.

### 3. Reserving a table

1. The customer opens the reservation form.
2. Signed-out customers receive a sign-in prompt and return to the booking route after authentication.
3. The backend validates required fields and checks that the requested date and time are in the future.
4. Conflicting active slots are rejected.
5. MongoDB stores the reservation and its physical-payment metadata.
6. The customer receives a receipt and, when configured, an email notification.

### 4. Confirming physical payment

1. The customer presents a receipt or QR code at the restaurant.
2. An authorized administrator opens the Payments dashboard.
3. Staff scan the QR value with a keyboard scanner or search manually.
4. The backend locates the matching order or reservation without exposing sensitive data in the QR code.
5. Staff review the customer, amount, booking/order status, and payment status.
6. A confirmation modal asks staff to confirm that money was physically received.
7. An atomic database update changes **Payment Pending** to **Paid** and stores confirmation metadata.
8. The existing customer receipt shows the paid status and confirmation time.

## Workflow summary

```text
Customer browses the menu
          |
          +-- Add item -- authentication check -- persistent cart
          |                                      |
          |                                  Checkout
          |                                      |
          |                                    Order
          |
          +-- Reserve table -- authentication check -- Booking
                                                        |
Order or booking ---------------------------------------+
          |
Generate receipt + payment reference + secure QR code
          |
Payment Pending — Pay at Restaurant
          |
Customer presents receipt or QR code
          |
Admin searches/verifies record
          |
Confirmation dialog + atomic backend check
          |
Paid receipt + confirmation email
```

## Database collection diagram

```text
User
├── Cart
│   └── items[] ───────────────> MenuItem
├── Order[]
│   ├── items[] ───────────────> MenuItem
│   └── payment metadata
└── Booking[]
    └── payment metadata

Category
└── MenuItem[]

AdminProfile
├── name, email, phone, title
└── Cloudinary profile image

Order / Booking
├── paymentReference
├── receiptNumber
├── qrCodeReference
├── paymentStatus
└── paymentConfirmedAt / paymentConfirmedBy
```

## Project structure

```text
restaurant/
├── backend/                         Express REST API
│   ├── config/                      MongoDB, Cloudinary, and Brevo configuration
│   ├── controllers/                 authentication, menu, cart, order, booking, payment logic
│   ├── middlewares/                 JWT authorization, upload, and rate limiting
│   ├── models/                      Mongoose application schemas
│   ├── routes/                      REST endpoint declarations
│   ├── test/                        API health and routing tests
│   ├── utils/                       mail, image, QR, and payment helpers
│   ├── index.js                     Express application and server entry
│   ├── package.json
│   └── .env.example
├── frontend/                        React and Vite web application
│   ├── src/
│   │   ├── assets/                  bundled static assets
│   │   ├── components/              navigation, cards, dialogs, inputs, and home sections
│   │   ├── context/                 shared authentication, cart, and catalog state
│   │   ├── pages/                   public and customer pages
│   │   │   └── admin/               protected administration pages
│   │   ├── utils/                   shared currency formatting
│   │   ├── App.jsx                  routes and global UI providers
│   │   └── index.css                Tailwind import and global design styles
│   ├── vercel.json                  Vercel build, SPA rewrites, caching, and headers
│   ├── package.json
│   └── .env.example
├── render.yaml                      Render backend Blueprint
├── DEPLOYMENT.md                    Render and Vercel deployment guide
├── .gitignore                       secret and generated-file protection
└── README.md
```

The frontend and backend have separate package manifests and lockfiles. Install and run them from their respective directories.

## Tools and their purpose

| Tool | Purpose |
| --- | --- |
| React 19 | Customer and administrator interfaces. |
| Vite | Frontend development server and production bundle. |
| React Router | Public, customer, receipt, authentication, and admin routes. |
| Tailwind CSS | Responsive layouts and shared visual styling. |
| Axios | Credentialed communication with the Express API. |
| Sonner | Non-blocking success and error notifications. |
| Lucide React | Accessible interface icons. |
| Express 5 | REST API, middleware, routing, security headers, and health checks. |
| MongoDB Atlas | Persistent customer, catalog, cart, order, booking, and profile data. |
| Mongoose | Schemas, validation, references, indexes, and database queries. |
| JSON Web Token | Signed customer and administrator authentication cookies. |
| bcryptjs | Customer-password hashing and verification. |
| Multer | Validated image upload handling with size limits. |
| Cloudinary | Persistent category, menu, and administrator image storage. |
| Nodemailer | SMTP email transport. |
| Brevo SMTP | Verification, password-reset, receipt, and payment-confirmation email delivery. |
| QRCode | Secure payment-reference QR image generation. |
| Render | Express API hosting and health monitoring. |
| Vercel | Vite frontend hosting, SPA rewrites, caching, and response headers. |

## Requirements

- Node.js 20 or newer
- npm
- MongoDB Atlas database
- Cloudinary account for image uploads
- Brevo SMTP credentials for production email delivery
- Render account for backend deployment
- Vercel account for frontend deployment

## Local installation

Clone the repository, then install each application independently:

```bash
cd backend
npm install
copy .env.example .env
```

Configure the backend `.env`, then:

```bash
npm start
```

In another terminal:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

On macOS or Linux, replace `copy` with `cp`.

The default local addresses are:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/health`

## Environment variables

Use the committed `.env.example` files as templates. Never commit actual secrets.

### Backend

| Variable | Purpose |
| --- | --- |
| `PORT` | Local API port; Render supplies its own port. |
| `MONGO_URL` | MongoDB connection string. |
| `JWT_SECRET` | Strong secret of at least 32 characters. |
| `NODE_ENV` | Use `development` locally and `production` on Render. |
| `CLIENT_URL` | Exact frontend origin; comma-separated origins are supported. |
| `ADMIN_EMAIL` | Environment-managed administrator login email. |
| `ADMIN_PASSWORD` | Strong administrator password of at least 12 characters. |
| `CLOUDINARY_*` | Cloudinary account and API credentials. |
| `BREVO_*` | Sender identity and Brevo SMTP connection credentials. |
| `SUPPORT_EMAIL` | Customer-facing support/sender contact. |
| `RESTAURANT_*` | Receipt name, address, phone number, and logo. |
| `CURRENCY` | Receipt currency; configured as `NGN`. |

### Frontend

| Variable | Purpose |
| --- | --- |
| `VITE_BASE_URL` | Express API origin, without a trailing slash. |

## Available commands

### Backend

```bash
npm start       # start the Express API
npm run server  # start development mode with Nodemon
npm test        # run backend tests
```

### Frontend

```bash
npm run dev     # start Vite development mode
npm run build   # create a production bundle
npm run lint    # run ESLint
npm run preview # preview the production bundle locally
```


## Deployment

Production configuration is included:

- `render.yaml` deploys the backend from the `backend` directory.
- `frontend/vercel.json` builds the Vite app and supports client-side route refreshes.
- `DEPLOYMENT.md` contains step-by-step environment and verification instructions.

For cross-origin authentication, use HTTPS, set `NODE_ENV=production` on Render, set Render's `CLIENT_URL` to the exact Vercel origin, and set Vercel's `VITE_BASE_URL` to the exact Render origin.

## Security notes

- Keep `.env` files, JWT secrets, administrator credentials, MongoDB credentials, Cloudinary secrets, and Brevo keys out of Git.
- Rotate any credential that has been publicly exposed or shared in logs.
- Customers cannot change their own payment status.
- Only the configured administrator identity can access admin APIs.
- QR codes contain lookup references rather than customer details or authentication tokens.
- The backend recalculates order totals instead of trusting customer-submitted totals.
- Production cookies are HTTP-only and secure.
- CORS and mutation-origin checks use the configured frontend origins.
- Image uploads enforce type and size restrictions.

## Product scope

Restaurant is an MVP restaurant-ordering and operations platform. It records payment status for money collected physically at the restaurant. It is not an online payment gateway, card processor, banking application, inventory-accounting suite, delivery-fleet platform, or substitute for a restaurant's legal, tax, and compliance processes.
