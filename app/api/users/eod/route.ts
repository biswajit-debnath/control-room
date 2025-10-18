// API Route to fetch EOD users
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const eodUsers = await prisma.user.findMany({
      where: {
        role: "EOD",
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(eodUsers)
  } catch (error) {
    console.error("Error fetching EOD users:", error)
    return NextResponse.json(
      { error: "Failed to fetch EOD users" },
      { status: 500 }
    )
  }
}
