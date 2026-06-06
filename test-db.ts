import "dotenv/config"

console.log("URL is:", process.env.DATABASE_URL ? "FOUND ✓" : "MISSING ✗")
console.log("First 30 chars:", process.env.DATABASE_URL?.slice(0, 30))