import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchStudentCourses } from '../features/student/studentSlice';
import StudentLayout from '../components/StudentLayout';

const C = {
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1535', navy2:'#1B2038',
  gold:'#C9952A', goldL:'#DDAD50', goldGrad:'linear-gradient(135deg,#C9952A,#DDAD50)',
  goldBg:'rgba(201,149,42,0.09)', goldBdr:'rgba(201,149,42,0.25)',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'rgba(0,0,0,0.07)',
  shadow:'0 2px 14px rgba(0,0,0,0.07)', red:'#EF4444',
};

const CATS = ['الكل', 'الرياضيات', 'العلوم', 'اللغات', 'التربية الإسلامية'] as const;
type Cat = typeof CATS[number];

const SUBJECT_EMOJI: Record<string, string> = {
  'الرياضيات': '📐', 'العلوم': '🧪', 'اللغة الإنجليزية': '🌐',
  'اللغة العربية': '📜', 'التربية الإسلامية': '🕌',
};

export default function StudentCoursesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { courses, loading } = useAppSelector(s => s.student);
  const [cat, setCat] = useState<Cat>('الكل');
  const [search, setSearch] = useState('');

  useEffect(() => { dispatch(fetchStudentCourses()); }, [dispatch]);

  const display = courses.map(c => ({
    ...c,
    progress: 0,
    emoji: SUBJECT_EMOJI[c.category?.name ?? ''] ?? '📚',
  })).filter(c => {
    const matchCat = cat === 'الكل' || c.category?.name?.includes(cat) || cat === 'اللغات' && (c.category?.name?.includes('اللغة') || c.category?.name === 'اللغات');
    const matchSearch = !search || c.title?.includes(search) || c.teacher?.name?.includes(search);
    return matchCat && matchSearch;
  });

  return (
    <StudentLayout>
    <div dir="rtl" style={{ fontFamily:"'Cairo',sans-serif" }}>

      {/* Page Header */}
      <div style={{ padding:'20px 16px 4px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
          <h1 style={{ color:C.text, fontWeight:900, fontSize:20, margin:0 }}>دوراتي 📚</h1>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding:'14px 16px 0' }}>
        <div style={{ position:'relative', marginBottom:12 }}>
          <input
            value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="ابحث عن دورة أو معلم..."
            style={{ width:'100%', padding:'11px 16px 11px 42px', borderRadius:14, border:`1.5px solid ${C.border}`, background:C.card, fontSize:13, color:C.text, fontFamily:"'Cairo',sans-serif", outline:'none', boxSizing:'border-box', boxShadow:C.shadow }}
          />
          <svg style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.dim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
        </div>

        {/* Category Tabs */}
        <div style={{ display:'flex', gap:8, overflowX:'auto', scrollbarWidth:'none', marginBottom:16, paddingBottom:2 }}>
          {CATS.map(c => (
            <button key={c} onClick={()=>setCat(c)}
              style={{ flexShrink:0, padding:'7px 16px', borderRadius:20, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:12.5, fontWeight:cat===c?700:500, background:cat===c?C.goldGrad:'rgba(0,0,0,0.05)', color:cat===c?'#1B2038':C.sub, boxShadow:cat===c?'0 3px 10px rgba(201,149,42,0.35)':'none', transition:'all 0.2s' }}>
              {c}
            </button>
          ))}
        </div>

        {/* Stats Row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10, marginBottom:16 }}>
          {[
            { icon:'📚', val:display.length, label:'دوراتي' },
            { icon:'✅', val:display.filter(c=>c.progress>=100).length, label:'مكتملة' },
            { icon:'⏳', val:display.filter(c=>c.progress<100).length, label:'جارية' },
          ].map((s,i)=>(
            <div key={i} style={{ background:C.card, borderRadius:14, padding:'12px 10px', textAlign:'center', boxShadow:C.shadow, border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:20, marginBottom:3 }}>{s.icon}</div>
              <p style={{ color:C.navy2, fontWeight:900, fontSize:18, lineHeight:1 }}>{s.val}</p>
              <p style={{ color:C.sub, fontSize:10.5, marginTop:3 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:'center', padding:'40px 0' }}>
            <div style={{ width:36, height:36, borderRadius:'50%', border:`3px solid ${C.goldBg}`, borderTopColor:C.gold, animation:'spin 0.8s linear infinite', margin:'0 auto' }}/>
          </div>
        )}

        {/* Empty */}
        {!loading && display.length === 0 && (
          <div style={{ textAlign:'center', padding:'50px 20px' }}>
            <div style={{ fontSize:54, marginBottom:12 }}>📚</div>
            <p style={{ color:C.sub, fontSize:15, fontWeight:600 }}>لا توجد دورات</p>
            <p style={{ color:C.dim, fontSize:12.5, marginTop:4 }}>جرّب تغيير الفلتر أو البحث</p>
          </div>
        )}

        {/* Course Cards */}
        <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:16 }}>
          {display.map((course:any, i:number) => {
            const pct = course.progress ?? 0;
            const done = pct >= 100;
            return (
              <div key={i}
                onClick={()=>navigate(`/student/courses/${course.id}/content`)}
                style={{ background:C.card, borderRadius:18, padding:'16px 18px', boxShadow:C.shadow, border:`1px solid ${done?'rgba(16,185,129,0.3)':C.border}`, cursor:'pointer', transition:'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-2px)')}
                onMouseLeave={e=>(e.currentTarget.style.transform='translateY(0)')}>

                <div style={{ display:'flex', gap:14, marginBottom:14 }}>
                  {/* Emoji icon */}
                  <div style={{ width:56, height:56, borderRadius:16, background: done ? 'rgba(16,185,129,0.1)' : C.goldBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0, border:`1px solid ${done ? 'rgba(16,185,129,0.2)' : C.goldBdr}` }}>
                    {course.thumbnail
                      ? <img src={course.thumbnail} alt="" style={{ width:'100%', height:'100%', borderRadius:16, objectFit:'cover' }}/>
                      : (course.emoji ?? '📚')}
                  </div>

                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ color:C.navy2, fontWeight:800, fontSize:14.5, marginBottom:4, lineHeight:1.3 }}>{course.title}</p>
                    <p style={{ color:C.sub, fontSize:12, marginBottom:3 }}>👨‍🏫 {course.teacher?.name ?? '—'}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                      {course.category?.grade?.name && (
                        <span style={{ padding:'2px 8px', borderRadius:8, background:'rgba(0,0,0,0.05)', color:C.dim, fontSize:10.5 }}>
                          {course.category.grade.name}
                        </span>
                      )}
                      {course.category?.name && (
                        <span style={{ padding:'2px 8px', borderRadius:8, background:C.goldBg, color:C.gold, fontSize:10.5, fontWeight:600 }}>
                          {course.category.name}
                        </span>
                      )}
                      <span style={{ padding:'2px 8px', borderRadius:8, fontSize:10.5, fontWeight:700,
                        background: course.is_free ? 'rgba(16,185,129,0.1)' : 'rgba(37,99,235,0.08)',
                        color:      course.is_free ? '#10B981'              : '#2563EB' }}>
                        {course.is_free ? 'مجاني' : `${course.price} ر.س`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11.5, marginBottom:5 }}>
                    <span style={{ color:C.sub, fontWeight:600 }}>{done ? '✅ مكتمل' : 'التقدم'}</span>
                    <span style={{ color:done ? '#10B981' : C.gold, fontWeight:800 }}>{pct}%</span>
                  </div>
                  <div style={{ height:7, borderRadius:4, background:'rgba(0,0,0,0.06)' }}>
                    <div style={{ width:`${Math.min(pct,100)}%`, height:'100%', borderRadius:4, background: done ? '#10B981' : C.goldGrad, transition:'width 0.6s ease' }}/>
                  </div>
                </div>

                <button onClick={()=>navigate(`/student/courses/${course.id}/content`)} style={{ marginTop:12, width:'100%', padding:'10px', borderRadius:12, background: done ? 'rgba(16,185,129,0.1)' : C.goldGrad, color: done ? '#10B981' : '#1B2038', fontWeight:700, fontSize:13, border: done ? '1px solid rgba(16,185,129,0.25)' : 'none', cursor:'pointer', boxShadow: done ? 'none' : '0 3px 12px rgba(201,149,42,0.35)' }}>
                  {done ? '🔄 مراجعة الدورة' : '▶ متابعة التعلم'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
    </StudentLayout>
  );
}
