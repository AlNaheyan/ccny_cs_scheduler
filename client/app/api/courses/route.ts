import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface Course {
  code: string;
  name: string;
  category: string;
  prerequisites: string[];
}

export async function GET() {
  const { data, error } = await supabase.from('courses').select('*');

  if (error) {
    console.error(' Supabase fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const courses = (data ?? []) as Course[];

  for (const course of courses) {
    if (!Array.isArray(course.prerequisites)) {
      course.prerequisites = [];
    }
  }

  return NextResponse.json(courses);
}