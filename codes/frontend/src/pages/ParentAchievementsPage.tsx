import { useEffect, useState } from 'react';
import ParentLayout from '../components/ParentLayout';
import api from '../services/axios';

interface Row {
  student: { id: number; name: string };
  total_points: number;
  recent: { action: string; points: number; description: string; earned_at: string | null }[];
}

export default function ParentAchievementsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/parent/achievements')
      .then((r) => setRows(r.data.children ?? []))
      .catch(() => setError('تعذّر تحميل الإنجازات'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ParentLayout>
      <div dir="rtl" style={{ fontFamily: "'Cairo', sans-serif", padding: 24 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, color: '#1B2038' }}>الإنجازات والشارات</h1>
        <p style={{ margin: '0 0 16px', color: '#6B7280', fontSize: 13 }}>نقاط وإنجازات أبنائك</p>
        {error && <p style={{ color: '#EF4444', fontSize: 13 }}>{error}</p>}
        {loading ? <p style={{ color: '#6B7280' }}>جاري...</p> : rows.length === 0 ? (
          <p style={{ color: '#6B7280' }}>لا أبناء مرتبطون</p>
        ) : rows.map((r) => (
          <div key={r.student.id} style={{
            background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, border: '1px solid #EDE3CE',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontWeight: 800 }}>{r.student.name}</p>
              <span style={{ fontWeight: 900, color: '#C59341' }}>{r.total_points} نقطة</span>
            </div>
            {r.recent.length === 0 ? (
              <p style={{ fontSize: 12, color: '#6B7280', marginTop: 8 }}>لا إنجازات بعد</p>
            ) : r.recent.map((p, i) => (
              <p key={i} style={{ margin: '6px 0 0', fontSize: 12, color: '#6B7280' }}>
                +{p.points} · {p.description || p.action}
              </p>
            ))}
          </div>
        ))}
      </div>
    </ParentLayout>
  );
}
