'use client'

import { useState, useEffect } from "react";

interface Course {
  code: string;
  name: string;
  prerequisites: string[];
  category: string;
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [eligibleCourses, setEligibleCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/courses");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCourses(data);
        const uniqueCategories = Array.from(new Set(data.map((course) => course.category)));
        setCategories(uniqueCategories);
      } else {
        console.error("API returned invalid data:", data);
        setCourses([]);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  const fetchEligibleCourses = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/eligible", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed_courses: completed }),
      });
      const data: Course[] = await res.json();
      setEligibleCourses(data);
    } catch (error) {
      console.error("Failed to fetch eligible courses:", error);
    }
  };

  const toggleCourse = (courseCode: string) => {
    setCompleted((prev) =>
      prev.includes(courseCode)
        ? prev.filter((code) => code !== courseCode)
        : [...prev, courseCode]
    );
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredEligibleCourses = selectedCategory
    ? eligibleCourses.filter((course) => course.category === selectedCategory)
    : eligibleCourses;

  return (
    <div className="min-h-screen bg-white p-20 pt-15 text-black">
      <div className="mb-10">
        <h2 className="text-5xl font-semibold">
          OnMyTrack --{'>'}
        </h2>
      </div>

      {/* main Container */}
      <div className="flex space-x-10">
        {/* left secionn*/}
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
                      <li key={course.code}>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            onChange={() => toggleCourse(course.code)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <span className="font-bold text-black/80">{course.code}:</span>
                          <span className="text-black/80">{course.name}</span>
                        </label>
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        {/* eligible curses section */}
        <div className="w-1/2 bg-white rounded-lg p-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold mb-4">Eligible Courses</h2>

            {/* category filter */}
            <div className="mb-4">
              <label htmlFor="category-filter" className="text-black font-semibold mb-2 mr-2">
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
          <ul className="space-y-2">
            {filteredEligibleCourses.map((course) => (
              <li key={course.code} className="text-gray-700">
                <span className="font-bold">{course.code}</span>
                <span>: {course.name}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <button
              onClick={fetchEligibleCourses}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Check Eligible Courses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
