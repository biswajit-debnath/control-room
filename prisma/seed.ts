// Seed Script - Create Initial Users
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting seed...")

  // Create test users
  /* Roles:
    AE - Admin Executive
    EOD - End of Day Staff
    TA - Technical Assistant
  */
  const users = [
    {
      phoneNumber: "9999999999",
      password: "password123",
      name: "Kaustabh Das",
      role: "AE",
    },
    {
      phoneNumber: "8888888888",
      password: "password123",
      name: "EOD Staff",
      role: "EOD",
    },
    {
      phoneNumber: "7777777777",
      password: "password123",
      name: "Gurjyot Sandhu",
      role: "TA",
    },
    {
      phoneNumber: "1234567890",
      password: "password123",
      name: "Biswajit Debnath",
      role: "EOD",
    },
  ]

  for (const userData of users) {
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber: userData.phoneNumber },
    })

    if (!existingUser) {
      userData["password"] = await bcrypt.hash(userData["password"], 10)
      await prisma.user.create({
        data: userData as any,
      })
      console.log(`✅ Created user: ${userData.name} (${userData.phoneNumber})`)
    } else {
      console.log(`⏭️  User already exists: ${userData.name}`)
    }
  }

  console.log("✨ Seed completed!")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
