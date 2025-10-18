// instrumentation.ts - Runs once when Next.js server starts
export async function register() {
  // Only run in Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Dynamic import to avoid Prisma loading during build
    const { initializeAutoGeneration } = await import('./lib/auto-generate')
    await initializeAutoGeneration()
  }
}
