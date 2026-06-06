# TalentDash 

**A normalized salary analytics platform built with Next.js 15, Prisma, and PostgreSQL.**

TalentDash collects, cleans, and aggregates compensation data into a structured dataset for accurate salary insights. The platform includes a server-side normalization pipeline, duplicate submission protection, and statistical compensation analysis across companies, locations, and experience levels.

---

## ✨ Features

### Salary Ingestion Engine

* Automatic company name normalization
* Server-side compensation validation
* Total Compensation (TC) calculation
* 48-hour duplicate submission detection
* Case-insensitive data standardization

### Analytics & Insights

* Median compensation calculations
* Company-level salary breakdowns
* Level and experience distribution analysis
* Compensation comparison tools
* Paginated salary exploration

### Performance & Reliability

* PostgreSQL-backed persistence
* Prisma ORM type safety
* Optimized API queries
* BigInt support for compensation fields
* Server-side validation and error handling

---

## 🏗️ Tech Stack

| Layer            | Technology      |
| ---------------- | --------------- |
| Frontend         | Next.js 15      |
| Language         | TypeScript      |
| Database         | PostgreSQL      |
| ORM              | Prisma          |
| Hosting          | Vercel          |
| Database Hosting | Neon PostgreSQL |

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/talent-dash.git
cd talent-dash
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

### 5. Seed Sample Data

```bash
npx prisma db seed
```

### 6. Start Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🗄️ Database Design

Compensation data is stored using PostgreSQL and Prisma.

Financial values are maintained using **BigInt** to ensure precision and avoid overflow issues when handling large compensation packages.

The schema includes:

* Companies
* Salaries
* Compensation components
* Experience levels
* Locations

---

## 🌱 Seeding & Data Normalization

The seed script populates the database with realistic salary data and demonstrates TalentDash's normalization pipeline.

Examples:

| Input        | Normalized Output |
| ------------ | ----------------- |
| GOOGLE       | google            |
| Google India | google            |
| google       | google            |

This ensures that salary data from different submissions maps consistently to a single company entity.

---

## 📡 API Endpoints

### POST `/api/ingest-salary`

Creates a salary submission.

Features:

* Input normalization
* Total Compensation calculation
* Duplicate detection
* Validation checks

Returns:

* `201 Created`
* `409 Conflict` for duplicate submissions

---

### GET `/api/salaries`

Retrieve salary records with:

* Pagination
* Search filters
* Case-insensitive matching

---

### GET `/api/companies/[slug]`

Returns:

* Company information
* Median compensation
* Salary distribution
* Level breakdowns

---

### GET `/api/compare?s1=id1&s2=id2`

Compare two salary submissions across:

* Base Salary
* Bonus
* Stock Compensation
* Experience
* Level

---

## 🧪 Development Commands

### Run Linter

```bash
npm run lint
```

### Generate Production Build

```bash
npm run build
```

### Start Production Server

```bash
npm run start
```

---

## 🌐 Deployment

**Live Application**

```text
https://talent-dash-yourlink.vercel.app
```

**Infrastructure**

* Vercel Hosting
* Neon Serverless PostgreSQL
* Prisma ORM

---

## 📈 Future Improvements

* Salary trend visualization
* Advanced filtering
* Authentication & user accounts
* CSV import/export
* Regional compensation insights
* Interactive analytics dashboards

---

## 📄 License

This project is licensed under the MIT License.
