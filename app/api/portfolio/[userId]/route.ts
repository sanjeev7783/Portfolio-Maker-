import { type NextRequest, NextResponse } from "next/server"
import { memoryStorage, isDatabaseAvailable } from "@/lib/storage"

async function getFromDatabase(userId: string) {
  try {
    const { sql } = await import("@/lib/db")

    const users = await sql`SELECT * FROM users WHERE id = ${userId}::uuid`
    if (users.length === 0) {
      return null
    }

    const projects = await sql`SELECT * FROM projects WHERE user_id = ${userId}::uuid ORDER BY order_index`
    const experience = await sql`SELECT * FROM experience WHERE user_id = ${userId}::uuid ORDER BY order_index`
    const education = await sql`SELECT * FROM education WHERE user_id = ${userId}::uuid ORDER BY order_index`
    const skills = await sql`SELECT * FROM skills WHERE user_id = ${userId}::uuid ORDER BY order_index`
    const certifications = await sql`SELECT * FROM certifications WHERE user_id = ${userId}::uuid ORDER BY order_index`

    const groupedSkills = skills.reduce(
      (acc: any, skill: any) => {
        if (!acc[skill.category]) {
          acc[skill.category] = []
        }
        acc[skill.category].push(skill.name)
        return acc
      },
      { languages: [], technologies: [], styling: [] },
    )

    return {
      user: users[0],
      projects,
      experience,
      education,
      skills: groupedSkills,
      certifications,
    }
  } catch (error: any) {
    console.error("Database fetch error:", error)
    throw new Error(`Database error: ${error.message}`)
  }
}

function getFromMemory(userId: string) {
  const user = memoryStorage.users.get(userId)
  if (!user) {
    return null
  }

  const skills = memoryStorage.skills.get(userId) || []
  const groupedSkills = skills.reduce(
    (acc: any, skill: any) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      acc[skill.category].push(skill.name)
      return acc
    },
    { languages: [], technologies: [], styling: [] },
  )

  return {
    user,
    projects: memoryStorage.projects.get(userId) || [],
    experience: memoryStorage.experience.get(userId) || [],
    education: memoryStorage.education.get(userId) || [],
    skills: groupedSkills,
    certifications: memoryStorage.certifications.get(userId) || [],
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    console.log("API: Fetching portfolio for user:", userId)

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    let portfolioData
    if (isDatabaseAvailable()) {
      console.log("API: Attempting database fetch")
      try {
        portfolioData = await getFromDatabase(userId)
      } catch (dbError: any) {
        console.error("API: Database fetch failed, trying memory:", dbError.message)
        portfolioData = getFromMemory(userId)
      }
    } else {
      console.log("API: Using memory storage")
      portfolioData = getFromMemory(userId)
    }

    if (!portfolioData) {
      console.log("API: Portfolio not found")
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 })
    }

    console.log("API: Portfolio fetched successfully")
    return NextResponse.json(portfolioData)
  } catch (error: any) {
    console.error("API: Fetch error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch portfolio",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
