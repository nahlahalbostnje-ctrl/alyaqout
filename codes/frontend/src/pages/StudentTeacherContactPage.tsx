import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import api from '../services/axios';

interface Teacher {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
}

const font = { fontFamily: "'Cairo', sans-serif" };

export default function StudentTeacherContactPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/student/teachers');
      setTeachers(data.teachers ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <StudentLayout>
      <div style={{ ...font, direction: 'rtl', padding: '20px 20px 40px' }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, color: '#1B2038' }}>تواصل مع المعلم</h1>
        <p style={{ margin: '0 0 16px', color: '#6B7280', fontSize: 13 }}>معلمو دوراتك + قنوات الدعم السريع</p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          <Link to="/student/study-room" style={chip}>معلمي الذكي</Link>
          <Link to="/student/emergency" style={chip}>غرفة الطوارئ</Link>
          <Link to="/student/messages" style={chip}>الرسائل</Link>
        </div>

        {loading ? <p style={{ color: '#6B7280' }}>جاري...</p> : teachers.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, textAlign: 'center', border: '1px solid #EDE3CE' }}>
            <p style={{ fontWeight: 800, color: '#1B2038' }}>لا معلمون مرتبطون حالياً</p>
            <p style={{ fontSize: 13, color: '#6B7280' }}>سجّل في دورة ليظهر معلمها هنا</p>
          </div>
        ) : teachers.map((t) => (
          <div key={t.id} style={{
            background: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, border: '1px solid #EDE3CE',
            display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap',
          }}>
            <div>
              <p style={{ margin: 0, fontWeight: 800, color: '#1B2038' }}>{t.name}</p>
              {t.phone && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280' }} dir="ltr">{t.phone}</p>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {t.phone && (
                <a href={`https://wa.me/${t.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                  style={{ ...chip, textDecoration: 'none' }}>واتساب</a>
              )}
              <Link to="/student/study-room" style={{ ...chip, textDecoration: 'none' }}>اسأل الذكي</Link>
            </div>
          </div>
        ))}
      </div>
    </StudentLayout>
  );
}

const chip: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 10, background: 'rgba(201,149,42,0.12)', color: '#C9952A',
  fontWeight: 700, fontSize: 12, fontFamily: "'Cairo', sans-serif",
};
