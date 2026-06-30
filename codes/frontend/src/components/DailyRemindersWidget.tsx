import { useState } from 'react';

const C = {
  gold: '#C59341', goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
  navy: '#0D1E3A', card: '#fff', border: '#E8EDF5', sub: '#64748B',
  text: '#1E293B', green: '#16A34A', greenBg: 'rgba(22,163,74,0.08)',
  red: '#DC2626', redBg: 'rgba(220,38,38,0.08)',
  goldBg: 'rgba(197,147,65,0.08)', goldBdr: 'rgba(197,147,65,0.25)',
  shadow: '0 2px 8px rgba(13,30,58,0.06)',
};

interface Reminder { id: number; text: string; done: boolean; priority: 'high' | 'normal' }

const INIT: Reminder[] = [
  { id:1, text:'مراجعة طلبات الموافقة', done:false, priority:'high' },
  { id:2, text:'متابعة تقارير المعلمين', done:false, priority:'normal' },
  { id:3, text:'تحديث الإشعارات اليومية', done:false, priority:'normal' },
];

interface Props {
  role?: 'admin' | 'parent' | 'teacher' | 'supervisor';
  initItems?: { text: string; priority?: 'high' | 'normal' }[];
}

export default function DailyRemindersWidget({ role = 'admin', initItems }: Props) {
  const defaultItems: Reminder[] = (initItems ?? INIT).map((r, i) => ({
    id: i + 1, text: typeof r === 'string' ? r : r.text,
    done: false, priority: (typeof r === 'object' ? r.priority : 'normal') ?? 'normal',
  }));

  const [items, setItems] = useState<Reminder[]>(defaultItems);
  const [input, setInput] = useState('');
  const [show, setShow] = useState(true);

  const toggle = (id: number) => setItems(p => p.map(r => r.id === id ? { ...r, done: !r.done } : r));
  const remove = (id: number) => setItems(p => p.filter(r => r.id !== id));
  const add = () => {
    if (!input.trim()) return;
    setItems(p => [...p, { id: Date.now(), text: input.trim(), done: false, priority: 'normal' }]);
    setInput('');
  };

  const done = items.filter(r => r.done).length;
  const total = items.length;
  const pct = total > 0 ? Math.round(done / total * 100) : 0;

  const roleLabel: Record<string, string> = {
    admin: 'مهام الإدارة', parent: 'مهامي اليوم', teacher: 'مهامي التدريسية', supervisor: 'مهام الإشراف',
  };

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: C.shadow }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,#0D1E3A,#162144)`, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>📋</span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{roleLabel[role]}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ background: 'rgba(197,147,65,0.2)', color: C.gold, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
            {done}/{total}
          </span>
          <button onClick={() => setShow(p => !p)}
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 16, padding: 0 }}>
            {show ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {show && (
        <div style={{ padding: '14px 16px' }}>
          {/* Progress bar */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: C.sub, fontSize: 11 }}>التقدم اليوم</span>
              <span style={{ color: pct === 100 ? C.green : C.gold, fontWeight: 700, fontSize: 11 }}>{pct}%</span>
            </div>
            <div style={{ height: 6, background: '#F1F5F9', borderRadius: 99 }}>
              <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: pct === 100 ? C.green : C.goldGrad, transition: 'width 0.4s ease' }} />
            </div>
          </div>

          {/* Tasks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12, maxHeight: 200, overflowY: 'auto' }}>
            {items.length === 0 && (
              <p style={{ color: C.sub, fontSize: 12, textAlign: 'center', padding: '8px 0' }}>لا توجد مهام — أضف مهمة جديدة ⬇️</p>
            )}
            {items.map(r => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: r.done ? C.greenBg : r.priority === 'high' ? C.redBg : C.goldBg,
                borderRadius: 10, padding: '8px 10px',
                border: `1px solid ${r.done ? 'rgba(22,163,74,0.2)' : r.priority === 'high' ? 'rgba(220,38,38,0.15)' : C.goldBdr}`,
                transition: 'all 0.2s',
              }}>
                <button onClick={() => toggle(r.id)} style={{
                  width: 20, height: 20, borderRadius: 6, flexShrink: 0, cursor: 'pointer',
                  border: `2px solid ${r.done ? C.green : r.priority === 'high' ? C.red : C.gold}`,
                  background: r.done ? C.green : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {r.done && <span style={{ color: '#fff', fontSize: 11, lineHeight: 1 }}>✓</span>}
                </button>
                <span style={{
                  flex: 1, fontSize: 12, color: r.done ? C.sub : C.text,
                  fontWeight: r.priority === 'high' ? 700 : 500,
                  textDecoration: r.done ? 'line-through' : 'none',
                }}>
                  {r.priority === 'high' && !r.done && <span style={{ color: C.red, marginLeft: 4 }}>●</span>}
                  {r.text}
                </span>
                <button onClick={() => remove(r.id)}
                  style={{ background: 'transparent', border: 'none', color: C.sub, cursor: 'pointer', fontSize: 14, padding: 0, flexShrink: 0 }}>
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Add new */}
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && add()}
              placeholder="أضف مهمة جديدة..."
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 10, border: `1px solid ${C.border}`,
                fontSize: 12, fontFamily: "'Cairo',sans-serif", background: '#F8FAFC',
                outline: 'none', color: C.text,
              }}
            />
            <button onClick={add} style={{
              padding: '8px 14px', borderRadius: 10, background: C.goldGrad,
              border: 'none', cursor: 'pointer', color: '#1B2038', fontWeight: 700, fontSize: 13,
            }}>+</button>
          </div>
        </div>
      )}
    </div>
  );
}
