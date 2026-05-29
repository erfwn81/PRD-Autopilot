import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { pushToNotion } from '@/lib/export/toNotion';
import type { PRDDocument } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, notionPageId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    if (!process.env.NOTION_API_KEY) {
      return NextResponse.json({ error: 'NOTION_API_KEY not configured' }, { status: 500 });
    }

    const supabase = createServiceClient();

    const { data: prdDoc, error: prdError } = await supabase
      .from('prd_documents')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (prdError || !prdDoc) {
      return NextResponse.json({ error: 'PRD not found' }, { status: 404 });
    }

    const { data: session } = await supabase
      .from('prd_sessions')
      .select('title')
      .eq('id', sessionId)
      .single();

    const prd: PRDDocument = {
      ...prdDoc,
      title: session?.title ?? 'Product Requirements Document',
    };

    const page = await pushToNotion(prd, notionPageId);

    return NextResponse.json({
      url: (page as { url?: string }).url ?? null,
      pageId: page.id,
    });
  } catch (err) {
    console.error('/api/prd/export/notion error:', err);
    return NextResponse.json(
      { error: 'Notion export failed. Verify your NOTION_API_KEY.' },
      { status: 500 }
    );
  }
}
