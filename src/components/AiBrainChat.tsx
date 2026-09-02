'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  'What needs my attention today?',
  'Which leads should I follow up with?',
  'Which opportunities are at risk?',
  'Who am I waiting for?',
  "Summarize today's business activity.",
  'Which prospects are most valuable?',
];

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export function AiBrainChat({ initialQuestion }: { initialQuestion?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const askedInitial = useRef(false);

  async function ask(question: string) {
    if (!question.trim() || loading) return;
    setMessages((m) => [...m, { role: 'user', content: question }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: 'assistant', content: data.reply || 'Sorry, I could not process that.' }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: "Revox couldn't complete this request. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialQuestion && !askedInitial.current) {
      askedInitial.current = true;
      ask(initialQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [messages]);

  return (
    <div className="chat-wrap">
      <div className="text-center mb-2">
        <div className="page-title flex items-center justify-center gap-2">
          <Sparkles size={20} strokeWidth={1.7} /> AI Brain
        </div>
        <div className="page-subtitle">Ask Revox anything about your business.</div>
      </div>

      <div ref={threadRef} className="mt-6.5 min-h-[60px] max-h-[55vh] overflow-y-auto">
        {!messages.length && (
          <>
            <div className="empty-state pt-2.5 pb-0">
              <div className="title">Your business brain is ready.</div>
              Ask Revox about your customers, pipeline, emails, or priorities.
            </div>
            <div className="suggestion-grid">
              {SUGGESTIONS.map((s) => (
                <div key={s} className="suggestion-chip" onClick={() => ask(s)}>{s}</div>
              ))}
            </div>
          </>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role === 'user' ? 'user' : ''}`}>
            <div className={`chat-avatar ${m.role === 'user' ? 'me' : 'ai'}`}>{m.role === 'user' ? 'You' : 'R'}</div>
            <div className="bubble">{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-msg">
            <div className="chat-avatar ai">R</div>
            <div className="bubble text-ink-faint">Thinking…</div>
          </div>
        )}
      </div>

      <div className="chat-input-bar">
        <form
          onSubmit={(e) => { e.preventDefault(); ask(input); }}
          className="flex gap-2.5 bg-surface border border-border-strong rounded-full py-1.5 pl-4.5 pr-1.5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Revox…"
            autoComplete="off"
            className="flex-1 border-none outline-none bg-transparent text-[14px]"
          />
          <button type="submit" className="bg-navy text-white border-none w-[38px] h-[38px] rounded-full flex items-center justify-center flex-shrink-0">
            <Send size={16} strokeWidth={1.7} />
          </button>
        </form>
      </div>
    </div>
  );
}
