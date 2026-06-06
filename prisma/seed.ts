import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg";
import { mockSalaries } from "../lib/mock-data"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({
  adapter,
});


async function main() {
  console.log("Seeding companies...")

  // Get unique companies from mock data
  const uniqueCompanies = [
    ...new Map(mockSalaries.map((s) => [s.company_slug, s])).values(),
  ]

  const companyMap: Record<string, string> = {}

  const companyMeta: Record<string, object> = {
    google:    { industry: "Technology",       headquarters: "Bengaluru", founded_year: 1998, headcount_range: "100,000+" },
    amazon:    { industry: "E-Commerce/Cloud", headquarters: "Bengaluru", founded_year: 1994, headcount_range: "100,000+" },
    microsoft: { industry: "Technology",       headquarters: "Hyderabad", founded_year: 1975, headcount_range: "100,000+" },
    meta:      { industry: "Social Media",     headquarters: "Bengaluru", founded_year: 2004, headcount_range: "50,000+"  },
    flipkart:  { industry: "E-Commerce",       headquarters: "Bengaluru", founded_year: 2007, headcount_range: "10,000+"  },
    meesho:    { industry: "E-Commerce",       headquarters: "Bengaluru", founded_year: 2015, headcount_range: "5,000+"   },
    nvidia:    { industry: "Semiconductors",   headquarters: "Pune",      founded_year: 1993, headcount_range: "20,000+"  },
    razorpay:  { industry: "Fintech",          headquarters: "Bengaluru", founded_year: 2014, headcount_range: "2,000+"   },
    zepto:     { industry: "Quick Commerce",   headquarters: "Mumbai",    founded_year: 2021, headcount_range: "1,000+"   },
    tcs:       { industry: "IT Services",      headquarters: "Mumbai",    founded_year: 1968, headcount_range: "600,000+" },
    infosys:   { industry: "IT Services",      headquarters: "Bengaluru", founded_year: 1981, headcount_range: "300,000+" },
    wipro:     { industry: "IT Services",      headquarters: "Bengaluru", founded_year: 1945, headcount_range: "200,000+" },
    "tata-consultancy-services": { industry: "IT Services", headquarters: "Mumbai", founded_year: 1968, headcount_range: "600,000+" },
  }

  for (const record of uniqueCompanies) {
    const meta = companyMeta[record.company_slug] ?? {}
    const company = await prisma.company.upsert({
      where:  { slug: record.company_slug },
      update: {},
      create: {
        name:            record.company,
        slug:            record.company_slug,
        normalized_name: record.company_slug.replace(/-/g, ""),
        ...meta,
      },
    })
    companyMap[record.company_slug] = company.id
    console.log(`  ✓ ${record.company}`)
  }

  console.log(`✅ ${Object.keys(companyMap).length} companies seeded`)
  console.log("🌱 Seeding salaries...")

  let count = 0
  for (const r of mockSalaries) {
    const companyId = companyMap[r.company_slug]
    if (!companyId) {
      console.warn(`  ⚠ Skipping — no company found for slug: ${r.company_slug}`)
      continue
    }

    // Always recompute TC — never trust the mock value
    const total = r.base_salary + (r.bonus ?? 0) + (r.stock ?? 0)

    await prisma.salary.upsert({
      where: { id: r.id },
      update: {},
      create: {
        id:                 r.id,
        company_id:         companyId,
        role:               r.role,
        level:              r.level as any,
        location:           r.location,
        currency:           r.currency as any,
        experience_years:   r.experience_years,
        base_salary:        BigInt(r.base_salary),
        bonus:              BigInt(r.bonus ?? 0),
        stock:              BigInt(r.stock ?? 0),
        total_compensation: BigInt(total),
        source:             r.source as any,
        confidence_score:   r.confidence_score,
        is_verified:        r.is_verified,
      },
    })
    count++
  }

  console.log(`✅ ${count} salary records seeded`)
  console.log("🎉 Done!")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())