// Update EOD/AE Signature API Route
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req)
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Check if user has permission to update signature (EOD or AE only)
    if (user.role !== "EOD" && user.role !== "AE") {
      return NextResponse.json(
        { error: "Only EOD and AE can update signatures" },
        { status: 403 }
      )
    }
    
    const { id } = await params
    
    // Find the operation
    const operation = await prisma.dGOperation.findUnique({
      where: { id },
    })
    
    if (!operation) {
      return NextResponse.json(
        { error: "Operation not found" },
        { status: 404 }
      )
    }
    
    // Check if already signed
    if (operation.digitalSignatureEodAe) {
      return NextResponse.json(
        { error: "This entry is already signed" },
        { status: 400 }
      )
    }
    
    // Update signature
    const updatedOperation = await prisma.dGOperation.update({
      where: { id },
      data: {
        digitalSignatureEodAe: user.name,
        signedBy: user.id,
        signedAt: new Date(),
      },
    })
    
    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: "UPDATE_SIGNATURE",
        module: "DG_OPERATIONS",
        details: `Signed entry #${operation.id}`,
      },
    })
    
    return NextResponse.json({ success: true, data: updatedOperation })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Failed to update signature" },
      { status: 500 }
    )
  }
}
