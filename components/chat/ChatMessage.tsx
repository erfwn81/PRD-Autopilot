'use client';

import type { ChatMessage as ChatMessageType } from '@/types/agent';

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
          {listItems.map((item, i) => <li key={i} className="text-sm">{item}</li>)}
        </ol>
      );
    } else {
      elements.push(
        <ul key={elements.length} className="list-disc list-inside space-y-0.5 my-1">
          {listItems.map((item, i) => <li key={i} className="text-sm">{item}</li>)}
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
        // Render **bold** inline
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        elements.push(
          <p key={elements.length} className="text-sm leading-relaxed">
            {parts.map((part, i) => {
              const boldMatch = /^\*\*(.+)\*\*$/.exec(part);
              return boldMatch ? <strong key={i}>{boldMatch[1]}</strong> : part;
            })}
          </p>
        );
      }
    }
  });
  flushList();
  return <>{elements}</>;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold mr-2 shrink-0 mt-0.5">
          AI
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-indigo-600 text-white rounded-tr-none'
            : 'bg-gray-100 text-gray-900 rounded-tl-none'
        }`}
      >
        {isUser
          ? <p className="text-sm leading-relaxed">{message.content}</p>
          : renderContent(message.content)
        }
      </div>
    </div>
  );
}
