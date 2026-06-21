import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ref, push, onValue } from 'firebase/database';
import { db } from '../services/firebase';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchSupervisedStudents } from '../features/supervisor/supervisorSlice';
import type { SupervisedStudent } from '../features/supervisor/supervisorSlice';
import SupervisorLayout from '../components/SupervisorLayout';

const DK = {
  card:   { background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  gold:   '#C9952A',
  dimTxt: '#9CA3AF',
};

interface Message {
  id:        string;
  userId:    number;
  userName:  string;
  role:      string;
  text:      string;
  timestamp: number;
}

const font = { fontFamily: "'Cairo', sans-serif" };

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

function ChatPanel({ student, supervisorUser, onClose }: {
  student: SupervisedStudent;
  supervisorUser: { id: number; name: string; role: string } | null;
  onClose: () => void;
}) {
  const roomId = `room_${student.id}`;
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
    if (!trimmed || sending || !supervisorUser) return;
    setSending(true);
    await push(ref(db, `studyRoom/${roomId}/messages`), {
      userId: supervisorUser.id, userName: supervisorUser.name,
      role: supervisorUser.role, text: trimmed, timestamp: Date.now(),
    });
    setText(''); setSending(false);
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(27,32,56,0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-lg flex flex-col rounded-3xl"
        style={{ height: '75vh', background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }} dir="rtl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid #EDE3CE' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(201,149,42,0.1)', border: '1px solid rgba(201,149,42,0.2)' }}>
              <span className="font-black text-sm" style={{ color: DK.gold, ...font }}>
                {student.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-bold text-sm" style={{ ...font, color: '#1B2038' }}>{student.name}</p>
              <p className="text-xs" style={{ color: DK.dimTxt, ...font }}>غرفة الواجبات</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition text-sm"
            style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #EDE3CE' }}>
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#F5EDD8' }}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
              <p className="text-4xl mb-2">💬</p>
              <p className="text-sm" style={{ color: '#6B7280', ...font }}>لا توجد رسائل من {student.name} بعد</p>
            </div>
          )}

          {messages.map((msg) => {
            const isStudent = msg.userId === student.id;
            return (
              <div key={msg.id} className={`flex ${isStudent ? 'justify-start' : 'justify-end'}`}>
                <div className="max-w-xs">
                  {!isStudent && (
                    <p className="text-xs font-bold mb-1 px-1 text-left" style={{ color: DK.gold, ...font }}>
                      {msg.userName} (أنت)
                    </p>
                  )}
                  <div className="px-4 py-2.5 rounded-2xl text-sm"
                    style={{
                      background: isStudent ? '#FFFFFF' : 'linear-gradient(135deg, #C9952A, #DDAD50)',
                      color:      isStudent ? '#1B2038' : '#fff',
                      border:     isStudent ? '1px solid #EDE3CE' : 'none',
                      borderTopRightRadius: isStudent ? '16px' : '4px',
                      borderTopLeftRadius:  isStudent ? '4px'  : '16px',
                    }}>
                    <p style={{ ...font, lineHeight: 1.6 }}>{msg.text}</p>
                    <p className="text-xs mt-1" style={{ opacity: 0.6, ...font }}>
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
        <div className="flex-shrink-0 p-4 flex items-end gap-3"
          style={{ borderTop: '1px solid #EDE3CE', background: '#FFFFFF' }}>
          <textarea value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey} placeholder={`رد على ${student.name}...`} rows={1}
            className="flex-1 resize-none rounded-2xl px-4 py-3 text-sm focus:outline-none"
            style={{
              background: '#F9FAFB',
              border: '1px solid #EDE3CE',
              color: '#1B2038', maxHeight: '100px', overflowY: 'auto', ...font,
            }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = `${Math.min(t.scrollHeight, 100)}px`;
            }} />
          <button onClick={send} disabled={sending || !text.trim()}
            className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl transition disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)' }}>
            <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              style={{ color: '#fff' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SupervisorStudyRoomPage() {
  const dispatch = useAppDispatch();
  const user     = useAppSelector((s) => s.auth.user);
  const { students, loading } = useAppSelector((s) => s.supervisor);
  const [selected, setSelected] = useState<SupervisedStudent | null>(null);

  useEffect(() => { dispatch(fetchSupervisedStudents()); }, [dispatch]);

  return (
    <SupervisorLayout>
      <div className="p-6" dir="rtl" style={{ ...font, background: '#F5EDD8', minHeight: '100%' }}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #C9952A, #DDAD50)' }} />
            <h2 className="text-xl font-bold" style={{ color: '#1B2038' }}>غرف الواجبات</h2>
          </div>
          <p className="text-xs mr-4" style={{ color: DK.dimTxt }}>افتح غرفة أي طالب للرد على أسئلته</p>
        </div>

        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid rgba(201,149,42,0.15)', borderTopColor: '#C9952A' }} />
          </div>
        )}

        {!loading && students.length === 0 && (
          <div className="text-center py-16 rounded-2xl" style={DK.card}>
            <p className="text-4xl mb-3">👥</p>
            <p className="font-semibold" style={{ color: '#1B2038' }}>لا يوجد طلاب معيّنون لك بعد</p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <button key={student.id} onClick={() => setSelected(student)}
              className="text-right p-4 rounded-2xl transition-all"
              style={{ background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
              onMouseEnter={(e) => (e.currentTarget.style.border = '1px solid rgba(201,149,42,0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.border = '1px solid #EDE3CE')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(201,149,42,0.08)', border: '1px solid rgba(201,149,42,0.2)' }}>
                  <span className="font-black" style={{ color: DK.gold }}>{student.name.charAt(0)}</span>
                </div>
                <div className="flex-1 text-right">
                  <p className="font-bold text-sm" style={{ color: '#1B2038' }}>{student.name}</p>
                  {student.grade && <p className="text-xs" style={{ color: DK.dimTxt }}>{student.grade}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={student.is_active
                    ? { background: 'rgba(16,185,129,0.08)', color: '#10B981' }
                    : { background: '#F9FAFB', color: DK.dimTxt, border: '1px solid #EDE3CE' }}>
                  {student.is_active ? 'نشط' : 'غير نشط'}
                </span>
                <span className="text-xs font-semibold" style={{ color: DK.gold }}>فتح الغرفة ←</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <ChatPanel student={selected} supervisorUser={user} onClose={() => setSelected(null)} />
      )}
    </SupervisorLayout>
  );
}
