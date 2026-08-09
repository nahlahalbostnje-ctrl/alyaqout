import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import { C } from '../theme/palette';

const font = { fontFamily: "'Cairo', sans-serif" } as const;

type RecipientKind = 'teacher' | 'admin';

type Thread = {
  id: string;
  kind: RecipientKind;
  name: string;
  preview: string;
  at: string;
};

/**
 * رسائل المنصة فقط — المستلم: معلم أو إدارة.
 * لا واتساب ولا قنوات خارجية.
 */
export default function StudentMessagesPage() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [recipient, setRecipient] = useState<RecipientKind | null>(null);
  const [draft, setDraft] = useState('');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const active = threads.find((t) => t.id === activeId) ?? null;

  const openCompose = () => {
    setComposeOpen(true);
    setRecipient(null);
    setDraft('');
    setHint(null);
  };

  const sendDraft = () => {
    if (!recipient || !draft.trim()) {
      setHint('اختر المستلم واكتب الرسالة');
      return;
    }
    const now = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const name = recipient === 'teacher' ? 'المعلم' : 'الإدارة';
    const id = `${recipient}-${Date.now()}`;
    const thread: Thread = {
      id,
      kind: recipient,
      name,
      preview: draft.trim().slice(0, 80),
      at: now,
    };
    setThreads((prev) => [thread, ...prev.filter((t) => t.kind !== recipient)]);
    setActiveId(id);
    setComposeOpen(false);
    setDraft('');
    setRecipient(null);
    setHint('تم حفظ الرسالة في صندوق المنصة (عرض محلي حتى ربط الخادم)');
  };

  return (
    <StudentLayout>
      <div style={{ display: 'flex', flexDirection: 'column', ...font, direction: 'rtl', minHeight: '100%' }}>
        <div style={{
          background: 'linear-gradient(135deg,#0B5ED7 0%,#1E88E5 100%)',
          padding: '20px 20px 24px',
        }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => navigate('/student/dashboard')}
              style={{
                width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)',
                border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18, flexShrink: 0,
              }}
            >
              ←
            </button>
            <div style={{ flex: 1, minWidth: 140 }}>
              <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 20, margin: 0, lineHeight: 1.2 }}>الرسائل</h1>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, margin: '4px 0 0' }}>
                رسائل المنصة فقط — إلى المعلم أو الإدارة
              </p>
            </div>
            <button
              type="button"
              onClick={openCompose}
              style={{
                padding: '10px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: '#fff', color: '#0B5ED7', fontWeight: 800, fontSize: 13, ...font,
              }}
            >
              رسالة جديدة
            </button>
          </div>
        </div>

        {hint && (
          <div style={{
            maxWidth: 900, margin: '12px auto 0', width: '100%', padding: '0 16px', boxSizing: 'border-box',
          }}>
            <p style={{
              margin: 0, padding: '10px 14px', borderRadius: 12, background: 'rgba(11,94,215,0.08)',
              color: C.text, fontSize: 12.5, fontWeight: 600,
            }}>
              {hint}
            </p>
          </div>
        )}

        {composeOpen && (
          <div style={{
            maxWidth: 900, margin: '14px auto 0', width: '100%', padding: '0 16px', boxSizing: 'border-box',
          }}>
            <div style={{
              background: C.card, borderRadius: 16, border: `1px solid ${C.border}`,
              boxShadow: C.shadow, padding: 16,
            }}>
              <p style={{ margin: '0 0 12px', color: C.text, fontWeight: 800, fontSize: 14 }}>إلى من ترسل؟</p>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {([
                  { kind: 'teacher' as const, title: 'المعلم', desc: 'معلم مادتك أو دورتك' },
                  { kind: 'admin' as const, title: 'الإدارة', desc: 'إدارة المنصة / الفرع' },
                ]).map((opt) => (
                  <button
                    key={opt.kind}
                    type="button"
                    onClick={() => setRecipient(opt.kind)}
                    style={{
                      textAlign: 'right', padding: '14px', borderRadius: 14, cursor: 'pointer', ...font,
                      border: recipient === opt.kind ? `2px solid ${C.primary}` : `1px solid ${C.border}`,
                      background: recipient === opt.kind ? C.goldBg : C.bg,
                    }}
                  >
                    <p style={{ margin: 0, color: C.text, fontWeight: 800, fontSize: 14 }}>{opt.title}</p>
                    <p style={{ margin: '4px 0 0', color: C.sub, fontSize: 12 }}>{opt.desc}</p>
                  </button>
                ))}
              </div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="اكتب رسالتك هنا… (داخل المنصة فقط)"
                rows={4}
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 12,
                  border: `1px solid ${C.border}`, background: C.bg, fontSize: 13, outline: 'none',
                  resize: 'vertical', ...font, color: C.text,
                }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={sendDraft}
                  style={{
                    padding: '10px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: C.goldGrad, color: '#1B2038', fontWeight: 800, fontSize: 13, ...font,
                  }}
                >
                  إرسال عبر المنصة
                </button>
                <button
                  type="button"
                  onClick={() => { setComposeOpen(false); setHint(null); }}
                  style={{
                    padding: '10px 18px', borderRadius: 12, border: `1px solid ${C.border}`,
                    background: C.card, color: C.sub, fontWeight: 700, fontSize: 13, cursor: 'pointer', ...font,
                  }}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{
          display: 'flex', flex: 1, maxWidth: 900, margin: '14px auto 24px', width: '100%',
          minHeight: 360, borderRadius: 16, overflow: 'hidden',
          border: `1px solid ${C.border}`, background: C.card,
        }}>
          {(!isMobile || !activeId) && (
            <div style={{
              width: isMobile ? '100%' : 280, borderLeft: isMobile ? 'none' : `1px solid ${C.border}`,
              overflowY: 'auto', flexShrink: 0,
            }}>
              {threads.length === 0 ? (
                <div style={{ padding: '36px 16px', textAlign: 'center' }}>
                  <p style={{ color: C.sub, fontSize: 13, fontWeight: 600, margin: 0 }}>لا محادثات بعد</p>
                  <p style={{ color: C.dim, fontSize: 12, margin: '8px 0 0' }}>
                    اضغط «رسالة جديدة» واختر المعلم أو الإدارة
                  </p>
                </div>
              ) : (
                threads.map((conv) => (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setActiveId(conv.id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '14px',
                      cursor: 'pointer', border: 'none', borderBottom: `1px solid ${C.border}`,
                      background: activeId === conv.id ? C.goldBg : 'transparent',
                      textAlign: 'right', ...font,
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', background: C.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                    }}>
                      {conv.kind === 'teacher' ? '👨‍🏫' : '🏛️'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, color: C.text, fontWeight: 700, fontSize: 13 }}>{conv.name}</p>
                      <p style={{
                        margin: '2px 0 0', color: C.sub, fontSize: 11,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {conv.preview}
                      </p>
                    </div>
                    <span style={{ color: C.dim, fontSize: 10, flexShrink: 0 }}>{conv.at}</span>
                  </button>
                ))
              )}
            </div>
          )}

          {(!isMobile || activeId) && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.bg, minWidth: 0 }}>
              {!active ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 }}>
                  <p style={{ margin: 0, color: C.sub, fontSize: 14, fontWeight: 600 }}>اختر محادثة أو ابدأ رسالة جديدة</p>
                  <p style={{ margin: 0, color: C.dim, fontSize: 12 }}>المستلم المتاح: معلم أو إدارة — بدون واتساب</p>
                </div>
              ) : (
                <>
                  <div style={{
                    padding: '12px 16px', background: C.card, borderBottom: `1px solid ${C.border}`,
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    {isMobile && (
                      <button
                        type="button"
                        onClick={() => setActiveId(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: C.text }}
                      >
                        →
                      </button>
                    )}
                    <div>
                      <p style={{ margin: 0, color: C.text, fontWeight: 800, fontSize: 14 }}>{active.name}</p>
                      <p style={{ margin: '2px 0 0', color: C.sub, fontSize: 11 }}>محادثة داخل المنصة</p>
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: 16 }}>
                    <div style={{
                      maxWidth: '85%', marginInlineStart: 'auto', padding: '12px 14px', borderRadius: 14,
                      background: C.goldBg, border: `1px solid ${C.goldBdr}`,
                    }}>
                      <p style={{ margin: 0, color: C.text, fontSize: 13, lineHeight: 1.6 }}>{active.preview}</p>
                      <p style={{ margin: '6px 0 0', color: C.dim, fontSize: 10 }}>{active.at}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
