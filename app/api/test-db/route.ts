import { NextResponse } from "next/server"
import { sql, initializeDatabase } from "@/lib/db"

export async function GET() {
  try {
    // Test database connection
    await initializeDatabase()

    // Simple query to test connection
    const result = await sql`SELECT 1 as test`

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      result: result[0],
    })
  } catch (error: unknown) {
    console.error("Database test failed:", error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
