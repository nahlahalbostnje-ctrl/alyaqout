import { useState } from 'react';
import ParentLayout from '../components/ParentLayout';

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

const CONVERSATIONS = [
  { id: 1, teacher: 'أ. خالد السيد', subject: 'الرياضيات', avatar: 'خس', lastMsg: 'تحسّن محمد كثيراً هذا الأسبوع', time: 'منذ 10 دقائق', unread: 2, online: true, color: '#C59341' },
  { id: 2, teacher: 'أ. نور القاسم', subject: 'اللغة الإنجليزية', avatar: 'نق', lastMsg: 'يرجى مراجعة الواجب المنزلي', time: 'منذ ساعة', unread: 0, online: false, color: '#3B82F6' },
  { id: 3, teacher: 'أ. سارة الحربي', subject: 'العلوم', avatar: 'سح', lastMsg: 'نتيجة الاختبار ممتازة!', time: 'أمس', unread: 1, online: true, color: '#10B981' },
  { id: 4, teacher: 'أ. محمد الغامدي', subject: 'اللغة العربية', avatar: 'مغ', lastMsg: 'تذكير بموعد التسليم غداً', time: 'يوم الإثنين', unread: 0, online: false, color: '#8B5CF6' },
];

type Message = { from: 'teacher' | 'parent'; text: string; time: string };

const MESSAGES: Record<number, Message[]> = {
  1: [
    { from: 'teacher', text: 'مرحباً، أردت إعلامكم أن محمد تحسّن كثيراً في الرياضيات هذا الأسبوع.', time: '10:30 ص' },
    { from: 'parent', text: 'شكراً جزيلاً أستاذ خالد! سنواصل التشجيع في المنزل.', time: '10:45 ص' },
    { from: 'teacher', text: 'رائع! يرجى الاهتمام بالمسائل من الصفحة 45 إلى 50 هذا الأسبوع.', time: '11:00 ص' },
  ],
  2: [
    { from: 'teacher', text: 'يرجى مراجعة الواجب المنزلي لمادة الإنجليزي وتسليمه قبل نهاية الأسبوع.', time: 'منذ ساعة' },
  ],
  3: [
    { from: 'teacher', text: 'أحسنتم! نتيجة الاختبار كانت ممتازة. استمروا بهذا الأداء الرائع.', time: 'أمس 2:15 م' },
    { from: 'parent', text: 'الحمد لله، شكراً أستاذة سارة على اهتمامكم.', time: 'أمس 3:00 م' },
  ],
  4: [
    { from: 'teacher', text: 'تذكير: موعد تسليم المشروع الأدبي هو غداً. يرجى التأكد من استعداد الطالب.', time: 'الإثنين 9:00 ص' },
  ],
};

export default function ParentCommunicationPage() {
  const [selectedConv, setSelectedConv] = useState(1);
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<Record<number, Message[]>>(MESSAGES);

  const conv = CONVERSATIONS.find(c => c.id === selectedConv)!;
  const messages = localMessages[selectedConv] || [];

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = { from: 'parent', text: input.trim(), time: 'الآن' };
    setLocalMessages(prev => ({
      ...prev,
      [selectedConv]: [...(prev[selectedConv] || []), newMsg],
    }));
    setInput('');
  };

  return (
    <ParentLayout>
      <div dir="rtl" style={{ fontFamily: "'Cairo',sans-serif", padding: 24 }}>
        <PageHeader title="التواصل مع المعلمين" sub="راسل معلمي أبنائك وتابع التواصل المدرسي" />

        <div style={{
          display: 'flex', gap: 0, height: 'calc(100vh - 180px)',
          background: '#fff', borderRadius: 18,
          boxShadow: C.shadow, border: `1px solid ${C.border}`,
          overflow: 'hidden',
        }}>
          {/* Sidebar */}
          <div style={{
            width: 320, flexShrink: 0,
            borderLeft: `1px solid ${C.border}`,
            display: 'flex', flexDirection: 'column',
            background: '#FAFAF8',
          }}>
            <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>المحادثات</div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {CONVERSATIONS.map(conv => {
                const isActive = conv.id === selectedConv;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConv(conv.id)}
                    style={{
                      padding: '14px 16px', cursor: 'pointer',
                      background: isActive ? C.goldBg : 'transparent',
                      borderRight: isActive ? `3px solid ${C.gold}` : '3px solid transparent',
                      borderBottom: `1px solid ${C.border}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      {/* Avatar */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: '50%',
                          background: `linear-gradient(135deg,${conv.color},${conv.color}99)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 900, fontSize: 13,
                        }}>{conv.avatar}</div>
                        {conv.online && (
                          <div style={{
                            position: 'absolute', bottom: 1, left: 1,
                            width: 10, height: 10, borderRadius: '50%',
                            background: C.green, border: '2px solid #FAFAF8',
                          }} />
                        )}
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? C.gold : C.text }}>{conv.teacher}</span>
                          <span style={{ fontSize: 10, color: C.dim }}>{conv.time}</span>
                        </div>
                        <div style={{ marginBottom: 4 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                            background: C.goldBg, color: C.gold,
                          }}>{conv.subject}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{
                            fontSize: 11, color: C.dim,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150,
                          }}>{conv.lastMsg}</span>
                          {conv.unread > 0 && (
                            <span style={{
                              background: C.gold, color: '#fff',
                              fontSize: 10, fontWeight: 800,
                              width: 18, height: 18, borderRadius: '50%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}>{conv.unread}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat Panel */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Chat Header */}
            <div style={{
              padding: '14px 20px', borderBottom: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', gap: 12, background: '#fff',
            }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: `linear-gradient(135deg,${conv.color},${conv.color}99)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 900, fontSize: 14,
                }}>{conv.avatar}</div>
                {conv.online && (
                  <div style={{
                    position: 'absolute', bottom: 1, left: 1,
                    width: 11, height: 11, borderRadius: '50%',
                    background: C.green, border: '2px solid #fff',
                  }} />
                )}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{conv.teacher}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: C.goldBg, color: C.gold,
                  }}>{conv.subject}</span>
                  <span style={{
                    fontSize: 11, color: conv.online ? C.green : C.dim,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <span style={{
                      display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                      background: conv.online ? C.green : C.dim,
                    }} />
                    {conv.online ? 'متصل الآن' : 'غير متصل'}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '16px 20px',
              display: 'flex', flexDirection: 'column', gap: 12,
              background: '#FAFAF8',
            }}>
              {messages.map((msg, i) => {
                const isParent = msg.from === 'parent';
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: isParent ? 'flex-start' : 'flex-end',
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                    }}>
                      <div style={{
                        padding: '10px 14px', borderRadius: isParent ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                        background: isParent ? C.goldGrad : '#fff',
                        color: isParent ? '#fff' : C.text,
                        fontSize: 13, lineHeight: 1.6,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                        border: isParent ? 'none' : `1px solid ${C.border}`,
                      }}>{msg.text}</div>
                      <div style={{
                        fontSize: 10, color: C.dim, marginTop: 4,
                        textAlign: isParent ? 'left' : 'right',
                      }}>{msg.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
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
                style={{
                  padding: '10px 20px', borderRadius: 12, border: 'none',
                  background: C.goldGrad, color: '#fff', fontWeight: 800, fontSize: 13,
                  cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
                  boxShadow: '0 4px 12px rgba(197,147,65,0.3)',
                  flexShrink: 0,
                }}
              >
                إرسال ➤
              </button>
            </div>
          </div>
        </div>
      </div>
    </ParentLayout>
  );
}
