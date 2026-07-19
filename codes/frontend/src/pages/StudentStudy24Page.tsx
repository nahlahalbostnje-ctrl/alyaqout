import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import api from '../services/axios';

interface Teacher {
  id: number;
  name: string;
  phone: string | null;
}

const font = { fontFamily: "'Cairo', sans-serif" };

export default function StudentStudy24Page() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/student/teachers');
      setTeachers(data.teachers ?? []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <StudentLayout>
      <div style={{ ...font, direction: 'rtl' }}>
        <div style={{
          background: 'linear-gradient(135deg,#0D1535,#1B2038)', padding: '28px 24px',
        }}>
          <h1 style={{ margin: 0, color: '#fff', fontSize: 22, fontWeight: 900 }}>غرفة الدراسة 24/7</h1>
          <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
            دعم متواصل: معلمي الذكي، الطوارئ، ومعلمو دوراتك
          </p>
        </div>
        <div style={{ padding: 20, display: 'grid', gap: 12 }}>
          {[
            { to: '/student/study-room', title: 'معلمي الذكي', desc: 'اسأل في أي وقت واحصل على شرح فوري', icon: '🤖' },
            { to: '/student/emergency', title: 'غرفة الطوارئ', desc: 'طلب عاجل لمعلم بشري', icon: '🚨' },
            { to: '/student/counselor', title: 'مرشد الياقوت', desc: 'دعم تربوي ونفسي سريع', icon: '💚' },
            { to: '/student/study-buddy', title: 'صديق الدراسة', desc: 'مؤقت تركيز معك الآن', icon: '⏱️' },
          ].map((x) => (
            <Link key={x.to} to={x.to} style={{
              display: 'block', background: '#fff', borderRadius: 16, padding: 16, textDecoration: 'none',
              border: '1px solid #EDE3CE', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            }}>
              <p style={{ margin: 0, fontWeight: 900, color: '#1B2038', fontSize: 15 }}>{x.icon} {x.title}</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280' }}>{x.desc}</p>
            </Link>
          ))}

          {teachers.length > 0 && (
            <>
              <h3 style={{ margin: '8px 0 0', fontSize: 14, fontWeight: 800, color: '#1B2038' }}>معلموك</h3>
              {teachers.map((t) => (
                <div key={t.id} style={{ background: '#fff', borderRadius: 12, padding: 12, border: '1px solid #EDE3CE' }}>
                  <p style={{ margin: 0, fontWeight: 700, color: '#1B2038' }}>{t.name}</p>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
