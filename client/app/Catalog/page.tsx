'use client'
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Nav from "../../components/Nav";
import { ChevronDown, ChevronUp } from 'lucide-react';


interface Course {
  code: string;
  name: string;
  prerequisites: string[];
  category: string;
  credits: number | null;
  description: string | null;
}

// Individual Course Card with toggle for extra details
function CourseCard({ course }: { course: Course }) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-2xl font-bold">{course.name}</h2>
        <h3 className="text-sm font-semibold opacity-80">{course.code}</h3>
        <p className="text-gray-600 text-sm">{course.category}</p>

        <Button
          size="sm"
          variant="ghost"
          className="mt-2 font-bold"
          onClick={() => setOpen(prev => !prev)}
        >
          {open ? (
            <>
              <span>Less</span>
              <ChevronUp />
            </>
          ) : (
            <>
              <span>More</span>
              <ChevronDown />
            </>
          )}
        </Button>

        {open && (
          <div className="mt-4 space-y-2 text-sm text-zinc-700">
            <p>
              <span className="font-bold text-zinc-900">Prerequisites:</span>{' '}
              {course.prerequisites.length > 0
                ? course.prerequisites.join(', ')
                : 'None'}
            </p>
            <p>
              <span className="font-bold text-zinc-900">Description:</span> {course.description}
            </p>
            <p>
              <span className="font-bold text-zinc-900">Credits:</span> {course.credits}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/courses')
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Server Error: ${res.status} ${text}`);
        }
        return res.json();
      })
      .then(setCourses)
      .catch(err => console.error('Error fetching courses:', err));
  }, []);

  const categories = Array.from(
    new Set(courses.map(c => c.category))
  );

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategories.length === 0 || selectedCategories.includes(course.category))
  );

  return (
    <div className="min-h-screen p-10 mx-auto mt-20">
      <Nav />
      <div className="flex gap-8">
        {/* Filters & Search */}
        <div className="w-1/4">
          <div className="sticky top-24 p-6 border rounded-lg bg-white max-h-[calc(100vh-120px)] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Filters & Search</h2>
            <Input
              type="text"
              placeholder="Search for a course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />
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
        </div>

        {/* Course List */}
        <div className="w-3/4">
          <h1 className="text-4xl font-bold mb-6">Course Catalog</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.code} course={course} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
