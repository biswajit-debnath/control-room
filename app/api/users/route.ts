// Users API Route - Fetch all users
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

// Helper function to get current user from session
async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session")?.value
  
  if (!sessionToken) {
    return null
  }
  
  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: { user: true },
  })
  
  if (!session || session.expiresAt < new Date()) {
    return null
  }
  
  return session.user
}

// GET - Fetch all users
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    // Optional: Check if user is authenticated (uncomment if you want to restrict access)
    // if (!user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }
    
    // Fetch all users (excluding password field for security)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        phoneNumber: true,
        phoneVerified: true,
        role: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        // Explicitly exclude password
        password: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    // Log activity if user is logged in
    if (user) {
      await prisma.activity.create({
        data: {
          userId: user.id,
          action: "VIEW",
          module: "USERS",
          details: `Viewed ${users.length} users`,
        },
      })
    }
    
    return NextResponse.json({ 
      success: true,
      data: users,
      count: users.length 
    })
  } catch (error) {
    console.error("Users API Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}
