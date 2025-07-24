interface StorageData {
  users: Map<string, unknown>
  projects: Map<string, unknown[]>
  experience: Map<string, unknown[]>
  education: Map<string, unknown[]>
  skills: Map<string, unknown[]>
  certifications: Map<string, unknown[]>
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: errorMessage };
  }
}

export async function getDbConnection() {
  if (!isDatabaseAvailable()) {
    throw new Error("Database not available")
  }
  const { neon } = await import("@neondatabase/serverless")
  return neon(process.env.DATABASE_URL!)
}
