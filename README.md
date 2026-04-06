# Advanced Billing System — Java Spring Boot

## Tech Stack
- Backend: Java 17 + Spring Boot 3 + Spring Data JPA
- Database: MySQL
- Frontend: HTML + CSS + Vanilla JS (served by Spring Boot)

## REST API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/login | Login with username & password |
| GET | /api/products | Get all products |
| POST | /api/products | Add a new product |
| DELETE | /api/products/{id} | Delete a product |
| GET | /api/bills | Get all bills |
| POST | /api/bills | Save a new bill (also deducts stock) |

---

## Deploy on Railway (Recommended — Free Tier Available)

### Step 1 — Set up MySQL on Railway
1. Go to https://railway.app and sign up / log in
2. Click **New Project → Deploy MySQL**
3. Once it starts, click on the MySQL service → **Variables** tab
4. Copy: `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`

### Step 2 — Run the database SQL
1. In Railway, click MySQL → **Data** tab → **Query**
2. Paste the contents of `database.sql` and run it

### Step 3 — Deploy the Java app
1. Push this entire folder to a GitHub repository
2. In Railway, click **New Service → GitHub Repo**
3. Select your repo — Railway will auto-detect the Dockerfile and build it

### Step 4 — Set Environment Variables
In your Java service on Railway, go to **Variables** and add:

```
DATABASE_URL=jdbc:mysql://<MYSQLHOST>:<MYSQLPORT>/<MYSQLDATABASE>?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USER=<MYSQLUSER>
DB_PASSWORD=<MYSQLPASSWORD>
```

Replace `<...>` with the values you copied from Step 1.

### Step 5 — Access your app
Railway gives you a public URL like `https://your-app.up.railway.app`.
Open it — the login page will appear. Use **admin / admin123**.

---

## Deploy on Render (Alternative)

1. Push to GitHub
2. Go to https://render.com → **New Web Service** → connect your repo
3. Set **Environment** = Docker
4. Add a **MySQL** database service on Render or use PlanetScale (free MySQL cloud)
5. Set the same environment variables as above

---

## Local Development (optional)

1. Install Java 17+ and Maven
2. Install MySQL locally, run `database.sql`
3. Edit `src/main/resources/application.properties` with your local DB credentials
4. Run: `mvn spring-boot:run`
5. Open: http://localhost:8080
