interface StorageData {
  users: Map<string, any>
  projects: Map<string, any[]>
  experience: Map<string, any[]>
  education: Map<string, any[]>
  skills: Map<string, any[]>
  certifications: Map<string, any[]>
}

const memoryStorage: StorageData = {
  users: new Map(),
  projects: new Map(),
  experience: new Map(),
  education: new Map(),
  skills: new Map(),
  certifications: new Map(),
}

export { memoryStorage }

// Check if database is available
export function isDatabaseAvailable(): boolean {
  return !!process.env.DATABASE_URL
}

export async function testDatabaseConnection() {
  if (!isDatabaseAvailable()) {
    return { success: false, error: "DATABASE_URL not configured" }
  }

  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL!);
    await sql`SELECT 1 as test`;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getDbConnection() {
  if (!isDatabaseAvailable()) {
    throw new Error("Database not available")
  }
  const { neon } = await import("@neondatabase/serverless")
  return neon(process.env.DATABASE_URL!)
}
