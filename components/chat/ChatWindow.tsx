'use client';

import { useEffect, useRef } from 'react';
import type { ChatMessage as ChatMessageType } from '@/types/agent';
import ChatMessage from './ChatMessage';

interface ChatWindowProps {
  messages: ChatMessageType[];
  isLoading: boolean;
}

export default function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {messages.length === 0 && !isLoading && (
        <div className="h-full flex flex-col items-center justify-center text-center px-8 py-16">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
            style={{ background: 'rgba(109,94,245,0.12)', border: '1px solid rgba(109,94,245,0.20)' }}
          >
            💬
          </div>
          <p className="text-gray-300 font-semibold mb-1">Ask your PM coach anything</p>
          <p className="text-gray-600 text-sm max-w-sm">
            Get help with PRDs, prioritization, stakeholder communication, roadmaps, or anything product-related.
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}

      {isLoading && (
        <div className="flex justify-start mb-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mr-2 shrink-0 mt-0.5"
            style={{ background: 'rgba(109,94,245,0.20)', color: '#8B7CFF' }}
          >
            AI
          </div>
          <div className="rounded-2xl rounded-tl-none px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex gap-1.5 items-center h-5">
              {[0, 150, 300].map((delay) => (
                <span key={delay} className="w-2 h-2 rounded-full animate-bounce"
                  style={{ background: '#22D3EE', animationDelay: `${delay}ms` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
