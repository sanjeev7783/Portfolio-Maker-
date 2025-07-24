import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const sql = neon(process.env.DATABASE_URL)

export { sql }

export async function initializeDatabase() {
  try {
    // Enable UUID extension
    await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`

    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        bio TEXT NOT NULL,
        phone VARCHAR(50),
        location VARCHAR(255),
        website VARCHAR(255),
        github VARCHAR(255),
        linkedin VARCHAR(255),
        instagram VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Projects table
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        duration VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        technologies TEXT[] NOT NULL,
        achievements TEXT[] NOT NULL,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Experience table
    await sql`
      CREATE TABLE IF NOT EXISTS experience (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        duration VARCHAR(100) NOT NULL,
        responsibilities TEXT[] NOT NULL,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Education table
    await sql`
      CREATE TABLE IF NOT EXISTS education (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        degree VARCHAR(255) NOT NULL,
        institution VARCHAR(255) NOT NULL,
        duration VARCHAR(100) NOT NULL,
        grade VARCHAR(50),
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Skills table
    await sql`
      CREATE TABLE IF NOT EXISTS skills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL CHECK (category IN ('languages', 'technologies', 'styling')),
        name VARCHAR(100) NOT NULL,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Certifications table
    await sql`
      CREATE TABLE IF NOT EXISTS certifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        issuer VARCHAR(255) NOT NULL,
        date VARCHAR(50) NOT NULL,
        credential_url VARCHAR(500),
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_experience_user_id ON experience(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_education_user_id ON education(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_certifications_user_id ON certifications(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`

    console.log("Database initialized successfully")
    return true
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  }
}
