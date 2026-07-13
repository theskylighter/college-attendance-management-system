const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@college.edu'
  
  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (existingAdmin) {
    console.log('Admin user already exists!')
    return
  }

  // Create the admin user
  const passwordHash = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN'
    }
  })

  console.log('Default admin seeded successfully!')
  console.log(`Email: ${adminEmail}`)
  console.log('Password: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
