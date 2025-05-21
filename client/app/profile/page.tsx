"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import Nav from "@/components/Nav";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface UserProfile {
  name: string;
  avatar_url: string;
  email: string;
}

interface Course {
  code: string;
  name: string;
  prerequisites: string[];
  category: string;
}

export default function ProfilePage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) {
        console.error("Failed to load profile");
        return;
      }
      const data = await res.json();
      if (data?.name) {
        setProfile(data);
      } else {
        console.warn("No profile data found");
        setProfile(null);
      }
    };

    if (isLoaded && isSignedIn) {
      fetchProfile();
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    const fetchCourses = async () => {
      const res = await fetch("/api/courses");
      const data = await res.json();
      setAllCourses(data);
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredCourses = allCourses.filter(
    (course) =>
      course.name.toLowerCase().includes(search.toLowerCase()) ||
      course.code.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCourse = (course: Course) => {
    if (selectedCourses.find((c) => c.code === course.code)) {
      setSelectedCourses((prev) => prev.filter((c) => c.code !== course.code));
    } else {
      setSelectedCourses((prev) => [...prev, course]);
    }
  };

  if (!isSignedIn) return null;

  return (
    <div className="min-h-screen bg-white p-10 pt-10 text-black">
      <Nav />

      <div className="max-w-5xl mx-auto mt-20">
        <h1 className="text-4xl font-bold mb-6">Student Profile</h1>

        {!profile ? (
          <Card className="w-full">
            <CardContent className="p-6 flex items-center justify-center h-40">
              <p className="text-lg text-black/70">Loading profile...</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Image
                  src={profile.avatar_url || "/placeholder.svg"}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-semibold text-black/70">
                      Name
                    </span>
                    <p className="text-xl font-bold">{profile.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-black/70">
                      Email
                    </span>
                    <p className="text-lg">{profile.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="w-full mt-6">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Completed Courses</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-black/80 mb-3">
                  Search and select courses you&apos;ve completed:
                </p>

                <div className="relative">
                  <Input
                    placeholder="Search courses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setShowOptions(true)}
                    ref={searchInputRef}
                    className="mb-2"
                  />
                  {showOptions && (
                    <div
                      ref={dropdownRef}
                      className=" p-2 absolute z-10 w-full max-h-80 overflow-y-auto bg-white border rounded-md shadow-md"
                    >
                      {filteredCourses.map((course) => (
                        <div
                          key={course.code}
                          className={`p-2 cursor-pointer hover:bg-gray-100 hover:rounded-md ${
                            selectedCourses.find((c) => c.code === course.code)
                              ? "bg-gray-200 rounded-md"
                              : ""
                          }`}
                          onClick={() => {
                            toggleCourse(course);
                          }}
                        >
                          <span className="font-medium">{course.code}</span> -{" "}
                          {course.name}
                        </div>
                      ))}
                      {filteredCourses.length === 0 && (
                        <p className="text-sm text-gray-500 p-2">
                          No results found.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  <p>
                    Search by course code or name and select from the dropdown.
                  </p>
                  <p>
                    Click on a course to add it to your completed courses list.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Selected Courses:</h3>
                  <span className="text-sm text-gray-500">
                    {selectedCourses.length} courses selected
                  </span>
                </div>

                {selectedCourses.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <div className="max-h-80 overflow-y-auto">
                      {selectedCourses.map((course) => (
                        <div
                          key={course.code}
                          className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50"
                        >
                          <div>
                            <div className="font-medium">{course.code}</div>
                            <div className="text-sm text-gray-600">
                              {course.name}
                            </div>
                          </div>
                          <button
                            onClick={() => toggleCourse(course)}
                            className="text-gray-400 hover:text-red-500 p-1"
                            aria-label={`Remove ${course.code}`}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-md p-8 text-center text-gray-500">
                    <p>No courses selected yet.</p>
                    <p className="text-sm mt-1">
                      Search and select courses from the left panel.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <Button className="bg-black hover:bg-zinc-800 text-white font-semibold py-2 px-8 rounded-lg">
                Save Completed Courses
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
