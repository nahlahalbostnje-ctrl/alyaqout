import { useEffect, useState } from 'react';
import TeacherLayout from '../components/TeacherLayout';
import { Link } from 'react-router-dom';
import api from '../services/axios';

const C = {
  gold:'#C59341', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:'rgba(197,147,65,0.08)', border:'#EDE3CE',
  card:'#FFFFFF', text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
};

interface CourseRow { id: number; title: string }

export default function TeacherAttendancePage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString('ar-EG', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  useEffect(() => {
    api.get('/teacher/courses')
      .then(r => {
        const data = r.data.data ?? r.data.courses ?? r.data ?? [];
        setCourses(Array.isArray(data) ? data.map((c: { id: number; title: string }) => ({ id: c.id, title: c.title })) : []);
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <TeacherLayout>
      <div style={{ padding:20, fontFamily:"'Cairo',sans-serif", direction:'rtl', minHeight:'100%' }}>
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
            <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>سجل الحضور والسلوك</h1>
          </div>
          <p style={{ color:C.sub, fontSize:13, margin:0 }}>{today}</p>
        </div>

        <div style={{ background:C.card, borderRadius:16, padding:28, border:`1px solid ${C.border}`, boxShadow:C.shadow }}>
          {loading ? (
            <p style={{ color:C.sub, margin:0 }}>جاري التحميل...</p>
          ) : (
            <>
              <p style={{ color:C.text, fontWeight:800, fontSize:15, margin:'0 0 8px' }}>
                تسجيل الحضور التفصيلي غير مفعّل بعد كموديول منفصل
              </p>
              <p style={{ color:C.sub, fontSize:13, margin:'0 0 18px', lineHeight:1.7 }}>
                حالياً يُدار الحضور عبر الحصص المباشرة والمشرف. دوراتك النشطة تظهر أدناه للمتابعة.
              </p>
              {courses.length === 0 ? (
                <p style={{ color:C.dim, fontSize:13, margin:0 }}>لا دورات مرتبطة بحسابك بعد</p>
              ) : (
                <ul style={{ margin:0, padding:0, listStyle:'none' }}>
                  {courses.map(c => (
                    <li key={c.id} style={{
                      padding:'12px 14px', marginBottom:8, borderRadius:12,
                      background:C.goldBg, border:`1px solid ${C.border}`,
                      fontWeight:700, fontSize:13, color:C.text,
                    }}>{c.title}</li>
                  ))}
                </ul>
              )}
              <Link to="/teacher/live-classes" style={{
                display:'inline-block', marginTop:16, padding:'10px 18px', borderRadius:12,
                background:C.goldGrad, color:'#fff', fontWeight:800, fontSize:13, textDecoration:'none',
              }}>
                الانتقال للحصص المباشرة
              </Link>
            </>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
