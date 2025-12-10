// Script to update shift values from lowercase to uppercase
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔄 Starting shift value migration...")

  try {
    // Update M/s to M/S
    const updatedMS = await prisma.dGOperation.updateMany({
      where: {
        shift: "M/s",
      },
      data: {
        shift: "M/S",
      },
    })
    console.log(`✅ Updated ${updatedMS.count} records from M/s to M/S`)

    // Update G/s to G/S
    const updatedGS = await prisma.dGOperation.updateMany({
      where: {
        shift: "G/s",
      },
      data: {
        shift: "G/S",
      },
    })
    console.log(`✅ Updated ${updatedGS.count} records from G/s to G/S`)

    // Update E/s to E/S
    const updatedES = await prisma.dGOperation.updateMany({
      where: {
        shift: "E/s",
      },
      data: {
        shift: "E/S",
      },
    })
    console.log(`✅ Updated ${updatedES.count} records from E/s to E/S`)

    const totalUpdated = updatedMS.count + updatedGS.count + updatedES.count
    console.log(`\n✨ Migration completed! Total records updated: ${totalUpdated}`)
  } catch (error) {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error("❌ Script failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
