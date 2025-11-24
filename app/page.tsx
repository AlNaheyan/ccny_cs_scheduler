"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Nav from "../components/Nav"
import Image from "next/image"
import Hero_Img from "../public/hero_img.png"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { BookOpen, BarChart3, GraduationCap, Calendar, Target } from "lucide-react"

export default function Home() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/Catalog")
    }
  }, [isLoaded, isSignedIn, router])

  const handleGetStared = () => {
    if (!isLoaded) return
    if (isSignedIn) {
      router.push("/Catalog")
    } else {
      router.push("/sign-up")
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Nav />

      {/* Enhanced Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-green-400 duration-200">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Trusted by 500+ students
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Organize your academic life with
                  <span className="text-gray-600"> ease</span>
                </h1>
                <p className="text-xl text-zinc-500 leading-relaxed">
                  Keep your academic journey on track with Acadions powerful planning tools. Plan courses, track
                  progress, and achieve your educational goals.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleGetStared}
                  className="bg-black hover:bg-gray-800 text-white text-lg py-4 px-8 rounded-lg"
                >
                  Get Started Free
                </Button>
                <Button variant="outline" className="text-lg py-4 px-8 rounded-lg border">
                  <Link href="/Catalog">Browse Courses</Link>
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">140+</div>
                  <div className="text-sm text-gray-600">Courses Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">95%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">24/7</div>
                  <div className="text-sm text-gray-600">Support</div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2">
              <div className="relative">
                <Image
                  src={Hero_Img || "/placeholder.svg"}
                  alt="Acadion dashboard preview"
                  width={800}
                  height={500}
                  className="rounded-2xl shadow-xl transform rotate-2 0 transition-transform duration-300"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Live Progress Tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need to succeed</h2>
            <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
              Powerful features designed to help students plan, track, and achieve their academic goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Course Planning</h3>
              <p className="text-gray-600 text-sm">
                Plan your entire academic journey with intelligent course sequencing
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Progress Tracking</h3>
              <p className="text-gray-600 text-sm">
                Monitor your academic progress with visual dashboards and insights
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Goals</h3>
              <p className="text-gray-600 text-sm">Set and track academic goals with personalized recommendations</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Course Catalog</h3>
              <p className="text-gray-600 text-sm">Browse comprehensive course catalog with detailed prerequisites</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How it works</h2>
            <p className="text-xl text-zinc-600">Get started in just a few simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Create Your Profile</h3>
              <p className="text-gray-600">
                Set up your academic profile, define your major, and set your graduation goals
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Plan Your Path</h3>
              <p className="text-gray-600">
                Browse courses, check prerequisites, and build your personalized academic roadmap
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Track & Succeed</h3>
              <p className="text-gray-600">
                Monitor your progress, get recommendations, and stay on track to graduation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50 text-black">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Ready to take control of your academic future?</h2>
          <p className="text-xl text-gray-800 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already using Acadion to plan their path to success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGetStared}
              className="bg-black text-white font-semibold hover:bg-gray-900 text-md py-4 px-8 rounded-lg"
            >
              Start Planning Today
            </Button>
            <Button
              onClick={handleGetStared}
              variant="outline"
              className="text-black hover:bg-white text-lg py-4 px-8 rounded-lg border"
            >
              Explore Courses
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
