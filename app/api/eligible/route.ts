import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface Course {
  code: string;
  name: string;
  category: string;
  prerequisites: string[];
}

const loadCourses = async (): Promise<Course[]> => {
  const { data, error } = await supabase.from('courses').select('*');
  if (error) throw error;

  const courses = data as Course[];
  for (const course of courses) {
    if (!Array.isArray(course.prerequisites)) {
      course.prerequisites = [];
    }
  }
  return courses;
};

const getEligibleCourses = (
  completedCourses: string[],
  allCourses: Course[],
  category?: string
): Course[] => {
  return allCourses.filter((course) => {
    const prereqs = course.prerequisites;
    const isEligible =
      prereqs.every((prereq) => completedCourses.includes(prereq)) &&
      !completedCourses.includes(course.code);

    return isEligible && (!category || course.category === category);
  });
};

export async function POST(req: NextRequest) {
  try {
    const { completed_courses = [], category }: {
      completed_courses: string[];
      category?: string;
    } = await req.json();

    const allCourses = await loadCourses();
    const eligibleCourses = getEligibleCourses(completed_courses, allCourses, category);
    return NextResponse.json(eligibleCourses);
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error('Error calculating eligibility:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}