'use client';

import { useState, useRef, useCallback } from 'react';

export interface SendParams {
  message: string;
  attachment_ids?: string[];
  attachments_context?: string;
}

interface PendingAttachment {
  localId: string;       // temporary client-side id for keying
  id?: string;           // returned from upload API
  file_name: string;
  mime_type: string;
  size_bytes: number;
  text_content?: string;
  uploading: boolean;
  error: boolean;
}

interface ChatInputProps {
  onSend: (params: SendParams) => void;
  disabled: boolean;
  ensureSession?: () => Promise<string>;
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ChatInput({ onSend, disabled, ensureSession }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [pending, setPending] = useState<PendingAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    const hasAttachments = pending.some(p => !p.uploading && !p.error && p.id);
    if ((!trimmed && !hasAttachments) || disabled) return;
    if (pending.some(p => p.uploading)) return; // still uploading

    const attachment_ids = pending.filter(p => p.id).map(p => p.id as string);
    const contextParts = pending
      .filter(p => p.id && p.text_content)
      .map(p => `--- ${p.file_name} ---\n${p.text_content!}`);
    const attachments_context = contextParts.length > 0 ? contextParts.join('\n\n') : undefined;

    onSend({ message: trimmed, attachment_ids: attachment_ids.length ? attachment_ids : undefined, attachments_context });
    setValue('');
    setPending([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, disabled, pending, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Part A: Enter sends; Shift+Enter inserts newline
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    // Reset input so the same file can be re-selected
    e.target.value = '';

    // C4: If no session exists yet, create one first
    let sessionId: string | undefined;
    if (ensureSession) {
      try {
        sessionId = await ensureSession();
      } catch {
        return;
      }
    }

    for (const file of files) {
      const localId = `local-${Date.now()}-${Math.random()}`;
      setPending(prev => [...prev, {
        localId,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        uploading: true,
        error: false,
      }]);

      if (!sessionId) {
        setPending(prev => prev.map(p => p.localId === localId ? { ...p, uploading: false, error: true } : p));
        continue;
      }

      const form = new FormData();
      form.append('file', file);
      form.append('session_id', sessionId);

      try {
        const res = await fetch('/api/chat/upload', { method: 'POST', body: form });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        setPending(prev => prev.map(p =>
          p.localId === localId
            ? { ...p, uploading: false, id: data.attachment.id, text_content: data.text_content }
            : p
        ));
      } catch {
        setPending(prev => prev.map(p =>
          p.localId === localId ? { ...p, uploading: false, error: true } : p
        ));
      }
    }
  };

  const removeAttachment = (localId: string) => {
    setPending(prev => prev.filter(p => p.localId !== localId));
  };

  const isUploading = pending.some(p => p.uploading);
  const canSend = (value.trim() || pending.some(p => p.id)) && !disabled && !isUploading;

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      {/* Attachment chips */}
      {pending.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 max-w-4xl mx-auto">
          {pending.map(p => (
            <div
              key={p.localId}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border ${
                p.error
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : p.uploading
                  ? 'bg-gray-50 border-gray-200 text-gray-500'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-700'
              }`}
            >
              {p.uploading && (
                <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0" />
              )}
              {p.error && <span>⚠</span>}
              {!p.uploading && !p.error && <span>📎</span>}
              <span className="max-w-[120px] truncate">{p.file_name}</span>
              <span className="text-gray-400">{formatBytes(p.size_bytes)}</span>
              <button
                onClick={() => removeAttachment(p.localId)}
                className="ml-0.5 hover:text-red-500 transition-colors"
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end max-w-4xl mx-auto">
        {/* Paperclip button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="shrink-0 p-2.5 rounded-xl border border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 transition-colors"
          title="Attach files"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask your PM coach… (Enter to send, Shift+Enter for newline)"
          rows={1}
          className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 max-h-32 overflow-y-auto"
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          Send
        </button>
      </div>
    </div>
  );
}
