# TalentDash

Salary intelligence platform for software engineers. Structured compensation data with company normalization, duplicate detection, and median-based salary analytics built on Next.js 15, Prisma, and PostgreSQL.

## Live URL

https://talent-dash-mu.vercel.app/

---

## Tech Stack

**Framework:** Next.js 15 (App Router)
**Language:** TypeScript
**Styling:** Tailwind CSS
**Database:** PostgreSQL
**ORM:** Prisma 7
**Deploy:** Vercel

---

## Run Locally (Under 5 Minutes)

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/talentdash.git
cd talentdash

npm install
```

### 2. Set up environment variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

```

### 3. Set up database

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Start development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Environment Variables

| Variable            | Description                  |
| ------------------- | ---------------------------- |
| DATABASE_URL        | PostgreSQL connection string |

---

## API Endpoints

| Method | Route                   | Description                                       |
| ------ | ----------------------- | ------------------------------------------------- |
| GET    | `/api/salaries`         | List salary records with filtering and pagination |
| POST   | `/api/ingest-salary`    | Submit a new salary record                        |
| GET    | `/api/companies/[slug]` | Company details and compensation analytics        |
| GET    | `/api/compare?s1=&s2=`  | Compare two salary records                        |

---

## Architecture Decisions

### Server-side normalization

Salary submissions often contain inconsistent company names such as:

* Google
* GOOGLE
* Google India

The ingestion pipeline normalizes these variations into a single canonical company record before storage.

### Median over average

Compensation distributions are frequently skewed by extreme values. Company analytics therefore use median total compensation rather than arithmetic averages to better represent typical salaries.

### Duplicate submission protection

New submissions are checked against existing records within a 48-hour window. Records with matching company, role, level, and compensation values within a 10% salary range are rejected to reduce duplicate data.

### Offset pagination

The salary explorer uses page-based pagination because URLs such as:

```text
/salaries?page=3
```

are shareable, bookmarkable, and easier to index than cursor-based alternatives.

---

## Seed Data

Includes sample compensation records across major technology companies, covering multiple:

* Companies
* Levels
* Locations
* Experience bands

Used for local testing and analytics verification.

---

## Development Commands

```bash
npm run lint
```

Run lint checks.

```bash
npm run build
```

Create a production build.

```bash
npm run start
```

Run the production server locally.

---

## Future Improvements

* Salary trend tracking
* Authentication and user accounts
* Compensation visualizations
* Regional salary insights
* Advanced filtering and search
* Submission moderation workflow
