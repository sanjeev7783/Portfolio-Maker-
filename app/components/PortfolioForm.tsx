"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Plus, Minus, Loader2 } from "lucide-react"
import type { PortfolioFormData } from "@/lib/types"
import { useRouter } from "next/navigation"

export default function PortfolioForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<PortfolioFormData>({
    name: "",
    title: "",
    bio: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    github: "",
    linkedin: "",
    instagram: "",
    projects: [{ title: "", company: "", duration: "", description: "", technologies: "", achievements: "" }],
    experience: [{ title: "", company: "", location: "", duration: "", responsibilities: "" }],
    education: [{ degree: "", institution: "", duration: "", grade: "" }],
    languages: "",
    technologies: "",
    styling: "",
    certifications: [{ title: "", issuer: "", date: "", credential_url: "" }],
    resume: null,
  })

  const addArrayItem = (
    field: keyof Pick<PortfolioFormData, "projects" | "experience" | "education" | "certifications">,
  ) => {
    const newItem =
      field === "projects"
        ? { title: "", company: "", duration: "", description: "", technologies: "", achievements: "" }
        : field === "experience"
          ? { title: "", company: "", location: "", duration: "", responsibilities: "" }
          : field === "education"
            ? { degree: "", institution: "", duration: "", grade: "" }
            : { title: "", issuer: "", date: "", credential_url: "" }

    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], newItem],
    }))
  }

  const removeArrayItem = (
    field: keyof Pick<PortfolioFormData, "projects" | "experience" | "education" | "certifications">,
    index: number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

  const updateArrayItem = (
    field: keyof Pick<PortfolioFormData, "projects" | "experience" | "education" | "certifications">,
    index: number,
    key: string,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert("Please enter your full name")
      return false
    }
    if (!formData.title.trim()) {
      alert("Please enter your professional title")
      return false
    }
    if (!formData.bio.trim()) {
      alert("Please enter your bio")
      return false
    }
    if (!formData.email.trim()) {
      alert("Please enter your email")
      return false
    }
    if (!formData.languages.trim()) {
      alert("Please enter at least one programming language")
      return false
    }
    if (!formData.technologies.trim()) {
      alert("Please enter at least one technology")
      return false
    }
    if (!formData.resume) {
      alert("Please upload your resume (PDF format only)")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      console.log("Form: Starting submission")

      // Convert resume to base64 if present
      let resumeBase64 = null
      if (formData.resume && formData.resume instanceof File) {
        // Check file size (limit to 5MB)
        if (formData.resume.size > 5 * 1024 * 1024) {
          alert('Resume file is too large. Please use a file smaller than 5MB.')
          return
        }
        
        resumeBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsDataURL(formData.resume as File)
        })
      }

      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({...formData, resume: resumeBase64}),
      })

      console.log("Form: Response status:", response.status)
      console.log("Form: Response ok:", response.ok)

      // Get response text first
      const responseText = await response.text()
      console.log("Form: Response text:", responseText.substring(0, 200))

      if (!response.ok) {
        // Try to parse as JSON, fallback to text
        let errorMessage = "Unknown error occurred"
        try {
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = responseText.includes("error") ? "Server error occurred" : responseText
        }

        alert(`Error creating portfolio: ${errorMessage}`)
        return
      }

      // Parse successful response
      let result
      try {
        result = JSON.parse(responseText)
      } catch (jsonError) {
        console.error("Form: JSON Parse Error:", jsonError)
        alert("Error: Invalid response from server")
        return
      }

      if (result.success) {
        console.log("Form: Success, redirecting to:", result.portfolioUrl)

        // Show success message with storage info
        const storageInfo =
          result.storage === "memory" ? " (Note: Using temporary storage - data will be lost on refresh)" : ""

        alert(`Portfolio created successfully!${storageInfo}`)
        router.push(result.portfolioUrl)
      } else {
        alert("Error creating portfolio: " + (result.error || "Unknown error"))
      }
    } catch (error: unknown) {
      console.error("Form: Network Error:", error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Network error: ${errorMessage}. Please check your connection and try again.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Create Your Portfolio</h1>
        <p className="text-lg text-gray-600">Fill out the form below to generate your professional portfolio</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="mb-2 block">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="title" className="mb-2 block">Professional Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Software Engineer"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="mb-2 block">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="mb-2 block">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="location" className="mb-2 block">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., New York, NY"
                />
              </div>
              <div>
                <Label htmlFor="website" className="mb-2 block">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div>
                <Label htmlFor="github" className="mb-2 block">GitHub</Label>
                <Input
                  id="github"
                  value={formData.github}
                  onChange={(e) => setFormData((prev) => ({ ...prev, github: e.target.value }))}
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <Label htmlFor="linkedin" className="mb-2 block">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => setFormData((prev) => ({ ...prev, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="resume" className="mb-2 block">Upload Resume (PDF only) *</Label>
              <Input
                id="resume"
                type="file"
                accept=".pdf"
                required
                onChange={(e) => setFormData((prev) => ({ ...prev, resume: e.target.files?.[0] || null }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="bio" className="mb-2 block">Bio *</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Write a brief description about yourself and your expertise..."
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Projects</CardTitle>
            <Button type="button" onClick={() => addArrayItem("projects")} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.projects.map((project, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Project {index + 1}</h4>
                  {formData.projects.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem("projects", index)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Project Title *</Label>
                    <Input
                      value={project.title}
                      onChange={(e) => updateArrayItem("projects", index, "title", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Company/Organization *</Label>
                    <Input
                      value={project.company}
                      onChange={(e) => updateArrayItem("projects", index, "company", e.target.value)}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-2 block">Duration *</Label>
                    <Input
                      value={project.duration}
                      onChange={(e) => updateArrayItem("projects", index, "duration", e.target.value)}
                      placeholder="e.g., Mar 2023 - Present"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-2 block">Description *</Label>
                    <Textarea
                      value={project.description}
                      onChange={(e) => updateArrayItem("projects", index, "description", e.target.value)}
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Technologies (comma-separated) *</Label>
                    <Input
                      value={project.technologies}
                      onChange={(e) => updateArrayItem("projects", index, "technologies", e.target.value)}
                      placeholder="React, Node.js, MongoDB"
                      required
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Key Achievements (one per line)</Label>
                    <Textarea
                      value={project.achievements}
                      onChange={(e) => updateArrayItem("projects", index, "achievements", e.target.value)}
                      rows={3}
                      placeholder="• Increased performance by 50%&#10;• Reduced load time by 2 seconds"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Experience */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Work Experience</CardTitle>
            <Button type="button" onClick={() => addArrayItem("experience")} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Experience
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.experience.map((exp, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Experience {index + 1}</h4>
                  {formData.experience.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem("experience", index)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Job Title *</Label>
                    <Input
                      value={exp.title}
                      onChange={(e) => updateArrayItem("experience", index, "title", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Company *</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) => updateArrayItem("experience", index, "company", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Location *</Label>
                    <Input
                      value={exp.location}
                      onChange={(e) => updateArrayItem("experience", index, "location", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Duration *</Label>
                    <Input
                      value={exp.duration}
                      onChange={(e) => updateArrayItem("experience", index, "duration", e.target.value)}
                      placeholder="e.g., Oct 2022 - Present"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-2 block">Key Responsibilities (one per line) *</Label>
                    <Textarea
                      value={exp.responsibilities}
                      onChange={(e) => updateArrayItem("experience", index, "responsibilities", e.target.value)}
                      rows={4}
                      placeholder="• Developed web applications using React&#10;• Collaborated with cross-functional teams"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Education</CardTitle>
            <Button type="button" onClick={() => addArrayItem("education")} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Education
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.education.map((edu, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Education {index + 1}</h4>
                  {formData.education.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem("education", index)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Degree *</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => updateArrayItem("education", index, "degree", e.target.value)}
                      placeholder="e.g., B.Tech in Computer Science"
                      required
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Institution *</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) => updateArrayItem("education", index, "institution", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Duration *</Label>
                    <Input
                      value={edu.duration}
                      onChange={(e) => updateArrayItem("education", index, "duration", e.target.value)}
                      placeholder="e.g., Aug 2018 - Aug 2022"
                      required
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Grade/CGPA</Label>
                    <Input
                      value={edu.grade}
                      onChange={(e) => updateArrayItem("education", index, "grade", e.target.value)}
                      placeholder="e.g., 8.5 CGPA"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="languages" className="mb-2 block">Programming Languages (comma-separated) *</Label>
              <Input
                id="languages"
                value={formData.languages}
                onChange={(e) => setFormData((prev) => ({ ...prev, languages: e.target.value }))}
                placeholder="JavaScript, TypeScript, Python, Java"
                required
              />
            </div>
            <div>
              <Label htmlFor="technologies" className="mb-2 block">Technologies & Tools (comma-separated) *</Label>
              <Input
                id="technologies"
                value={formData.technologies}
                onChange={(e) => setFormData((prev) => ({ ...prev, technologies: e.target.value }))}
                placeholder="React.js, Node.js, MongoDB, AWS"
                required
              />
            </div>
            <div>
              <Label htmlFor="styling" className="mb-2 block">Styling & Design (comma-separated)</Label>
              <Input
                id="styling"
                value={formData.styling}
                onChange={(e) => setFormData((prev) => ({ ...prev, styling: e.target.value }))}
                placeholder="CSS, Tailwind CSS, Bootstrap, Figma"
              />
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Certifications</CardTitle>
            <Button type="button" onClick={() => addArrayItem("certifications")} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Certification
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.certifications.map((cert, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Certification {index + 1}</h4>
                  {formData.certifications.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem("certifications", index)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Certification Title *</Label>
                    <Input
                      value={cert.title}
                      onChange={(e) => updateArrayItem("certifications", index, "title", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Issuing Organization *</Label>
                    <Input
                      value={cert.issuer}
                      onChange={(e) => updateArrayItem("certifications", index, "issuer", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Date Issued *</Label>
                    <Input
                      value={cert.date}
                      onChange={(e) => updateArrayItem("certifications", index, "date", e.target.value)}
                      placeholder="e.g., Dec 2023"
                      required
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Credential URL</Label>
                    <Input
                      value={cert.credential_url}
                      onChange={(e) => updateArrayItem("certifications", index, "credential_url", e.target.value)}
                      placeholder="https://credential-url.com"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button type="submit" size="lg" disabled={loading} className="w-full md:w-auto">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Portfolio...
              </>
            ) : (
              "Create Portfolio"
            )}
          </Button>
        </div>
      </form>
    </div>
    </div>
  )
}
