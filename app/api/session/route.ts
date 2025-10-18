// Get Current User Session API
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value
    
    if (!sessionToken) {
      return NextResponse.json({ user: null }, { status: 200 })
    }
    
    // Find session and validate
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    })
    
    if (!session || session.expiresAt < new Date()) {
      // Session expired or not found
      if (session) {
        await prisma.session.delete({ where: { id: session.id } })
      }
      return NextResponse.json({ user: null }, { status: 200 })
    }
    
    // Return user data
    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        phoneNumber: session.user.phoneNumber,
        role: session.user.role,
      },
    })
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
