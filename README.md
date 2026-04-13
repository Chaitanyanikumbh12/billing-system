# 🧾 BillEase — Professional Billing System

A full-stack billing system with **Spring Boot** backend, **React** frontend, **Supabase** (PostgreSQL) database.

---

## 🗂️ Project Structure

```
billing-system/
├── backend/          ← Spring Boot (Java 17)  → Deploy to Railway
├── frontend/         ← React 18               → Deploy to Vercel
└── database/         ← schema.sql             → Run in Supabase
```

---

## ⚙️ Features

- 🔐 JWT authentication (register / login)
- 📦 Product management with stock tracking
- 👤 Customer management with GST numbers
- 🧾 Bill generation with live GST calculation (CGST/SGST or IGST)
- 📊 Dashboard with revenue stats and charts
- 🖨️ Printable invoices
- ⚠️ Low stock alerts
- 💳 Multiple payment methods (Cash, UPI, Card, Bank Transfer, Cheque)
- 📱 Responsive design

---

## 🚀 Local Development Setup

### Step 1 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) → open your project
2. Go to **SQL Editor** → paste & run `database/schema.sql`
3. Go to **Settings → Database** → copy the **Connection String (URI)**
   - It looks like: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`

### Step 2 — Backend (Spring Boot)

```bash
cd backend

# Create a local env file
cp src/main/resources/application.properties src/main/resources/application-local.properties
```

Edit `application-local.properties` and fill in your values:
```properties
spring.datasource.url=jdbc:postgresql://db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=YOUR_SUPABASE_PASSWORD
jwt.secret=YOUR_LONG_BASE64_SECRET
```

**Run the backend:**
```bash
# Make sure you have Java 17+ and Maven installed
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

The API will start at: `http://localhost:8080`

Verify it works: `http://localhost:8080/api/health`

### Step 3 — Frontend (React)

```bash
cd frontend

# Copy the env file
cp .env.example .env.local
# .env.local already points to http://localhost:8080

npm install
npm start
```

The app opens at: `http://localhost:3000`

---

## ☁️ Deployment

### Backend → Railway

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub**
3. Select the **`backend/`** folder as root (or set root directory in settings)
4. Add these **Environment Variables** in Railway:

| Variable | Value |
|---|---|
| `SUPABASE_DB_URL` | `jdbc:postgresql://db.[ref].supabase.co:5432/postgres` |
| `SUPABASE_DB_USER` | `postgres` |
| `SUPABASE_DB_PASSWORD` | your Supabase password |
| `JWT_SECRET` | a long base64 random string |
| `PORT` | `8080` |

5. Railway will auto-detect the Dockerfile and build/deploy.
6. Copy the Railway deployment URL (e.g. `https://your-app.up.railway.app`)

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project → Import from GitHub**
2. Set **Root Directory** to `frontend`
3. Add this **Environment Variable** in Vercel:

| Variable | Value |
|---|---|
| `REACT_APP_API_URL` | `https://your-app.up.railway.app` |

4. Click **Deploy**. Done!

---

## 🔑 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register user |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/health` | ❌ | Health check |
| GET | `/api/products` | ✅ | List products |
| POST | `/api/products` | ✅ | Add product |
| PUT | `/api/products/:id` | ✅ | Update product |
| DELETE | `/api/products/:id` | ✅ | Soft-delete product |
| GET | `/api/customers` | ✅ | List customers |
| POST | `/api/customers` | ✅ | Add customer |
| PUT | `/api/customers/:id` | ✅ | Update customer |
| DELETE | `/api/customers/:id` | ✅ | Delete customer |
| POST | `/api/bills` | ✅ | Create bill |
| GET | `/api/bills` | ✅ | List all bills |
| GET | `/api/bills/:id` | ✅ | Get single bill |
| GET | `/api/bills/dashboard` | ✅ | Dashboard stats |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.2, Spring Security, JPA/Hibernate |
| Auth | JWT (jjwt 0.11.5) |
| Database | PostgreSQL via Supabase |
| Frontend | React 18, React Router v6 |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Backend Deploy | Railway (Docker) |
| Frontend Deploy | Vercel |
