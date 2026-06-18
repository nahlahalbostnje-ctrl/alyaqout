import { useRef, useState, type KeyboardEvent, useEffect } from 'react';
import api from '../services/axios';

const font = { fontFamily: "'Cairo', sans-serif" };

interface Message {
  role:    'user' | 'assistant';
  content: string;
}

const WELCOME: Message = {
  role:    'assistant',
  content: 'مرحباً! أنا مساعدك الدراسي الذكي 🤖\nاسألني عن أي درس أو مسألة وسأساعدك على الفهم.',
};

export default function ChatbotWidget() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const bottomRef             = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);
    setError(null);

    const history = next.slice(1, -1).map((m) => ({ role: m.role, content: m.content }));

    try {
      const { data } = await api.post('/student/chatbot', { message: text, history });
      setMessages([...next, { role: 'assistant', content: data.reply }]);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      const errMsg = e.response?.data?.message || 'حدث خطأ في الاتصال بالمساعد';
      setError(errMsg);
      setMessages([...next, { role: 'assistant', content: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const reset = () => setMessages([WELCOME]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="المساعد الذكي"
        className="fixed bottom-6 left-40 z-40 w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}
      >
        {open ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          className="fixed bottom-24 left-6 z-50 flex flex-col rounded-3xl shadow-2xl overflow-hidden"
          style={{ width: '340px', height: '480px', background: '#fff', border: '1px solid #ede9fe' }}
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4c1d95)' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg">🤖</div>
              <div>
                <p className="text-white font-bold text-sm" style={font}>المساعد الذكي</p>
                <p className="text-purple-200 text-xs" style={font}>يمنح تلميحات لا إجابات</p>
              </div>
            </div>
            <button onClick={reset}
              title="محادثة جديدة"
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition"
              style={{ fontSize: '14px' }}>
              ↺
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ background: '#f9f8ff' }}>
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              return (
                <div key={i} className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
                  <div className="max-w-[80%]">
                    {!isUser && (
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs mb-1 mr-auto">
                        🤖
                      </div>
                    )}
                    <div
                      className="px-3 py-2 rounded-2xl text-xs"
                      style={{
                        background: isUser ? 'linear-gradient(135deg, #7c3aed, #5b21b6)' : '#fff',
                        color:      isUser ? '#fff' : '#1e293b',
                        border:     isUser ? 'none' : '1px solid #ede9fe',
                        borderTopRightRadius: isUser ? '4px' : '16px',
                        borderTopLeftRadius:  isUser ? '16px' : '4px',
                        lineHeight: 1.7,
                        whiteSpace: 'pre-wrap',
                        ...font,
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-end">
                <div className="bg-white border border-purple-100 px-4 py-2 rounded-2xl">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-400 text-center" style={font}>{error}</p>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 p-3 flex items-end gap-2 bg-white" style={{ borderTop: '1px solid #ede9fe' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="اسأل عن أي درس..."
              rows={1}
              disabled={loading}
              className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-50"
              style={{ ...font, maxHeight: '80px', overflowY: 'auto' }}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = 'auto';
                t.style.height = `${Math.min(t.scrollHeight, 80)}px`;
              }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl transition disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}
            >
              <svg className="w-4 h-4 text-white rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
