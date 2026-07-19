import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

interface TalentRow {
  id: number;
  display_name: string;
  talent_name: string;
  grade_label: string | null;
  age: number | null;
  goal: string | null;
  dream: string | null;
  student: { id: number; name: string; phone: string | null } | null;
  created_at: string | null;
}

const DK = {
  gold: '#C59341', goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
  text: '#1B2038', sub: '#6B7280', border: '#EDE3CE',
};

export default function AdminTalentsPage() {
  const [rows, setRows] = useState<TalentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/admin/talents');
      setRows(data.talents ?? []);
    } catch {
      setError('تعذّر تحميل المواهب');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = rows.filter((r) => {
    if (!q.trim()) return true;
    const s = q.trim().toLowerCase();
    return (
      r.display_name.toLowerCase().includes(s)
      || r.talent_name.toLowerCase().includes(s)
      || (r.student?.name ?? '').toLowerCase().includes(s)
    );
  });

  return (
    <AdminLayout>
      <div className="p-8 min-h-screen" style={{ fontFamily: "'Cairo', sans-serif", background: '#F5EDD8' }} dir="rtl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-5 rounded-full" style={{ background: DK.goldGrad }} />
            <span className="text-xs font-bold" style={{ color: DK.gold, opacity: 0.7 }}>أدمن البلد</span>
          </div>
          <h1 className="text-2xl font-black m-0" style={{ color: DK.text }}>حاضنة المواهب</h1>
          <p className="text-sm mt-1 m-0" style={{ color: DK.sub }}>
            ملفات المواهب التي أنشأها طلاب دولتك
          </p>
        </div>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="بحث بالاسم أو الموهبة..."
          style={{
            width: '100%', maxWidth: 360, marginBottom: 16, padding: '10px 14px', borderRadius: 12,
            border: `1px solid ${DK.border}`, fontFamily: "'Cairo', sans-serif", fontSize: 13,
          }}
        />

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>{error}</div>
        )}

        {loading ? (
          <div className="text-center py-16" style={{ color: DK.sub }}>جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={{ background: '#fff', border: `1px solid ${DK.border}` }}>
            <p className="font-bold m-0 mb-2" style={{ color: DK.text }}>لا توجد ملفات مواهب بعد</p>
            <p className="text-sm m-0" style={{ color: DK.sub }}>تظهر هنا عندما يملأ الطلاب استبيان حاضنة المواهب</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <div key={r.id} className="rounded-2xl px-5 py-4"
                style={{ background: '#fff', border: `1px solid ${DK.border}`, boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-bold text-sm m-0 mb-1" style={{ color: DK.text }}>
                      {r.display_name}
                      <span style={{ color: DK.gold, marginRight: 8 }}>· {r.talent_name}</span>
                    </p>
                    <p className="text-xs m-0" style={{ color: DK.sub }}>
                      حساب: {r.student?.name ?? '—'}
                      {r.grade_label ? ` · ${r.grade_label}` : ''}
                      {r.age != null ? ` · ${r.age} سنة` : ''}
                    </p>
                  </div>
                </div>
                {(r.goal || r.dream) && (
                  <div className="mt-3 text-xs" style={{ color: DK.sub, lineHeight: 1.6 }}>
                    {r.goal && <p className="m-0 mb-1"><strong style={{ color: DK.text }}>الهدف:</strong> {r.goal}</p>}
                    {r.dream && <p className="m-0"><strong style={{ color: DK.text }}>الحلم:</strong> {r.dream}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
