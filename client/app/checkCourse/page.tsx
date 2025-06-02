"use client"

import Nav from "../../components/Nav"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CheckCircle, BookOpen, Search, Target } from "lucide-react"

interface Course {
  code: string
  name: string
  prerequisites: string[]
  category: string
}

export default function EligibleRevampedPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  const [courses, setCourses] = useState<Course[]>([])
  const [completed, setCompleted] = useState<string[]>([])
  const [eligibleCourses, setEligibleCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [searchCompleted, setSearchCompleted] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
    }
  }, [isSignedIn, isLoaded, router])

  useEffect(() => {
    const fetchSavedCourses = async () => {
      const res = await fetch("/api/saved-courses")
      if (!res.ok) {
        console.error("Failed to fetch saved courses")
        return
      }
      const data = await res.json()
      if (Array.isArray(data?.courses)) {
        setCompleted(data.courses)
      }
    }
    if (isSignedIn && isLoaded) {
      fetchSavedCourses()
    }
  }, [isSignedIn, isLoaded])

  useEffect(() => {
    fetch("/api/courses")
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(`Server Error: ${res.status} ${text}`)
        }
        return res.json()
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setCourses(data)
          setCategories(Array.from(new Set(data.map((course) => course.category))))
        } else {
          console.error("API returned invalid data:", data)
          setCourses([])
        }
      })
      .catch((error) => {
        console.error("Error fetching courses:", error)
      })
  }, [])

  const fetchEligibleCourses = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/eligible", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed_courses: completed }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Server Error: ${res.status} ${text}`)
      }

      const data: Course[] = await res.json()
      setEligibleCourses(data)
    } catch (error) {
      console.error("Failed to fetch eligible courses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleCourse = (courseCode: string) => {
    setCompleted((prev) =>
      prev.includes(courseCode) ? prev.filter((code) => code !== courseCode) : [...prev, courseCode],
    )
  }

  const filteredCompletedCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchCompleted.toLowerCase()) ||
      course.code.toLowerCase().includes(searchCompleted.toLowerCase()),
  )

  const filteredEligibleCourses = selectedCategory
    ? eligibleCourses.filter((course) => course.category === selectedCategory)
    : eligibleCourses

  return (
    <div className="min-h-screen bg-gray-50 p-10 pt-15">
      <Nav />

      {/* Header */}
      <div className="mb-8 mt-16">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-8 h-8" />
          <h1 className="text-4xl font-bold">Academic Path Planner</h1>
        </div>
        <p className="text-gray-600 text-lg">Plan your next semester based on completed courses</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Completed Courses Section */}
        <Card className="h-fit">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-semibold">Completed Courses</h2>
            </div>

            <p className="text-gray-600 mb-4">Mark the courses you have completed ({completed.length} selected)</p>

            {/* Search for completed courses */}
            <div className="mb-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchCompleted}
                  onChange={(e) => setSearchCompleted(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {categories.map((category) => {
                const categoryCoursesFiltered = filteredCompletedCourses.filter(
                  (course) => course.category === category,
                )

                if (categoryCoursesFiltered.length === 0) return null

                return (
                  <div key={category} className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="text-lg font-bold mb-3 text-black flex items-center justify-between">
                      {category}
                      <span className="text-sm font-normal text-gray-600">
                        {categoryCoursesFiltered.filter((c) => completed.includes(c.code)).length}/
                        {categoryCoursesFiltered.length}
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {categoryCoursesFiltered.map((course) => (
                        <div
                          key={course.code}
                          className={`flex items-center space-x-3 p-3 rounded transition-colors ${
                            completed.includes(course.code) ? "bg-gray-200" : "bg-white hover:bg-gray-100"
                          }`}
                        >
                          <Checkbox
                            checked={completed.includes(course.code)}
                            onCheckedChange={() => toggleCourse(course.code)}
                          />
                          <div className="flex-1">
                            <div className="font-bold text-black/80">{course.code}</div>
                            <div className="text-black/70 text-sm">{course.name}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Eligible Courses Section */}
        <Card className="h-fit">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-semibold">Available Next Semester</h2>
              </div>
              <Button
                onClick={fetchEligibleCourses}
                disabled={isLoading || completed.length === 0}
                className="bg-black hover:bg-zinc-800 text-white font-semibold py-2 px-4 rounded-lg"
              >
                {isLoading ? "Checking..." : "Check Eligibility"}
              </Button>
            </div>

            <p className="text-gray-600 mb-4">Courses you can take based on your completed prerequisites</p>

            {/* Category Filter for Eligible Courses */}
            {eligibleCourses.length > 0 && (
              <div className="mb-4">
                <label htmlFor="category-filter" className="block text-sm font-medium mb-2">
                  Filter by Category:
                </label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="">All Categories</option>
                  {Array.from(new Set(eligibleCourses.map((c) => c.category))).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredEligibleCourses.length > 0 ? (
                <>
                  <div className="text-sm text-gray-600 mb-3">
                    {filteredEligibleCourses.length} course{filteredEligibleCourses.length !== 1 ? "s" : ""} available
                  </div>
                  {filteredEligibleCourses.map((course) => (
                    <div
                      key={course.code}
                      className="p-4 border rounded-lg bg-white hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-semibold text-black text-lg">
                        {course.code}{` - `}
                        <span className="font-thin text-gray-700 mb-1">
                          {course.name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">{course.category}</div>
                      
                    </div>
                  ))}
                </>
              ) : eligibleCourses.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Ready to check eligibility?</p>
                  <p className="text-sm">
                    {completed.length === 0
                      ? "Select some completed courses first"
                      : "Click 'Check Eligibility' to see available courses"}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No courses match the selected category filter</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
