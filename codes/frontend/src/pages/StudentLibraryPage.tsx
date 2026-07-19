import { useCallback, useEffect, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import api from '../services/axios';

type LibType = 'book' | 'dedication' | 'past_exam' | 'summary';

interface LibraryItem {
  id: number;
  type: LibType;
  title: string;
  description: string | null;
  file_url: string | null;
  cover_url: string | null;
  author: string | null;
  grade: { id: number; name: string } | null;
}

const TYPE_LABELS: Record<LibType, { label: string; icon: string; color: string }> = {
  book: { label: 'كتب', icon: '📚', color: '#C9952A' },
  dedication: { label: 'إهداءات', icon: '🎁', color: '#7C3AED' },
  past_exam: { label: 'أسئلة سنوات', icon: '📝', color: '#2563EB' },
  summary: { label: 'ملخصات', icon: '📄', color: '#16A34A' },
};

const C = {
  card: '#FFFFFF', gold: '#C9952A', goldGrad: 'linear-gradient(135deg,#C9952A,#DDAD50)',
  text: '#1B2038', sub: '#6B7280', border: 'rgba(0,0,0,0.07)', shadow: '0 2px 14px rgba(0,0,0,0.07)',
};
const font = { fontFamily: "'Cairo', sans-serif" };

export default function StudentLibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [tab, setTab] = useState<'' | LibType>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/student/library', {
        params: tab ? { type: tab } : undefined,
      });
      setItems(data.items ?? []);
    } catch {
      setError('تعذّر تحميل المكتبة');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { void load(); }, [load]);

  const displayItems = items;

  return (
    <StudentLayout>
      <div style={{ ...font, direction: 'rtl' }}>
        <div style={{
          background: 'linear-gradient(135deg,#0D1535 0%,#1B2038 70%)',
          padding: '28px 24px 32px',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 600, margin: '0 0 4px' }}>موارد تعليمية</p>
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 22, margin: 0 }}>مكتبة الياقوت</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: '8px 0 0', maxWidth: 420 }}>
            كتب، أسئلة سنوات سابقة، ملخصات، وإهداءات من معلميك — حسب دولتك وصفّك
          </p>
        </div>

        <div style={{ padding: '20px 20px 40px' }}>
          <div style={{
            display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap',
            background: C.card, padding: 5, borderRadius: 12, border: `1px solid ${C.border}`,
            width: 'fit-content',
          }}>
            <button
              onClick={() => setTab('')}
              style={{
                padding: '8px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700, ...font,
                background: tab === '' ? C.goldGrad : 'transparent',
                color: tab === '' ? '#1B2038' : C.sub,
              }}
            >
              الكل
            </button>
            {(Object.keys(TYPE_LABELS) as LibType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '8px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 700, ...font,
                  background: tab === t ? C.goldGrad : 'transparent',
                  color: tab === t ? '#1B2038' : C.sub,
                }}
              >
                {TYPE_LABELS[t].icon} {TYPE_LABELS[t].label}
              </button>
            ))}
          </div>

          {error && (
            <div style={{
              marginBottom: 12, padding: '10px 14px', borderRadius: 12,
              background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontSize: 13,
            }}>{error}</div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{
                width: 36, height: 36, margin: '0 auto', borderRadius: '50%',
                border: '3px solid rgba(201,149,42,0.2)', borderTopColor: C.gold,
                animation: 'spin 0.8s linear infinite',
              }} />
            </div>
          ) : displayItems.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: 48, background: C.card, borderRadius: 18,
              boxShadow: C.shadow, border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📚</div>
              <p style={{ fontWeight: 800, fontSize: 15, color: C.text, margin: '0 0 6px' }}>لا توجد مواد في المكتبة</p>
              <p style={{ fontSize: 13, color: C.sub, margin: 0 }}>
                يضيفها أدمن بلدك من لوحة الإدارة — ستظهر هنا تلقائياً
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 14,
            }}>
              {displayItems.map((item) => {
                const meta = TYPE_LABELS[item.type];
                return (
                  <div key={item.id} style={{
                    background: C.card, borderRadius: 16, overflow: 'hidden',
                    boxShadow: C.shadow, border: `1px solid ${C.border}`,
                    display: 'flex', flexDirection: 'column',
                  }}>
                    <div style={{
                      height: 120, background: item.cover_url
                        ? `center/cover url(${item.cover_url})`
                        : `linear-gradient(135deg, ${meta.color}22, ${meta.color}08)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 40,
                    }}>
                      {!item.cover_url && meta.icon}
                    </div>
                    <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <span style={{
                        alignSelf: 'flex-start', fontSize: 10, fontWeight: 700,
                        padding: '2px 8px', borderRadius: 20, marginBottom: 8,
                        background: `${meta.color}18`, color: meta.color,
                      }}>{meta.label}</span>
                      <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 800, color: C.text }}>
                        {item.title}
                      </h3>
                      {item.author && (
                        <p style={{ margin: '0 0 6px', fontSize: 12, color: C.sub }}>{item.author}</p>
                      )}
                      {item.description && (
                        <p style={{
                          margin: '0 0 10px', fontSize: 12, color: C.sub, lineHeight: 1.5,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>{item.description}</p>
                      )}
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, color: C.sub }}>
                          {item.grade?.name ?? 'كل الصفوف'}
                        </span>
                        {item.file_url ? (
                          <a
                            href={item.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '8px 12px', borderRadius: 10, background: C.goldGrad,
                              color: '#1B2038', fontWeight: 800, fontSize: 12, textDecoration: 'none',
                            }}
                          >
                            فتح
                          </a>
                        ) : (
                          <span style={{ fontSize: 11, color: C.sub }}>بدون رابط</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </StudentLayout>
  );
}
