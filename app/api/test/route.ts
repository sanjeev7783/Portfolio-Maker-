import { NextResponse } from "next/server"
import { testDatabaseConnection } from "@/lib/storage"

export async function GET() {
  try {
    const dbTest = await testDatabaseConnection()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      database: dbTest.success ? "connected" : "not available",
      databaseError: dbTest.error || null,
      environment: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
