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
      phoneNumber: "8471925921",
      password: "password123",
      name: "Kaustabh Das",
      role: "TA",
    },
    {
      phoneNumber: "7001367546",
      password: "password123",
      name: "Prasanjit Dev",
      role: "EA",
    },
    {
      phoneNumber: "8473936628",
      password: "password123",
      name: "Apurba Krishna Burhagohain",
      role: "SEA",
    },
    {
      phoneNumber: "6005430197",
      password: "password123",
      name: "Arun Kumar",
      role: "AE",
    },
    {
      phoneNumber: "7002625012",
      password: "password123",
      name: "Nikhil Sharma",
      role: "TA",
    },
  ]

  for (const userData of users) {
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber: userData.phoneNumber },
    })

    const hashedPassword = await bcrypt.hash(userData.password, 10)

    if (!existingUser) {
      await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
        } as any,
      })
      console.log(`✅ Created user: ${userData.name} (${userData.phoneNumber})`)
    } else {
      await prisma.user.update({
        where: { phoneNumber: userData.phoneNumber },
        data: {
          name: userData.name,
          role: userData.role,
          password: hashedPassword,
          phoneVerified: true,
        } as any,
      })
      console.log(`🔄 Updated user: ${userData.name} (${userData.phoneNumber})`)
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
