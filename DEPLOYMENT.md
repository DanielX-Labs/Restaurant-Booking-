# Production deployment

The API is configured for Render and the Vite frontend for Vercel. Never copy a local `.env` file into Git or commit credentials.

## 1. Deploy the backend to Render

1. Push this repository to GitHub.
2. In Render, create a **Blueprint** and select the repository. Render reads the root `render.yaml` and uses `backend` as the service root.
3. Enter every environment variable marked `sync: false` in the Render dashboard.
4. Set `CLIENT_URL` to the exact Vercel production origin, for example `https://your-app.vercel.app`. Do not include a trailing slash. Multiple exact origins can be comma-separated.
5. Use a MongoDB Atlas connection string for `MONGO_URL`. Allow connections from Render and use a least-privilege database user.
6. Use a strong `ADMIN_PASSWORD` of at least 12 characters. Render generates `JWT_SECRET`; do not change it after users begin signing in unless all sessions should be invalidated.
7. Confirm `https://your-render-service.onrender.com/health` returns `{ "success": true }`.

Render settings are already declared as:

- Build: `npm ci --omit=dev`
- Start: `npm start`
- Health check: `/health`
- Runtime: Node

## 2. Deploy the frontend to Vercel

1. Import the same repository in Vercel.
2. Set the project **Root Directory** to `frontend`.
3. Vercel reads `frontend/vercel.json`; the build output is `dist` and SPA route rewrites are configured.
4. Add `VITE_BASE_URL=https://your-render-service.onrender.com` to Production, Preview, and Development as appropriate. Do not include a trailing slash.
5. Deploy, then copy the final Vercel URL into Render's `CLIENT_URL` and redeploy/restart the API.

## 3. Required production verification

- Register and log in from the Vercel site; verify the secure cross-site session cookie is created.
- Add an item to the cart, place an order, book a table, and open its receipt.
- Log in as admin, upload a profile image, update order/booking status, search a payment reference, and confirm a physical payment.
- Verify Cloudinary uploads and Brevo emails.
- Confirm refreshing a nested frontend URL such as `/menu` or `/my-orders` does not return 404.

Production authentication depends on both services using HTTPS, `NODE_ENV=production` on Render, the exact Vercel URL in `CLIENT_URL`, and `VITE_BASE_URL` pointing to the Render HTTPS URL.
