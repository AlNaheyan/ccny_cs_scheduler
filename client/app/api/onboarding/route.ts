import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

// GET: Check if user has completed onboarding
export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('users')
            .select('onboarding_completed')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            onboarding_completed: data?.onboarding_completed ?? false
        });
    } catch (err) {
        console.error('Internal server error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST: Save onboarding data
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, college_year, major, completed_courses } = body;

        // Validate required fields
        if (!name || !college_year || !major) {
            return NextResponse.json(
                { error: 'Name, college year, and major are required' },
                { status: 400 }
            );
        }

        if (!Array.isArray(completed_courses)) {
            return NextResponse.json(
                { error: 'Completed courses must be an array' },
                { status: 400 }
            );
        }

        // Update user profile
        const { error: userError } = await supabase
            .from('users')
            .update({
                name,
                college_year,
                major,
                onboarding_completed: true,
            })
            .eq('id', userId);

        if (userError) {
            console.error('Error updating user:', userError);
            return NextResponse.json({ error: userError.message }, { status: 500 });
        }

        // Save completed courses
        const { error: coursesError } = await supabase
            .from('saved_courses')
            .upsert({
                id: userId,
                courses: completed_courses,
            });

        if (coursesError) {
            console.error('Error saving courses:', coursesError);
            return NextResponse.json({ error: coursesError.message }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Onboarding completed successfully'
        });
    } catch (err) {
        console.error('Internal server error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
