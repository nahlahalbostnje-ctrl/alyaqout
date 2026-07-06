import { useEffect, useState, useCallback } from 'react';
import ParentLayout from '../components/ParentLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchParentDashboard } from '../features/parent/parentSlice';
import api from '../services/axios';

const C = {
  gold: '#C59341', goldL: '#D4A65A',
  goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg: 'rgba(197,147,65,0.08)', goldBdr: 'rgba(197,147,65,0.22)',
  bg: '#F5EDD8', card: '#FFFFFF', navy: '#0D1E3A',
  text: '#1B2038', sub: '#6B7280', dim: '#9CA3AF', border: '#EDE3CE',
  shadow: '0 2px 16px rgba(0,0,0,0.06)',
  green: '#10B981', greenBg: 'rgba(16,185,129,0.08)',
  red: '#EF4444', redBg: 'rgba(239,68,68,0.08)',
  blue: '#3B82F6', blueBg: 'rgba(59,130,246,0.08)',
  purple: '#8B5CF6', purpleBg: 'rgba(139,92,246,0.08)',
  amber: '#F59E0B', amberBg: 'rgba(245,158,11,0.08)',
};

const AVATAR_COLORS = ['#C59341', '#3B82F6', '#10B981', '#8B5CF6'];

interface ConversationSummary {
  id: number;
  teacher: string;
  student: string;
  unread_count: number;
  last_message: string | null;
  last_message_at: string | null;
}

interface Message {
  id: number;
  body: string;
  is_mine: boolean;
  sender: string;
  created_at: string;
}

interface TeacherOption { id: number; name: string; }

function PageHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{ width: 4, height: 22, borderRadius: 2, background: C.goldGrad }} />
        <h1 style={{ color: C.text, fontWeight: 900, fontSize: 22, margin: 0 }}>{title}</h1>
      </div>
      <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>{sub}</p>
    </div>
  );
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('');
}

export default function ParentCommunicationPage() {
  const dispatch = useAppDispatch();
  const { children } = useAppSelector((s) => s.parent);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedConv, setSelectedConv] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);

  // New conversation flow
  const [showNewConv, setShowNewConv] = useState(false);
  const [newChildId, setNewChildId] = useState<number | null>(null);
  const [teacherOptions, setTeacherOptions] = useState<TeacherOption[]>([]);
  const [newTeacherId, setNewTeacherId] = useState<number | null>(null);
  const [startBusy, setStartBusy] = useState(false);

  const loadConversations = useCallback(() => {
    setLoadingList(true);
    api.get('/parent/messages')
      .then(({ data }) => {
        const list: ConversationSummary[] = data.data ?? [];
        setConversations(list);
        setSelectedConv((prev) => prev ?? list[0]?.id ?? null);
      })
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    if (children.length === 0) dispatch(fetchParentDashboard());
    loadConversations();
  }, [dispatch, children.length, loadConversations]);

  useEffect(() => {
    if (!selectedConv) { setMessages([]); return; }
    setLoadingThread(true);
    api.get(`/parent/messages/${selectedConv}`)
      .then(({ data }) => setMessages(data.data ?? []))
      .finally(() => setLoadingThread(false));
  }, [selectedConv]);

  const conv = conversations.find(c => c.id === selectedConv) ?? null;

  const sendMessage = async () => {
    if (!input.trim() || !selectedConv || sending) return;
    setSending(true);
    try {
      const { data } = await api.post(`/parent/messages/${selectedConv}`, { body: input.trim() });
      setMessages(prev => [...prev, data.data]);
      setInput('');
      loadConversations();
    } finally {
      setSending(false);
    }
  };

  const openNewConv = () => {
    setShowNewConv(true);
    setNewChildId(children[0]?.id ?? null);
    setTeacherOptions([]);
    setNewTeacherId(null);
  };

  useEffect(() => {
    if (!showNewConv || !newChildId) return;
    api.get(`/parent/children/${newChildId}/teachers`)
      .then(({ data }) => setTeacherOptions(data.data ?? []));
  }, [showNewConv, newChildId]);

  const startConversation = async () => {
    if (!newChildId || !newTeacherId) return;
    setStartBusy(true);
    try {
      const { data } = await api.post('/parent/messages/start', { student_id: newChildId, teacher_id: newTeacherId });
      setShowNewConv(false);
      setSelectedConv(data.data.id);
      loadConversations();
    } finally {
      setStartBusy(false);
    }
  };

  return (
    <ParentLayout>
      <div dir="rtl" style={{ fontFamily: "'Cairo',sans-serif", padding: 24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <PageHeader title="التواصل مع المعلمين" sub="راسل معلمي أبنائك وتابع التواصل المدرسي" />
          <button onClick={openNewConv} style={{
            padding:'10px 18px', borderRadius:12, background:C.goldGrad, border:'none',
            color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer', height:'fit-content',
            boxShadow:'0 4px 14px rgba(197,147,65,0.35)', fontFamily:"'Cairo',sans-serif",
          }}>+ محادثة جديدة</button>
        </div>

        <div style={{
          display: 'flex', gap: 0, height: 'calc(100vh - 220px)',
          background: '#fff', borderRadius: 18,
          boxShadow: C.shadow, border: `1px solid ${C.border}`,
          overflow: 'hidden',
        }}>
          {/* Sidebar — on mobile, hidden once a conversation is open */}
          {(!isMobile || !selectedConv) && (
          <div style={{
            width: isMobile ? '100%' : 320, flexShrink: 0,
            borderLeft: isMobile ? 'none' : `1px solid ${C.border}`,
            display: 'flex', flexDirection: 'column',
            background: '#FAFAF8',
          }}>
            <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>المحادثات</div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loadingList && (
                <p style={{ color: C.dim, fontSize: 13, textAlign: 'center', padding: '30px 0' }}>جارٍ التحميل...</p>
              )}
              {!loadingList && conversations.length === 0 && (
                <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                  <p style={{ color: C.dim, fontSize: 13 }}>لا توجد محادثات بعد</p>
                  <button onClick={openNewConv} style={{ marginTop:10, padding:'8px 16px', borderRadius:10, border:`1px solid ${C.goldBdr}`, background:C.goldBg, color:C.gold, fontWeight:700, fontSize:12.5, cursor:'pointer' }}>
                    ابدأ محادثة مع معلم
                  </button>
                </div>
              )}
              {conversations.map((c, idx) => {
                const isActive = c.id === selectedConv;
                const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedConv(c.id)}
                    style={{
                      padding: '14px 16px', cursor: 'pointer',
                      background: isActive ? C.goldBg : 'transparent',
                      borderRight: isActive ? `3px solid ${C.gold}` : '3px solid transparent',
                      borderBottom: `1px solid ${C.border}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                        background: `linear-gradient(135deg,${color},${color}99)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 900, fontSize: 13,
                      }}>{initials(c.teacher)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? C.gold : C.text }}>{c.teacher}</span>
                        </div>
                        <div style={{ marginBottom: 4 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                            background: C.goldBg, color: C.gold,
                          }}>بخصوص {c.student}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{
                            fontSize: 11, color: C.dim,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150,
                          }}>{c.last_message ?? 'لا توجد رسائل بعد'}</span>
                          {c.unread_count > 0 && (
                            <span style={{
                              background: C.gold, color: '#fff',
                              fontSize: 10, fontWeight: 800,
                              width: 18, height: 18, borderRadius: '50%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}>{c.unread_count}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          )}

          {/* Chat Panel — on mobile, only shown once a conversation is selected */}
          {(!isMobile || selectedConv) && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {!conv ? (
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:C.dim, fontSize:14 }}>
                اختر محادثة أو ابدأ محادثة جديدة
              </div>
            ) : (
              <>
                <div style={{
                  padding: '14px 20px', borderBottom: `1px solid ${C.border}`,
                  display: 'flex', alignItems: 'center', gap: 12, background: '#fff',
                }}>
                  {isMobile && (
                    <button onClick={() => setSelectedConv(null)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:C.text, padding:0, flexShrink:0 }}>→</button>
                  )}
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: `linear-gradient(135deg,${C.gold},${C.goldL})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 900, fontSize: 14,
                  }}>{initials(conv.teacher)}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{conv.teacher}</div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                      background: C.goldBg, color: C.gold,
                    }}>بخصوص {conv.student}</span>
                  </div>
                </div>

                <div style={{
                  flex: 1, overflowY: 'auto', padding: '16px 20px',
                  display: 'flex', flexDirection: 'column', gap: 12,
                  background: '#FAFAF8',
                }}>
                  {loadingThread && <p style={{ color: C.dim, fontSize: 13, textAlign: 'center' }}>جارٍ التحميل...</p>}
                  {!loadingThread && messages.map((msg) => (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: msg.is_mine ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '70%' }}>
                        <div style={{
                          padding: '10px 14px', borderRadius: msg.is_mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: msg.is_mine ? C.goldGrad : '#fff',
                          color: msg.is_mine ? '#fff' : C.text,
                          fontSize: 13, lineHeight: 1.6,
                          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                          border: msg.is_mine ? 'none' : `1px solid ${C.border}`,
                        }}>{msg.body}</div>
                        <div style={{ fontSize: 10, color: C.dim, marginTop: 4, textAlign: msg.is_mine ? 'right' : 'left' }}>{msg.created_at}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  padding: '12px 16px', borderTop: `1px solid ${C.border}`,
                  display: 'flex', gap: 10, background: '#fff',
                }}>
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    rows={1}
                    placeholder="اكتب رسالتك هنا... (Enter للإرسال)"
                    style={{
                      flex: 1, padding: '10px 14px', borderRadius: 12,
                      border: `1px solid ${C.border}`, fontSize: 13,
                      fontFamily: "'Cairo',sans-serif", color: C.text,
                      resize: 'none', outline: 'none',
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending}
                    style={{
                      padding: '10px 20px', borderRadius: 12, border: 'none',
                      background: C.goldGrad, color: '#fff', fontWeight: 800, fontSize: 13,
                      cursor: sending ? 'default' : 'pointer', fontFamily: "'Cairo',sans-serif",
                      boxShadow: '0 4px 12px rgba(197,147,65,0.3)',
                      flexShrink: 0, opacity: sending ? 0.6 : 1,
                    }}
                  >
                    {sending ? '...' : 'إرسال ➤'}
                  </button>
                </div>
              </>
            )}
          </div>
          )}
        </div>
      </div>

      {/* New conversation modal */}
      {showNewConv && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={() => setShowNewConv(false)}>
          <div dir="rtl" style={{ background:'#fff', borderRadius:20, padding:26, width:420, maxWidth:'92vw', fontFamily:"'Cairo',sans-serif" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color:C.text, fontWeight:900, fontSize:17, marginBottom:18 }}>محادثة جديدة مع معلم</h3>

            <label style={{ display:'block', fontSize:12, fontWeight:700, color:C.sub, marginBottom:6 }}>الابن</label>
            <select value={newChildId ?? ''} onChange={e => { setNewChildId(Number(e.target.value)); setNewTeacherId(null); }}
              style={{ width:'100%', padding:'10px 14px', borderRadius:12, border:`1.5px solid ${C.border}`, fontSize:13, marginBottom:16, fontFamily:"'Cairo',sans-serif" }}>
              {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <label style={{ display:'block', fontSize:12, fontWeight:700, color:C.sub, marginBottom:6 }}>المعلم</label>
            <select value={newTeacherId ?? ''} onChange={e => setNewTeacherId(Number(e.target.value))}
              style={{ width:'100%', padding:'10px 14px', borderRadius:12, border:`1.5px solid ${C.border}`, fontSize:13, marginBottom:22, fontFamily:"'Cairo',sans-serif" }}>
              <option value="">اختر معلماً...</option>
              {teacherOptions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={startConversation} disabled={!newTeacherId || startBusy} style={{
                flex:1, padding:'11px', borderRadius:12, background:C.goldGrad, border:'none',
                color:'#fff', fontWeight:800, fontSize:13, cursor: (!newTeacherId||startBusy) ? 'default':'pointer',
                opacity: (!newTeacherId||startBusy) ? 0.6 : 1, fontFamily:"'Cairo',sans-serif",
              }}>{startBusy ? '...' : 'بدء المحادثة'}</button>
              <button onClick={() => setShowNewConv(false)} style={{
                flex:1, padding:'11px', borderRadius:12, border:`1px solid ${C.border}`, background:'#fff',
                color:C.sub, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:"'Cairo',sans-serif",
              }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </ParentLayout>
  );
}
