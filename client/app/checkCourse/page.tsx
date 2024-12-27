'use client'

import { useState, useEffect } from "react";

interface Course {
  code: string;
  name: string;
  prerequisites: string[];
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [completed, setCompleted] = useState<string[]>([]); 
  const [eligibleCourses, setEligibleCourses] = useState<Course[]>([]); 

  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/courses");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCourses(data);
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

  return (
    <div className="min-h-screen bg-white p-20 px-80 text-black">
      <div className="mb-10">
        <h2 className="text-5xl font-semibold">
          OnMyTrack --{'>'}
        </h2>
      </div>
      
      <div className="bg-white border border-solid rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Select Completed Courses</h2>
        <ul className="space-y-2">
          {courses.map((course) => (
            <li key={course.code}>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  onChange={() => toggleCourse(course.code)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="font-bold">{course.code}:</span>
                <span>{course.name}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <button
          onClick={fetchEligibleCourses}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Check Eligible Courses
        </button>
      </div>

      {eligibleCourses.length > 0 && (
        <div className="mt-6 bg-white border border-solid rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Eligible Courses</h2>
          <ul className="space-y-2">
            {eligibleCourses.map((course) => (
              <li key={course.code} className="text-gray-700">
                <span className="font-bold">{course.code}</span>
                <span>: {course.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}