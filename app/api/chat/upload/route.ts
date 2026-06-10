import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, createClient } from '@/lib/supabase/server';

const BLOCKED_EXTENSIONS = ['.exe', '.sh', '.bat', '.cmd', '.msi'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const TEXT_CONTEXT_MAX = 100 * 1024; // 100 KB
const TEXT_MIME_PREFIXES = ['text/'];
const TEXT_MIME_EXACT = ['application/json'];
const TEXT_EXTENSIONS = ['.txt', '.md', '.csv', '.json', '.ts', '.tsx', '.js', '.py', '.html', '.css'];

function getExt(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? '.' + parts.pop()!.toLowerCase() : '';
}

function isTextFile(mimeType: string, filename: string): boolean {
  if (TEXT_MIME_PREFIXES.some((p) => mimeType.startsWith(p))) return true;
  if (TEXT_MIME_EXACT.includes(mimeType)) return true;
  return TEXT_EXTENSIONS.includes(getExt(filename));
}

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\:*?"<>|]/g, '_').replace(/\s+/g, '-');
}

export async function POST(req: NextRequest) {
  try {
    const supabaseAuth = createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const session_id = formData.get('session_id') as string | null;

    if (!file || !session_id) {
      return NextResponse.json({ error: 'file and session_id required' }, { status: 400 });
    }

    // Validate extension
    const ext = getExt(file.name);
    if (BLOCKED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    // Validate size
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Verify session belongs to user
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', session_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Build storage path
    const sanitized = sanitizeFilename(file.name);
    const filePath = `${user.id}/${session_id}/${Date.now()}-${sanitized}`;

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const { error: storageError } = await supabase.storage
      .from('chat-attachments')
      .upload(filePath, fileBuffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (storageError) {
      console.error('Storage upload error:', storageError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Insert into chat_attachments
    const { data: attachment, error: dbError } = await supabase
      .from('chat_attachments')
      .insert({
        session_id,
        message_id: null,
        file_name: file.name,
        file_path: filePath,
        mime_type: file.type || 'application/octet-stream',
        size_bytes: file.size,
      })
      .select('id, file_name, mime_type, size_bytes')
      .single();

    if (dbError) {
      console.error('DB insert error:', dbError);
      return NextResponse.json({ error: 'Failed to save attachment metadata' }, { status: 500 });
    }

    // Return text content for text files under 100KB
    let text_content: string | undefined;
    if (isTextFile(file.type, file.name) && file.size < TEXT_CONTEXT_MAX) {
      text_content = await file.text();
    }

    return NextResponse.json({ attachment, text_content });
  } catch (err) {
    console.error('/api/chat/upload error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
