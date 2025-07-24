"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Github, Linkedin, Instagram, Globe, Phone, Mail, Download, ExternalLink } from "lucide-react"

interface PortfolioData {
  user: {
    name: string
    title: string
    bio: string
    resume_url?: string
  }
  projects: unknown[]
  experience: unknown[]
  education: unknown[]
  skills: {
    languages: string[]
    technologies: string[]
    styling: string[]
  }
  certifications: unknown[]
}

interface PortfolioProps {
  userId: string
}

// Helper function to safely convert string or array to array
const toArray = (value: string | string[] | undefined): string[] => {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item)
  }
  return []
}

// Helper function to safely convert comma-separated string or array to array
const toCommaSeparatedArray = (value: string | string[] | undefined): string[] => {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item)
  }
  return []
}

export default function Portfolio({ userId }: PortfolioProps) {
  const [data, setData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showName, setShowName] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowName((prev) => !prev);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        console.log("Fetching portfolio for user:", userId)
        const response = await fetch(`/api/portfolio/${userId}`)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const portfolioData = await response.json()
        console.log("Portfolio data received:", portfolioData)
        setData(portfolioData)
      } catch (error: unknown) {
        console.error("Error fetching portfolio:", error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchPortfolio()
    }
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Portfolio Not Found</h1>
          <p className="text-gray-600">{error || "The requested portfolio could not be found."}</p>
          <Button className="mt-4" onClick={() => (window.location.href = "/")}>
            Create New Portfolio
          </Button>
        </div>
      </div>
    )
  }

  const { user, projects, experience, education, skills, certifications } = data

  const handleResumeDownload = () => {
    if (user.resume_url && user.resume_url.startsWith('data:')) {
      try {
        const link = document.createElement('a')
        link.href = user.resume_url
        link.download = `${user.name.replace(/\s+/g, '_')}_Resume.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error: unknown) {
        console.error('Download error:', error)
        alert('Error downloading resume. Please try again.')
      }
    } else {
      alert('Resume not available for download')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">{user.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</div>
            <div className="hidden md:flex space-x-8">
              <a href="#about" className="text-gray-700 hover:text-gray-900">
                About
              </a>
              <a href="#skills" className="text-gray-700 hover:text-gray-900">
                Skills
              </a>
              <a href="#projects" className="text-gray-700 hover:text-gray-900">
                Projects
              </a>
              <a href="#experience" className="text-gray-700 hover:text-gray-900">
                Experience
              </a>
              <a href="#education" className="text-gray-700 hover:text-gray-900">
                Education
              </a>
              <a href="#certifications" className="text-gray-700 hover:text-gray-900">
                Certifications
              </a>
              <a href="#contact" className="text-gray-700 hover:text-gray-900">
                Contact
              </a>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        id="about"
        className="relative text-white overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)` }}
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                Hey folks, I&apos;m{" "}
                <span className="text-2xl md:text-3xl font-semibold text-cyan-100">
                  {showName ? ` ${user.name.split(" ")[0].charAt(0).toUpperCase() + user.name.split(" ")[0].slice(1).toLowerCase()}` : `${user.title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}`}
                </span>
              </h1>
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-lg md:text-xl leading-relaxed text-white font-medium">{user.bio}</p>
              </div>
              <Button 
                className="bg-white text-cyan-600 hover:bg-gray-100 cursor-pointer"
                onClick={handleResumeDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Resume
              </Button>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Image
                    src="/person-with-laptop.svg?height=300&width=300"
                    alt="Developer illustration"
                    width={300}
                    height={300}
                    className="rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      {projects && projects.length > 0 && (
        <section id="projects" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Project Work</h2>
            <div className="space-y-12">
              {projects.map((project, index) => (
                <Card key={project.id || index} className="p-6">
                  <CardContent className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <h3 className="text-xl font-bold text-blue-600">{project.title}</h3>
                      <span className="text-sm text-gray-600">{project.duration}</span>
                    </div>
                    <p className="text-gray-700">{project.description}</p>

                    {/* Achievements */}
                    <div className="space-y-2">
                      {toArray(project.achievements).map((achievement, idx) => (
                        <div key={idx} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span className="text-gray-700">{achievement}</span>
                        </div>
                      ))}
                    </div>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {toCommaSeparatedArray(project.technologies).map((tech, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Experience Section */}
      {experience && experience.length > 0 && (
        <section id="experience" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Experience</h2>
            <div className="space-y-8">
              {experience.map((exp, index) => (
                <Card key={exp.id || index} className="p-6 bg-gray-50">
                  <CardContent className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <h3 className="text-xl font-bold">{exp.title}</h3>
                      <span className="text-sm text-gray-600">{exp.duration}</span>
                    </div>
                    <p className="text-blue-600 font-medium">
                      {exp.company} — {exp.location}
                    </p>

                    {/* Responsibilities */}
                    <div className="space-y-2">
                      {toArray(exp.responsibilities).map((responsibility, idx) => (
                        <div key={idx} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span className="text-gray-700">{responsibility}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Education Section */}
      {education && education.length > 0 && (
        <section id="education" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Education</h2>
            <div className="space-y-8">
              {education.map((edu, index) => (
                <Card key={edu.id || index} className="p-6">
                  <CardContent className="space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <h3 className="text-xl font-bold text-green-600">{edu.degree}</h3>
                      <span className="text-sm text-gray-600">{edu.duration}</span>
                    </div>
                    <p className="text-gray-700">{edu.institution}</p>
                    {edu.grade && <p className="text-gray-600">{edu.grade}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Skills Section */}
      {skills && (skills.languages?.length > 0 || skills.technologies?.length > 0 || skills.styling?.length > 0) && (
        <section id="skills" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Skillset</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {skills.languages && skills.languages.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Languages</h3>
                  <ul className="space-y-2">
                    {skills.languages.map((skill, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {skills.technologies && skills.technologies.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Technologies & Tools</h3>
                  <ul className="space-y-2">
                    {skills.technologies.map((skill, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {skills.styling && skills.styling.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Styling</h3>
                  <ul className="space-y-2">
                    {skills.styling.map((skill, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Certifications Section */}
      {certifications && certifications.length > 0 && (
        <section id="certifications" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Certifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {certifications.map((cert, index) => (
                <Card key={cert.id || index} className="p-6 text-center">
                  <CardContent className="space-y-4">
                    <h3 className="text-lg font-bold text-blue-600">{cert.title}</h3>
                    <p className="text-gray-700">{cert.issuer}</p>
                    <p className="text-sm text-gray-600">{cert.date}</p>
                    {cert.credential_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={cert.credential_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Certificate
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Connect with me</h2>
          <div className="flex justify-center space-x-6">
            {user.github && (
              <a href={user.github} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">
                <Github className="w-8 h-8" />
              </a>
            )}
            {user.linkedin && (
              <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">
                <Linkedin className="w-8 h-8" />
              </a>
            )}
            {user.instagram && (
              <a href={user.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">
                <Instagram className="w-8 h-8" />
              </a>
            )}
            {user.website && (
              <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">
                <Globe className="w-8 h-8" />
              </a>
            )}
          </div>
          <div className="text-center mt-8 space-y-2">
            {user.phone && (
              <p className="flex items-center justify-center">
                <Phone className="w-4 h-4 mr-2" />
                {user.phone}
              </p>
            )}
            <p className="flex items-center justify-center">
              <Mail className="w-4 h-4 mr-2" />
              {user.email}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
