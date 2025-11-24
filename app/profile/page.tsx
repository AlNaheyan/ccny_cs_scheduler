"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import Nav from "@/components/Nav";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Notebook, BookCheck, Edit2, Check } from "lucide-react";

interface UserProfile {
  name: string;
  avatar_url: string;
  email: string;
  college_year?: string;
  major?: string;
}

interface Course {
  code: string;
  name: string;
  prerequisites: string[];
  category: string;
  credits: number | null;
}

export default function ProfilePage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [completedCourseCodes, setCompletedCourseCodes] = useState<string[]>(
    []
  );
  const [completedCourses, setCompletedCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedMajor, setEditedMajor] = useState("");
  const [editedYear, setEditedYear] = useState("");

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
        // Initialize edit fields
        setEditedName(data.name || "");
        setEditedMajor(data.major || "");
        setEditedYear(data.college_year || "");
      } else {
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
    const fetchSavedCourses = async () => {
      const res = await fetch("/api/saved-courses");
      if (!res.ok) {
        console.error("Failed to fetch saved courses");
        return;
      }
      const data = await res.json();
      if (Array.isArray(data?.courses)) {
        setCompletedCourseCodes(data.courses);
      } else {
        console.error("no courses found in res", data);
      }
    };
    if (isLoaded && isSignedIn) {
      fetchSavedCourses();
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (allCourses.length > 0 && completedCourseCodes.length > 0) {
      const matched = allCourses.filter((course) =>
        completedCourseCodes.includes(course.code)
      );
      setCompletedCourses(matched);
    }
  }, [allCourses, completedCourseCodes]);

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

  const filteredCourses = allCourses
    .filter((course) =>
      course.name.toLowerCase().includes(search.toLowerCase()) ||
      course.code.toLowerCase().includes(search.toLowerCase())
    ).filter((course) => !completedCourseCodes.includes(course.code));

  const toggleCourse = (course: Course) => {
    if (selectedCourses.find((c) => c.code === course.code)) {
      setSelectedCourses((prev) => prev.filter((c) => c.code !== course.code));
    } else {
      setSelectedCourses((prev) => [...prev, course]);
    }
  };

  const handleSave = async () => {
    const courseCodes = selectedCourses.map((c) => c.code);
    const newCourses = courseCodes.filter(
      (code) => !completedCourseCodes.includes(code)
    );

    if (newCourses.length === 0) {
      setSaveStatus("No new courses to save.");
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }

    const updatedCourseList = [...completedCourseCodes, ...newCourses];

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const res = await fetch("/api/saved-courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courses: updatedCourseList }),
      });

      if (!res.ok) {
        const errorBody = await res.json();
        console.error(
          "Failed to save courses:",
          errorBody.error || res.statusText
        );
        setSaveStatus("Failed to Save selected courses!");
      } else {
        console.log("Courses saved successfully");
        setCompletedCourseCodes(updatedCourseList);
        setSaveStatus("Selected courses have been saved as completed!");
        setSelectedCourses([]);
      }
    } catch (error) {
      console.error("Network or parsing error:", error);
      setSaveStatus("Error wheil saving your courses!");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editedName,
          major: editedMajor || null,
          college_year: editedYear || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update profile");
      }

      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      setIsEditingProfile(false);
      setSaveStatus("Profile updated successfully!");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveStatus(error instanceof Error ? error.message : "Failed to update profile");
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditedName(profile?.name || "");
    setEditedMajor(profile?.major || "");
    setEditedYear(profile?.college_year || "");
  };

  const totalCredits = completedCourses.reduce((sum, course) => {
    return sum + (course.credits ?? 0);
  }, 0)

  if (!isSignedIn) return null;

  return (
    <div className="min-h-screen bg-white p-10 pt-10 text-black">
      <Nav />
      <div className="max-w-5xl mx-auto mt-20">
        <h1 className="text-4xl font-bold mb-6">Profile</h1>

        {!profile ? (
          <Card className="w-full">
            <CardContent className="p-6 flex items-center justify-center h-40">
              <p className="text-lg text-black/70">Loading profile...</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-6 flex-1">
                  {/* Profile Picture */}
                  <Image
                    src={profile.avatar_url || "/placeholder.svg"}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full object-cover border-2 border-gray-200 shadow-md"
                  />

                  {/* Profile Info */}
                  <div className="flex-1 space-y-4 pt-2">
                    {!isEditingProfile ? (
                      <>
                        <div>
                          <h2 className="text-2xl font-bold text-black">{profile.name}</h2>
                          <p className="text-gray-600">{profile.email}</p>
                        </div>

                        {/* Stats Grid */}
                        {(profile.college_year || profile.major) && (
                          <div className="flex gap-8 pt-2">
                            {profile.major && (
                              <div>
                                <p className="text-sm text-gray-500">Major</p>
                                <p className="font-semibold text-black">{profile.major}</p>
                              </div>
                            )}
                            {profile.college_year && (
                              <div>
                                <p className="text-sm text-gray-500">Year</p>
                                <p className="font-semibold text-black">{profile.college_year}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Edit Mode */}
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Name</label>
                            <Input
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              placeholder="Your name"
                              className="max-w-md"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Major</label>
                            <select
                              value={editedMajor}
                              onChange={(e) => setEditedMajor(e.target.value)}
                              className="max-w-md w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                            >
                              <option value="">Select a major</option>
                              <option value="Computer Science">Computer Science</option>
                              <option value="Mathematics">Mathematics</option>
                              <option value="Mechanical Engineering">Mechanical Engineering</option>
                              <option value="Chemical Engineering">Chemical Engineering</option>
                              <option value="Civil Engineering">Civil Engineering</option>
                              <option value="Electrical Engineering">Electrical Engineering</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Year</label>
                            <select
                              value={editedYear}
                              onChange={(e) => setEditedYear(e.target.value)}
                              className="max-w-md w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                            >
                              <option value="">Select year</option>
                              <option value="Freshman">Freshman</option>
                              <option value="Sophomore">Sophomore</option>
                              <option value="Junior">Junior</option>
                              <option value="Senior">Senior</option>
                              <option value="Graduate">Graduate</option>
                            </select>
                          </div>

                          <p className="text-sm text-gray-500">{profile.email}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Edit/Save Buttons */}
                <div className="flex gap-2">
                  {!isEditingProfile ? (
                    <Button
                      onClick={() => setIsEditingProfile(true)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        size="sm"
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        size="sm"
                        className="bg-black hover:bg-gray-800 text-white flex items-center gap-2"
                        disabled={isSaving || !editedName.trim()}
                      >
                        {isSaving ? (
                          "Saving..."
                        ) : (
                          <>
                            Save
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Save Status Message */}
              {saveStatus && (
                <div className={`mb-4 p-3 rounded-lg ${saveStatus.includes("successfully") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  {saveStatus}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="w-full mt-6">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Student Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-black/80 mb-3">
                  Search and select courses you have completed:
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
                      className="p-2 absolute z-10 w-full max-h-80 overflow-y-auto bg-white border rounded-md shadow-md"
                    >
                      {filteredCourses.map((course) => (
                        <div
                          key={course.code}
                          className={`p-2 cursor-pointer hover:bg-gray-100 hover:rounded-md ${selectedCourses.find((c) => c.code === course.code)
                            ? "bg-gray-200 rounded-md"
                            : ""
                            }`}
                          onClick={() => toggleCourse(course)}
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
                <div className="mt-5">
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
                            <div className="flex gap-3">
                              <Notebook size={18} />
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
                        Search and select courses from the searchbar.
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-black hover:bg-zinc-800 text-white font-semibold py-2 px-8 rounded-lg"
                  >
                    {isSaving ? "Saving.." : "Save Courses"}
                  </Button>
                </div>
                {saveStatus && (
                  <p className={`text-center mt-3 font-bold text-sm ${saveStatus.includes("Failed") ? "text-red-500" : "text-green-600"}`}>
                    {saveStatus}
                  </p>
                )}
              </div>
              <div>
                <h3 className="font-semibold mb-2">Completed Courses:</h3>
                <div className="mb-3 text-sm text-gray-900 font-medium">
                  Total credits earned: <span className="text-black"> {totalCredits}</span>
                </div>
                {completedCourses.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <div className="max-h-80 overflow-y-auto">
                      {completedCourses.map((course) => (
                        <div
                          key={course.code}
                          className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-gray-50"
                        >
                          <BookCheck size={18} />
                          <div>
                            <div className="font-medium">{course.name}</div>
                            <div className="text-sm text-gray-600">
                              {course.code}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No completed courses saved yet.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
