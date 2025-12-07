const { PrismaClient } = require('@prisma/client')

// Using the DIRECT_URL to test connection
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://postgres:raj28%402006@db.xpobnymsawftumriwvrs.supabase.co:5432/postgres"
    },
  },
})

async function main() {
  try {
    console.log('Attempting to connect via Direct URL (Port 5432)...')
    await prisma.$connect()
    console.log('Successfully connected to the database!')
    const userCount = await prisma.user.count()
    console.log(`Found ${userCount} users.`)
  } catch (e) {
    console.error('Connection failed:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
