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
  } catch (error: any) {
    console.error("Database test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
