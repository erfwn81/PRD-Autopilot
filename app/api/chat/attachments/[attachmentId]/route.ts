import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, createClient } from '@/lib/supabase/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { attachmentId: string } }
) {
  try {
    const supabaseAuth = createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();
    const { attachmentId } = params;

    // Fetch attachment and verify it belongs to the user (via session)
    const { data: attachment, error } = await supabase
      .from('chat_attachments')
      .select('id, file_name, file_path, session_id, mime_type')
      .eq('id', attachmentId)
      .single();

    if (error || !attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    // Verify the session belongs to the user
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', attachment.session_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!session) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Generate signed URL (60 min expiry)
    const { data: signedData, error: signedError } = await supabase.storage
      .from('chat-attachments')
      .createSignedUrl(attachment.file_path, 3600);

    if (signedError || !signedData) {
      return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
    }

    return NextResponse.json({ url: signedData.signedUrl, file_name: attachment.file_name });
  } catch (err) {
    console.error('/api/chat/attachments/[id] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
