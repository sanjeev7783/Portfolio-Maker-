export interface User {
  id: string
  email: string
  name: string
  title: string
  bio: string
  phone?: string
  location?: string
  website?: string
  github?: string
  linkedin?: string
  instagram?: string
  created_at: Date
  updated_at: Date
}

export interface Project {
  id: string
  user_id: string
  title: string
  company: string
  duration: string
  description: string
  technologies: string[]
  achievements: string[]
  order_index: number
}

export interface Experience {
  id: string
  user_id: string
  title: string
  company: string
  location: string
  duration: string
  responsibilities: string[]
  order_index: number
}

export interface Education {
  id: string
  user_id: string
  degree: string
  institution: string
  duration: string
  grade?: string
  order_index: number
}

export interface Skill {
  id: string
  user_id: string
  category: "languages" | "technologies" | "styling"
  name: string
  order_index: number
}

export interface Certification {
  id: string
  user_id: string
  title: string
  issuer: string
  date: string
  credential_url?: string
  order_index: number
}

export interface PortfolioFormData {
  // Personal Info
  name: string
  title: string
  bio: string
  email: string
  phone: string
  location: string
  website: string
  github: string
  linkedin: string
  instagram: string

  // Projects
  projects: {
    title: string
    company: string
    duration: string
    description: string
    technologies: string
    achievements: string
  }[]

  // Experience
  experience: {
    title: string
    company: string
    location: string
    duration: string
    responsibilities: string
  }[]

  // Education
  education: {
    degree: string
    institution: string
    duration: string
    grade: string
  }[]

  // Skills
  languages: string
  technologies: string
  styling: string

  // Certifications
  certifications: {
    title: string
    issuer: string
    date: string
    credential_url: string
  }[]
}
