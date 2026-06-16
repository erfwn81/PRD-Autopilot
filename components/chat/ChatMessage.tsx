'use client';

import { useState, useEffect } from 'react';
import type { ChatMessage as ChatMessageType, ChatAttachment } from '@/types/agent';

interface ChatMessageProps {
  message: ChatMessageType;
}

function renderContent(text: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (listItems.length === 0) return;
    if (listType === 'ol') {
      elements.push(
        <ol key={elements.length} className="list-decimal list-inside space-y-0.5 my-1">
          {listItems.map((item, i) => <li key={i} className="text-sm text-gray-300">{item}</li>)}
        </ol>
      );
    } else {
      elements.push(
        <ul key={elements.length} className="list-disc list-inside space-y-0.5 my-1">
          {listItems.map((item, i) => <li key={i} className="text-sm text-gray-300">{item}</li>)}
        </ul>
      );
    }
    listItems = [];
    listType = null;
  };

  lines.forEach((line, idx) => {
    const bulletMatch = /^[-*]\s+(.+)/.exec(line);
    const numberedMatch = /^\d+\.\s+(.+)/.exec(line);

    if (bulletMatch) {
      if (listType === 'ol') flushList();
      listType = 'ul';
      listItems.push(bulletMatch[1]);
    } else if (numberedMatch) {
      if (listType === 'ul') flushList();
      listType = 'ol';
      listItems.push(numberedMatch[1]);
    } else {
      flushList();
      if (line.trim() === '') {
        if (idx > 0) elements.push(<br key={elements.length} />);
      } else {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        elements.push(
          <p key={elements.length} className="text-sm leading-relaxed text-gray-300">
            {parts.map((part, i) => {
              const boldMatch = /^\*\*(.+)\*\*$/.exec(part);
              return boldMatch ? <strong key={i} className="text-white font-semibold">{boldMatch[1]}</strong> : part;
            })}
          </p>
        );
      }
    }
  });
  flushList();
  return <>{elements}</>;
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];

function AttachmentCard({ attachment }: { attachment: ChatAttachment }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const isImage = IMAGE_TYPES.includes(attachment.mime_type);

  useEffect(() => {
    if (!isImage) return;
    fetch(`/api/chat/attachments/${attachment.id}`)
      .then(r => r.json())
      .then(d => { if (d.url) setSignedUrl(d.url); })
      .catch(() => {});
  }, [attachment.id, isImage]);

  const handleDownload = async () => {
    const res = await fetch(`/api/chat/attachments/${attachment.id}`);
    const data = await res.json();
    if (data.url) window.open(data.url, '_blank');
  };

  return (
    <div className="mt-2 rounded-xl overflow-hidden max-w-xs"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}>
      {isImage && signedUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={signedUrl} alt={attachment.file_name}
          className="w-full max-h-48 object-cover"
          onError={() => setSignedUrl(null)} />
      )}
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="text-gray-500 shrink-0">{isImage ? '🖼' : '📎'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-300 truncate">{attachment.file_name}</p>
          <p className="text-xs text-gray-600">{formatBytes(attachment.size_bytes)}</p>
        </div>
        <button onClick={handleDownload}
          className="text-xs text-primary hover:text-primary-hover px-2 py-1 rounded transition-colors shrink-0">
          Download
        </button>
      </div>
    </div>
  );
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const attachments = message.attachments ?? [];

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mr-2 shrink-0 mt-0.5"
          style={{ background: 'rgba(109,94,245,0.20)', color: '#8B7CFF' }}
        >
          AI
        </div>
      )}
      <div className={`max-w-[80%] ${isUser ? '' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${isUser ? 'rounded-tr-none' : 'rounded-tl-none'}`}
          style={isUser ? {
            background: 'linear-gradient(135deg,#6D5EF5,#8B7CFF)',
          } : {
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {isUser
            ? <p className="text-sm leading-relaxed text-white">{message.content}</p>
            : renderContent(message.content)
          }
        </div>
        {attachments.length > 0 && (
          <div className={`mt-1 ${isUser ? 'flex flex-col items-end' : ''}`}>
            {attachments.map(att => (
              <AttachmentCard key={att.id} attachment={att} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
