import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('courses')
            .select('id')
            .limit(1)

        if (error) {
            console.error("keep it alive twin:",  error);
            return NextResponse.json({error: error.message}, { status: 500})
        }

        return NextResponse.json({ 
            message: 'database pinged successfully',
            timestamp: new Date().toISOString(),
            recordsFound: data?.length || 0 
        })

    } catch (error) {
        console.error('cron error: ', error)
        return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
}




