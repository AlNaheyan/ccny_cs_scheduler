"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronRight, ChevronLeft, Loader2 } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

const collegeYears = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"]

const majors = [
    "Computer Science",
    "Mathematics",
    "Mechanical Engineering",
    "Chemical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
]

interface Course {
    code: string
    name: string
    prerequisites: string[]
    category: string
    credits: number | null
    description: string | null
}

const transitionProps = {
    type: "spring" as const,
    stiffness: 500,
    damping: 30,
    mass: 0.5,
}

// Map majors to course code prefixes
const majorToCoursePrefix: Record<string, string[]> = {
    "Computer Science": ["CSC", "CS"],
    "Mathematics": ["MATH", "MTH"],
    "Mechanical Engineering": ["ME", "MECH"],
    "Chemical Engineering": ["CHE", "CHEM"],
    "Civil Engineering": ["CE", "CIV"],
    "Electrical Engineering": ["EE", "ECE", "ELEC"],
}

function ChipButton({
    label,
    isSelected,
    onClick,
}: {
    label: string
    isSelected: boolean
    onClick: () => void
}) {
    return (
        <motion.button
            onClick={onClick}
            layout
            initial={false}
            animate={{
                backgroundColor: isSelected ? "#000000" : "#f1f5f9",
            }}
            whileHover={{
                backgroundColor: isSelected ? "#1f1f1f" : "#e5e7eb",
            }}
            whileTap={{
                backgroundColor: isSelected ? "#3f3f3f" : "#d1d5db",
            }}
            transition={{
                type: "spring" as const,
                stiffness: 500,
                damping: 30,
                mass: 0.5,
                backgroundColor: { duration: 0.1 },
            }}
            className={`
        inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold
        whitespace-nowrap overflow-hidden border transition-shadow
        ${isSelected ? "text-white border-black shadow-md" : "text-black border-gray-200 hover:shadow"}
      `}
        >
            <motion.div
                className="relative flex items-center"
                animate={{
                    width: isSelected ? "auto" : "100%",
                    paddingRight: isSelected ? "1.25rem" : "0",
                }}
                transition={{
                    ease: [0.175, 0.885, 0.32, 1.275],
                    duration: 0.3,
                }}
            >
                <span>{label}</span>
                <AnimatePresence>
                    {isSelected && (
                        <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{
                                type: "spring" as const,
                                stiffness: 500,
                                damping: 30,
                                mass: 0.5,
                            }}
                            className="absolute right-0"
                        >
                            <div className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />
                            </div>
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.button>
    )
}

export default function OnboardingForm() {
    const { user, isLoaded } = useUser()
    const router = useRouter()

    const [currentStep, setCurrentStep] = useState(1)
    const [name, setName] = useState("")
    const [collegeYear, setCollegeYear] = useState<string>("")
    const [major, setMajor] = useState<string>("")
    const [completedCourses, setCompletedCourses] = useState<string[]>([])
    const [availableCourses, setAvailableCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingCourses, setLoadingCourses] = useState(true)
    const [error, setError] = useState<string>("")

    const totalSteps = 4

    // Pre-fill name from Clerk user data
    useEffect(() => {
        if (isLoaded && user) {
            const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim()
            setName(fullName || '')
        }
    }, [isLoaded, user])

    // Fetch available courses
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('/api/courses')
                if (!response.ok) throw new Error('Failed to fetch courses')
                const data = await response.json()
                setAvailableCourses(data)
            } catch (err) {
                console.error('Error fetching courses:', err)
                setError('Failed to load courses. Please try again.')
            } finally {
                setLoadingCourses(false)
            }
        }

        fetchCourses()
    }, [])

    // Filter courses based on selected major
    const filteredCourses = availableCourses.filter(course => {
        if (!major) return true // Show all if no major selected
        const prefixes = majorToCoursePrefix[major] || []
        return prefixes.some(prefix => course.code.toUpperCase().startsWith(prefix.toUpperCase()))
    })

    const toggleCourse = (courseCode: string) => {
        setCompletedCourses((prev) =>
            prev.includes(courseCode) ? prev.filter((c) => c !== courseCode) : [...prev, courseCode]
        )
    }

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/onboarding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    college_year: collegeYear,
                    major,
                    completed_courses: completedCourses,
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to save onboarding data')
            }

            // Redirect to catalog after successful onboarding
            router.push('/Catalog')
        } catch (err) {
            console.error('Error submitting onboarding:', err)
            setError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return name.trim() !== ""
            case 2:
                return collegeYear !== ""
            case 3:
                return major !== ""
            case 4:
                return true // No requirement for completed courses
            default:
                return false
        }
    }

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-10">
            <div className="w-full max-w-[640px]">
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-gray-600 text-sm font-medium">
                            Step {currentStep} of {totalSteps}
                        </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-black"
                            initial={{ width: "0%" }}
                            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        />
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {currentStep === 1 && (
                            <div>
                                <h1 className="text-2xl font-bold text-black mb-2">{"What's your name?"}</h1>
                                <p className="text-gray-600 text-sm mb-6">You can update your name if needed</p>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                                />
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div>
                                <h1 className="text-2xl font-bold text-black mb-2">What year are you in college?</h1>
                                <p className="text-gray-600 text-sm mb-6">Select your current year</p>
                                <motion.div className="flex flex-wrap gap-3 overflow-visible" layout transition={transitionProps}>
                                    {collegeYears.map((year) => (
                                        <ChipButton
                                            key={year}
                                            label={year}
                                            isSelected={collegeYear === year}
                                            onClick={() => setCollegeYear(year)}
                                        />
                                    ))}
                                </motion.div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div>
                                <h1 className="text-2xl font-bold text-black mb-2">{"What's your major?"}</h1>
                                <p className="text-gray-600 text-sm mb-6">Select your field of study</p>
                                <motion.div className="flex flex-wrap gap-3 overflow-visible" layout transition={transitionProps}>
                                    {majors.map((majorOption) => (
                                        <ChipButton
                                            key={majorOption}
                                            label={majorOption}
                                            isSelected={major === majorOption}
                                            onClick={() => setMajor(majorOption)}
                                        />
                                    ))}
                                </motion.div>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div>
                                <h1 className="text-2xl font-bold text-black mb-2">What courses have you completed?</h1>
                                <p className="text-gray-600 text-sm mb-6">Select all that apply (optional)</p>
                                {loadingCourses ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-6 h-6 animate-spin text-black" />
                                    </div>
                                ) : (
                                    <motion.div
                                        className="flex flex-wrap gap-3 overflow-visible max-h-[400px] overflow-y-auto pr-2"
                                        layout
                                        transition={transitionProps}
                                    >
                                        {filteredCourses.length === 0 ? (
                                            <p className="text-gray-500 text-sm">No courses found for {major}</p>
                                        ) : (
                                            filteredCourses.map((course) => (
                                                <ChipButton
                                                    key={course.code}
                                                    label={course.name}
                                                    isSelected={completedCourses.includes(course.code)}
                                                    onClick={() => toggleCourse(course.code)}
                                                />
                                            ))
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="mt-12 flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${currentStep === 1
                            ? "opacity-0 pointer-events-none"
                            : "bg-gray-100 text-black hover:bg-gray-200 border border-gray-200"
                            }`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </button>

                    {currentStep < totalSteps ? (
                        <button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${canProceed()
                                ? "bg-black text-white hover:bg-gray-800 shadow-md"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-black text-white hover:bg-gray-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    Complete
                                    <Check className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
