import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const share_token = searchParams.get('share_token');
    const section_key = searchParams.get('section_key');

    if (!share_token || !section_key) {
      return NextResponse.json({ error: 'share_token and section_key required' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('prd_comments')
      .select('*')
      .eq('share_token', share_token)
      .eq('section_key', section_key)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    return NextResponse.json({ comments: data ?? [] });
  } catch (err) {
    console.error('/api/prd/comments GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { share_token, section_key, author_name, content } = await req.json();

    if (!share_token || !section_key || !author_name || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (author_name.length > 50) {
      return NextResponse.json({ error: 'Author name too long (max 50 chars)' }, { status: 400 });
    }
    if (content.length > 500) {
      return NextResponse.json({ error: 'Comment too long (max 500 chars)' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('prd_comments')
      .insert({ share_token, section_key, author_name, content })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to save comment' }, { status: 500 });
    }

    return NextResponse.json({ comment: data });
  } catch (err) {
    console.error('/api/prd/comments POST error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
