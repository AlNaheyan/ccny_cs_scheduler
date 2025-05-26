import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

// fetch saved courses
export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json( {error: "Unauthorized"}, {status: 401});
    }

    const { data, error } = await supabase
        .from('saved_courses')
        .select("courses")
        .eq('id', userId)
        .maybeSingle();
    if (error) {
        console.error("supbase error for fetch", error);
        return NextResponse.json( {error: error.message}, {status: 500});
    }

    return NextResponse.json({courses: data?.courses ?? []});
}

// Save courses from profile
export async function POST(req: Request) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({error: "Unauthorized" }, {status: 401});
    }

    const body = await req.json();
    const { courses } = body;

    if (!Array.isArray(courses)) {
        return NextResponse.json({error: 'coursea must be arrays'}, {status: 400});
    }

    const { error } = await supabase
        .from('saved_courses')
        .upsert({
            id: userId,
            courses: courses,
        });
    if (error) {
        console.error(" Supabase insert error:", error.message, error.details);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({message: 'course saved'});
}