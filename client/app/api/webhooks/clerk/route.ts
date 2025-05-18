import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Webhook } from 'svix';

const secret = process.env.CLERK_WEBHOOK_SECRET || "";

interface ClerkEvent {
  type: 'user.created' | 'user.updated' | string;
  data: {
    id: string;
    email_addresses: {
        email_address: string;
    }[];
    first_name?: string;
    last_name?: string;
    image_url?: string; // Clerk profile image
  };
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();

    const svixHeaders = {
        "svix-id": req.headers.get("svix-id") ?? "",
        "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
        "svix-signature": req.headers.get("svix-signature") ?? "",
    };

    const wh = new Webhook(secret);
    const evt = wh.verify(payload, svixHeaders) as ClerkEvent;

    const { type, data } = evt;

    if (!['user.created', 'user.updated'].includes(type)) {
      return NextResponse.json({ message: 'Ignored event' }, { status: 200 });
    }

    const userId = data.id;
    const email = data.email_addresses?.[0]?.email_address ?? '';    const name = `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim();
    const avatar_url = data.image_url ?? '';

    const { error } = await supabase
      .from('users')
      .upsert({ id: userId, email, name, avatar_url });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'User synced successfully' });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Webhook error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}