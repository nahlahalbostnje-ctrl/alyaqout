import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ref, push, onValue } from 'firebase/database';
import { db } from '../services/firebase';
import { useAppSelector } from '../app/hooks';
import StudentLayout from '../components/StudentLayout';

interface Message {
  id:       string;
  userId:   number;
  userName: string;
  text:     string;
  role:     string;
  timestamp: number;
}

const font = { fontFamily: "'Cairo', sans-serif" };

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

export default function StudentStudyRoomPage() {
  const user    = useAppSelector((s) => s.auth.user);
  const roomId  = `room_${user?.id}`;

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText]         = useState('');
  const [sending, setSending]   = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const msgsRef = ref(db, `studyRoom/${roomId}/messages`);
    const unsubscribe = onValue(msgsRef, (snap) => {
      const data = snap.val();
      if (!data) { setMessages([]); return; }
      const list: Message[] = Object.entries(data).map(([id, v]) => {
        const val = v as Omit<Message, 'id'>;
        return { id, ...val };
      });
      list.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(list);
    });
    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending || !user) return;
    setSending(true);
    await push(ref(db, `studyRoom/${roomId}/messages`), {
      userId:    user.id,
      userName:  user.name,
      role:      user.role,
      text:      trimmed,
      timestamp: Date.now(),
    });
    setText('');
    setSending(false);
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <StudentLayout>
      <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)', background: '#f5f4ff' }} dir="rtl">

        {/* Header */}
        <div className="bg-white px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid #ede9fe' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4c1d95)' }}>
              📚
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-base" style={font}>غرفة الواجبات</h2>
              <p className="text-xs text-slate-400" style={font}>اسأل مشرفك عن أي شيء — نرد بأسرع وقت</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-60">
              <p className="text-5xl">💬</p>
              <p className="text-slate-500 font-semibold text-sm" style={font}>لا توجد رسائل بعد</p>
              <p className="text-slate-400 text-xs" style={font}>ابدأ بسؤال مشرفك عن أي واجب أو درس</p>
            </div>
          )}

          {messages.map((msg) => {
            const isMe = msg.userId === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                <div className="max-w-xs lg:max-w-md">
                  {!isMe && (
                    <p className="text-xs font-bold mb-1 px-1" style={{ color: '#7c3aed', ...font }}>
                      {msg.userName}
                    </p>
                  )}
                  <div className="px-4 py-2.5 rounded-2xl text-sm"
                    style={{
                      background: isMe ? 'linear-gradient(135deg, #7c3aed, #5b21b6)' : '#fff',
                      color:      isMe ? '#fff' : '#1e293b',
                      border:     isMe ? 'none' : '1px solid #ede9fe',
                      borderTopRightRadius: isMe ? '4px' : '16px',
                      borderTopLeftRadius:  isMe ? '16px' : '4px',
                    }}>
                    <p style={{ ...font, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                    <p className="text-xs mt-1 text-right" style={{ opacity: 0.6, ...font }}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="bg-white flex-shrink-0 p-4 flex items-end gap-3"
          style={{ borderTop: '1px solid #ede9fe' }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder="اكتب سؤالك هنا... (Enter للإرسال)"
            rows={1}
            className="flex-1 resize-none border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            style={{ ...font, maxHeight: '120px', overflowY: 'auto' }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
            }}
          />
          <button
            onClick={send}
            disabled={sending || !text.trim()}
            className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl transition disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}
          >
            <svg className="w-5 h-5 text-white rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

      </div>
    </StudentLayout>
  );
}
