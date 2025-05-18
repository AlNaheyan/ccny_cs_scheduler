'use client'

import Nav from '../../components/Nav'
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface Course {
  code: string;
  name: string;
  prerequisites: string[];
  category: string;
}

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isSignedIn, isLoaded, router]);

  const [courses, setCourses] = useState<Course[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [eligibleCourses, setEligibleCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    fetch("/api/courses")
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Server Error: ${res.status} ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setCourses(data);
          setCategories(Array.from(new Set(data.map((course) => course.category))));
        } else {
          console.error("API returned invalid data:", data);
          setCourses([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
      });
  }, []);

  const fetchEligibleCourses = async () => {
    fetch("/api/eligible", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed_courses: completed }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Server Error: ${res.status} ${text}`);
        }
        return res.json();
      })
      .then((data: Course[]) => {
        setEligibleCourses(data);
      })
      .catch((error) => {
        console.error("Failed to fetch eligible courses:", error);
      });
  };

  const toggleCourse = (courseCode: string) => {
    setCompleted((prev) =>
      prev.includes(courseCode)
        ? prev.filter((code) => code !== courseCode)
        : [...prev, courseCode]
    );
  };

  const filteredEligibleCourses = selectedCategory
    ? eligibleCourses.filter((course) => course.category === selectedCategory)
    : eligibleCourses;

  return (
    <div className="min-h-screen bg-white p-20 pt-15 text-black">
      <Nav />
      <div className="flex space-x-10">
        <div className="w-1/2 bg-white rounded-lg p-5">
          <h2 className="text-2xl font-semibold mb-4">Select Completed Courses</h2>
          <ul className="space-y-4">
            {categories.map((category) => (
              <li className="border border-solid p-5 rounded-lg" key={category}>
                <h3 className="text-lg font-bold mb-2 text-black">{category}</h3>
                <ul className="space-y-2 pl-4">
                  {courses
                    .filter((course) => course.category === category)
                    .map((course) => (
                      <li key={course.code} className="flex items-center space-x-2">
                        <Checkbox
                          checked={completed.includes(course.code)}
                          onCheckedChange={() => toggleCourse(course.code)}
                        />
                        <span className="font-bold text-black/80">{course.code}:</span>
                        <span className="text-black/80">{course.name}</span>
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-1/2 bg-white rounded-lg p-6">
          <div className="justify-between">
            <h2 className="text-2xl font-semibold">Eligible Courses</h2>
            <div className="mb-4">
              <label htmlFor="category-filter" className="text-black/70 font-medium mb-2 mr-2">
                Filter by Category:
              </label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg p-1.5"
              >
                <option value="">All</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <hr className="mb-4" />
          <ul className="space-y-2">
            {filteredEligibleCourses.map((course) => (
              <li key={course.code} className="text-gray-700">
                <span className="font-bold">{course.code}</span>: {course.name}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <button
              onClick={fetchEligibleCourses}
              className="w-full bg-black hover:bg-zinc-800 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Check Eligible Courses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}