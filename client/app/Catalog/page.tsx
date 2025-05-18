'use client'
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import Nav from "../../components/Nav";

interface Course {
  code: string;
  name: string;
  prerequisites: string[];
  category: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/courses")
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Server Error: ${res.status} ${text}`);
        }
        return res.json();
      })
      .then(setCourses)
      .catch((error) => console.error("Error fetching courses:", error));
  }, []);

  // Get unique categories
  const categories = Array.from(new Set(courses.map((course) => course.category)));

  // Handle category filter selection
  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  // Filter courses based on search & category selection
  const filteredCourses = courses.filter((course) => 
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategories.length === 0 || selectedCategories.includes(course.category))
  );

  return (
    <div className="min-h-screen p-10 mx-auto mt-20">
      <Nav />

      <div className="flex gap-8">
        {/* Sticky Sidebar for Filters & Search */}
        <div className="w-1/4 h-1/4 sticky top-20 p-6 border rounded-lg bg-white">
          <h2 className="text-xl font-bold mb-4">Filters & Search</h2>

          {/* Search Bar */}
          <Input
            type="text"
            placeholder="Search for a course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />

          {/* Category Filters */}
          <h3 className="text-lg font-semibold mb-2">Filter by Category</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryChange(category)}
                />
                <label htmlFor={category} className="text-sm font-medium">
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Course List */}
        <div className="w-3/4">
          <h1 className="text-4xl font-bold mb-6">Course Catalog</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.code}>
                <CardContent className="p-4">
                  <h2 className="text-2xl font-bold">{course.name}</h2>
                  <h3 className="text-sm font-semibold opacity-80">{course.code}</h3>
                  <p className="text-gray-600 text-sm">{course.category}</p>
                  <p className="text-sm text-gray-500">
                    Prerequisites: {course.prerequisites.length > 0 ? course.prerequisites.join(", ") : "None"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}