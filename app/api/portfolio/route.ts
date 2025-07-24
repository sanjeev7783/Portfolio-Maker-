import { type NextRequest, NextResponse } from "next/server"
import type { PortfolioFormData } from "@/lib/types"
import { memoryStorage, isDatabaseAvailable } from "@/lib/storage"

// Database functions (only used if database is available)
async function saveToDatabase(data: PortfolioFormData, userId: string) {
  try {
    const { sql } = await import("@/lib/db")

    // Resume handled in memory storage

    // Insert user (resume stored in memory for now) - handle duplicate emails
    await sql`
      INSERT INTO users (id, email, name, title, bio, phone, location, website, github, linkedin, instagram)
      VALUES (${userId}::uuid, ${data.email || `${userId}@temp.com`}, ${data.name}, ${data.title}, ${data.bio},
              ${data.phone || null}, ${data.location || null}, ${data.website || null},
              ${data.github || null}, ${data.linkedin || null}, ${data.instagram || null})
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        bio = EXCLUDED.bio
    `

    // Insert projects
    for (let i = 0; i < data.projects.length; i++) {
      const project = data.projects[i]
      await sql`
        INSERT INTO projects (user_id, title, company, duration, description, technologies, achievements, order_index)
        VALUES (${userId}::uuid, ${project.title}, ${project.company}, ${project.duration}, 
                ${project.description}, ${project.technologies.split(',').map(t => t.trim())}, 
                ${project.achievements.split('\n').filter(a => a.trim())}, ${i})
      `
    }

    // Insert experience
    for (let i = 0; i < data.experience.length; i++) {
      const exp = data.experience[i]
      await sql`
        INSERT INTO experience (user_id, title, company, location, duration, responsibilities, order_index)
        VALUES (${userId}::uuid, ${exp.title}, ${exp.company}, ${exp.location}, 
                ${exp.duration}, ${exp.responsibilities.split('\n').filter(r => r.trim())}, ${i})
      `
    }

    // Insert education
    for (let i = 0; i < data.education.length; i++) {
      const edu = data.education[i]
      await sql`
        INSERT INTO education (user_id, degree, institution, duration, grade, order_index)
        VALUES (${userId}::uuid, ${edu.degree}, ${edu.institution}, ${edu.duration}, ${edu.grade || null}, ${i})
      `
    }

    // Insert skills
    let skillIndex = 0
    if (data.languages) {
      for (const skill of data.languages.split(',').map(s => s.trim()).filter(s => s)) {
        await sql`
          INSERT INTO skills (user_id, category, name, order_index)
          VALUES (${userId}::uuid, 'languages', ${skill}, ${skillIndex++})
        `
      }
    }
    if (data.technologies) {
      for (const skill of data.technologies.split(',').map(s => s.trim()).filter(s => s)) {
        await sql`
          INSERT INTO skills (user_id, category, name, order_index)
          VALUES (${userId}::uuid, 'technologies', ${skill}, ${skillIndex++})
        `
      }
    }
    if (data.styling) {
      for (const skill of data.styling.split(',').map(s => s.trim()).filter(s => s)) {
        await sql`
          INSERT INTO skills (user_id, category, name, order_index)
          VALUES (${userId}::uuid, 'styling', ${skill}, ${skillIndex++})
        `
      }
    }

    // Insert certifications
    for (let i = 0; i < data.certifications.length; i++) {
      const cert = data.certifications[i]
      await sql`
        INSERT INTO certifications (user_id, title, issuer, date, credential_url, order_index)
        VALUES (${userId}::uuid, ${cert.title}, ${cert.issuer}, ${cert.date}, ${cert.credential_url || null}, ${i})
      `
    }

    return { success: true }
  } catch (error: unknown) {
    console.error("Database save error:", error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Database error: ${errorMessage}`)
  }
}

// Memory storage functions
function saveToMemory(data: PortfolioFormData, userId: string) {
  try {
    // Save user data
    memoryStorage.users.set(userId, {
      id: userId,
      email: data.email,
      name: data.name,
      title: data.title,
      bio: data.bio,
      phone: data.phone,
      location: data.location,
      website: data.website,
      github: data.github,
      linkedin: data.linkedin,
      instagram: data.instagram,
      resume_url: data.resume || null,
      created_at: new Date(),
    })

    // Save related data - fix projects processing
    const processedProjects = data.projects.map((project, index) => ({
      ...project,
      id: crypto.randomUUID(),
      user_id: userId,
      order_index: index,
      technologies: project.technologies
        ? project.technologies
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t)
        : [],
      achievements: project.achievements
        ? project.achievements
            .split("\n")
            .map((a) => a.trim())
            .filter((a) => a)
        : [],
    }))

    const processedExperience = data.experience.map((exp, index) => ({
      ...exp,
      id: crypto.randomUUID(),
      user_id: userId,
      order_index: index,
      responsibilities: exp.responsibilities
        ? exp.responsibilities
            .split("\n")
            .map((r) => r.trim())
            .filter((r) => r)
        : [],
    }))

    memoryStorage.projects.set(userId, processedProjects)
    memoryStorage.experience.set(userId, processedExperience)
    memoryStorage.education.set(userId, data.education || [])
    memoryStorage.certifications.set(userId, data.certifications || [])

    // Process skills
    const skills = []
    if (data.languages) {
      data.languages.split(",").forEach((skill, index) => {
        const trimmed = skill.trim()
        if (trimmed) {
          skills.push({ category: "languages", name: trimmed, order_index: index })
        }
      })
    }
    if (data.technologies) {
      data.technologies.split(",").forEach((skill, index) => {
        const trimmed = skill.trim()
        if (trimmed) {
          skills.push({ category: "technologies", name: trimmed, order_index: index })
        }
      })
    }
    if (data.styling) {
      data.styling.split(",").forEach((skill, index) => {
        const trimmed = skill.trim()
        if (trimmed) {
          skills.push({ category: "styling", name: trimmed, order_index: index })
        }
      })
    }
    memoryStorage.skills.set(userId, skills)

    return { success: true }
  } catch (error: unknown) {
    console.error("Memory save error:", error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Memory storage error: ${errorMessage}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("API: Starting portfolio creation")

    // Parse request body
    let data: PortfolioFormData
    try {
      const body = await request.text()
      console.log("API: Request body length:", body.length)
      data = JSON.parse(body)
      console.log("API: Parsed data successfully")
    } catch (parseError: unknown) {
      console.error("API: JSON parse error:", parseError)
      return NextResponse.json({ success: false, error: "Invalid JSON in request body" }, { status: 400 })
    }

    // Validate required fields
    const requiredFields = ["name", "title", "bio", "email"]
    const missingFields = requiredFields.filter((field) => !data[field as keyof PortfolioFormData]?.toString().trim())

    if (missingFields.length > 0) {
      console.log("API: Missing required fields:", missingFields)
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 },
      )
    }

    // Generate user ID
    const userId = crypto.randomUUID()
    console.log("API: Generated user ID:", userId)

    // Try to save to database first, fallback to memory
    let saveResult
    if (isDatabaseAvailable()) {
      console.log("API: Attempting database save")
      try {
        saveResult = await saveToDatabase(data, userId)
        console.log("API: Database save successful")
      } catch (dbError: unknown) {
        const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown error'
        console.error("API: Database save failed, falling back to memory:", errorMessage)
        saveResult = saveToMemory(data, userId)
        console.log("API: Memory save successful")
      }
    } else {
      console.log("API: No database available, using memory storage")
      saveResult = saveToMemory(data, userId)
      console.log("API: Memory save successful")
    }

    if (saveResult.success) {
      console.log("API: Portfolio created successfully")
      return NextResponse.json({
        success: true,
        userId,
        portfolioUrl: `/portfolio/${userId}`,
        storage: isDatabaseAvailable() ? "database" : "memory",
      })
    } else {
      throw new Error("Save operation failed")
    }
  } catch (error: unknown) {
    console.error("API: Unexpected error:", error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
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
