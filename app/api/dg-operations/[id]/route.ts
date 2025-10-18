// Get single DG Operation by ID
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

// Helper function to get current user from session
async function getCurrentUser(req: NextRequest) {
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req)
    
    const { id } = await params
    
    const operation = await prisma.dGOperation.findUnique({
      where: { id },
    })
    
    if (!operation) {
      return NextResponse.json(
        { error: "Operation not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ data: operation })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch record" },
      { status: 500 }
    )
  }
}
