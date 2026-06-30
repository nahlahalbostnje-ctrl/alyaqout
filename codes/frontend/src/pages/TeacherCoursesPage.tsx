import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchTeacherCourses } from '../features/teacher/teacherSlice';
import TeacherLayout from '../components/TeacherLayout';

const C = {
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  gold:'#C59341', goldL:'#D4A65A', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.22)',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', greenBg:'rgba(16,185,129,0.08)',
  red:'#EF4444', redBg:'rgba(239,68,68,0.08)',
  amber:'#D97706', amberBg:'rgba(217,119,6,0.08)',
  blue:'#3B82F6', blueBg:'rgba(59,130,246,0.08)',
};

const STATUS_MAP = {
  active:   { label:'نشطة',           color: C.green,  bg: C.greenBg },
  pending:  { label:'انتظار الموافقة', color: C.amber,  bg: C.amberBg },
  rejected: { label:'مرفوضة',         color: C.red,    bg: C.redBg   },
  inactive: { label:'معطّلة',         color: C.sub,    bg:'#F3F4F6'  },
};

interface NewCourseForm {
  title: string; description: string;
  price: string; is_free: boolean; grade: string; category: string;
}

const EMPTY_FORM: NewCourseForm = { title:'', description:'', price:'', is_free:false, grade:'', category:'' };

const GRADES    = ['الصف الثالث','الصف الرابع','الصف الخامس','الصف السادس','الصف السابع','الصف الثامن','الصف التاسع','الصف العاشر'];
const CATS      = ['الرياضيات','العلوم','اللغة العربية','اللغة الإنجليزية','التربية الإسلامية','الفيزياء','الكيمياء','الأحياء'];
const CAT_EMOJI: Record<string,string> = {
  'الرياضيات':'📐','العلوم':'🧪','اللغة العربية':'📜','اللغة الإنجليزية':'🌐',
  'التربية الإسلامية':'🕌','الفيزياء':'⚛️','الكيمياء':'🧫','الأحياء':'🌱',
};

export default function TeacherCoursesPage() {
  const dispatch = useAppDispatch();
  const { courses, loading, error } = useAppSelector((s) => s.teacher);

  const [showCreate, setShowCreate]   = useState(false);
  const [form, setForm]               = useState<NewCourseForm>(EMPTY_FORM);
  const [submitting, setSubmitting]   = useState(false);
  const [successMsg, setSuccessMsg]   = useState('');
  const [pendingLocal, setPendingLocal] = useState<Array<NewCourseForm & { id: number; status: 'pending' }>>([]);

  useEffect(() => { dispatch(fetchTeacherCourses()); }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    setPendingLocal(prev => [...prev, { ...form, id: Date.now(), status: 'pending' }]);
    setSuccessMsg('تم إرسال طلب إنشاء الدورة وهو الآن بانتظار موافقة الأدمن ✅');
    setForm(EMPTY_FORM);
    setSubmitting(false);
    setTimeout(() => { setShowCreate(false); setSuccessMsg(''); }, 2500);
  };

  const allCourses = [
    ...pendingLocal.map(p => ({
      id: p.id, title: p.title, description: p.description,
      is_free: p.is_free, price: p.price, is_active: false, status: 'pending' as const,
      category: { name: p.category, grade: { name: p.grade } }, thumbnail: null,
    })),
    ...courses.map(c => ({ ...c, status: (c.is_active ? 'active' : 'inactive') as 'active'|'inactive' })),
  ];

  return (
    <TeacherLayout>
      <div style={{ fontFamily:"'Cairo',sans-serif", background: C.bg, minHeight:'100vh', padding:24 }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:4, height:28, borderRadius:4, background: C.goldGrad }} />
            <div>
              <h2 style={{ margin:0, fontSize:20, fontWeight:900, color: C.text }}>دوراتي</h2>
              <p style={{ margin:0, fontSize:12, color: C.sub, marginTop:2 }}>الدورات المسندة إليك</p>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)}
            style={{ padding:'10px 20px', borderRadius:14, background: C.goldGrad, color:'#1B2038', fontWeight:700, fontSize:13, border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:8, boxShadow:'0 4px 14px rgba(197,147,65,0.4)', fontFamily:"'Cairo',sans-serif" }}>
            <span style={{ fontSize:18, fontWeight:400 }}>+</span>
            إنشاء دورة جديدة
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
          {[
            { icon:'📚', label:'إجمالي الدورات',       val: allCourses.length },
            { icon:'✅', label:'نشطة',                 val: allCourses.filter(c=>c.status==='active').length },
            { icon:'⏳', label:'انتظار الموافقة',      val: allCourses.filter(c=>c.status==='pending').length },
            { icon:'👥', label:'إجمالي الطلاب',        val: courses.reduce((a,c)=>a+(c as any).students_count||0, 0) || '—' },
          ].map((s,i) => (
            <div key={i} style={{ background: C.card, borderRadius:16, padding:'16px 18px', boxShadow: C.shadow, border:`1px solid ${C.border}` }}>
              <p style={{ fontSize:22, marginBottom:6 }}>{s.icon}</p>
              <p style={{ color: C.text, fontWeight:900, fontSize:22, lineHeight:1 }}>{s.val}</p>
              <p style={{ color: C.sub, fontSize:11.5, marginTop:4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Pending Banner */}
        {pendingLocal.length > 0 && (
          <div style={{ background: C.amberBg, border:`1px solid rgba(217,119,6,0.25)`, borderRadius:14, padding:'12px 18px', marginBottom:20, display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:22 }}>⏳</span>
            <div>
              <p style={{ color: C.amber, fontWeight:700, fontSize:13 }}>لديك {pendingLocal.length} دورة بانتظار موافقة الأدمن</p>
              <p style={{ color: C.sub, fontSize:11.5, marginTop:2 }}>ستتلقى إشعاراً فور الموافقة أو الرفض</p>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', border:`3px solid ${C.goldBg}`, borderTopColor: C.gold, animation:'spin 0.8s linear infinite' }} />
          </div>
        )}
        {error && (
          <p style={{ padding:'12px 16px', borderRadius:12, background: C.redBg, color: C.red, fontSize:13, marginBottom:16 }}>{error}</p>
        )}

        {!loading && allCourses.length === 0 && (
          <div style={{ textAlign:'center', padding:'64px 0' }}>
            <div style={{ fontSize:54, marginBottom:14 }}>📚</div>
            <p style={{ color: C.sub, fontSize:16, fontWeight:600 }}>لا توجد دورات بعد</p>
            <p style={{ color: C.dim, fontSize:13, marginTop:6 }}>أنشئ دورتك الأولى وسيراجعها الأدمن</p>
            <button onClick={() => setShowCreate(true)}
              style={{ marginTop:20, padding:'12px 28px', borderRadius:14, background: C.goldGrad, color:'#1B2038', fontWeight:700, fontSize:14, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
              + إنشاء دورة
            </button>
          </div>
        )}

        {/* Course Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
          {allCourses.map((course: any) => {
            const st = STATUS_MAP[course.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.inactive;
            const emoji = CAT_EMOJI[course.category?.name ?? ''] ?? '🎬';
            return (
              <div key={course.id} style={{ background: C.card, borderRadius:18, overflow:'hidden', boxShadow: C.shadow, border:`1px solid ${course.status==='pending' ? 'rgba(217,119,6,0.3)' : C.border}` }}>
                {course.thumbnail
                  ? <img src={course.thumbnail} alt={course.title} style={{ width:'100%', height:160, objectFit:'cover' }} />
                  : <div style={{ width:'100%', height:160, display:'flex', alignItems:'center', justifyContent:'center', fontSize:54, background: C.goldBg }}>{emoji}</div>
                }
                <div style={{ padding:'16px 18px' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:8 }}>
                    <p style={{ color: C.text, fontWeight:800, fontSize:15, lineHeight:1.4, flex:1 }}>{course.title}</p>
                    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background: st.bg, color: st.color, flexShrink:0 }}>
                      {st.label}
                    </span>
                  </div>
                  {course.description && (
                    <p style={{ color: C.sub, fontSize:12, lineHeight:1.5, marginBottom:10, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as any }}>
                      {course.description}
                    </p>
                  )}
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
                    {course.category?.grade?.name && (
                      <span style={{ padding:'3px 9px', borderRadius:8, background:'rgba(0,0,0,0.04)', color: C.dim, fontSize:11 }}>
                        {course.category.grade.name}
                      </span>
                    )}
                    {course.category?.name && (
                      <span style={{ padding:'3px 9px', borderRadius:8, background: C.goldBg, color: C.gold, fontSize:11, fontWeight:600 }}>
                        {course.category.name}
                      </span>
                    )}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <p style={{ fontWeight:800, fontSize:15, color: course.is_free ? C.green : C.gold }}>
                      {course.is_free ? 'مجاني' : `${course.price} ر.س`}
                    </p>
                    {course.status === 'pending' && (
                      <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:11.5, color: C.amber }}>
                        <span style={{ width:8, height:8, borderRadius:'50%', background: C.amber, display:'inline-block', animation:'pulse 1.5s ease-in-out infinite' }} />
                        انتظار مراجعة الأدمن
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Course Modal */}
        {showCreate && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
            onClick={() => { setShowCreate(false); setSuccessMsg(''); }}>
            <div style={{ background:'#fff', borderRadius:22, padding:28, width:520, maxWidth:'100%', maxHeight:'90vh', overflowY:'auto' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                <div>
                  <h2 style={{ color: C.text, fontWeight:900, fontSize:18, margin:0 }}>إنشاء دورة جديدة</h2>
                  <p style={{ color: C.sub, fontSize:12, marginTop:3 }}>ستُرسَل للأدمن للمراجعة والموافقة</p>
                </div>
                <button onClick={() => { setShowCreate(false); setSuccessMsg(''); }}
                  style={{ width:32, height:32, borderRadius:8, border:`1px solid ${C.border}`, background:'transparent', cursor:'pointer', fontSize:16, color: C.sub }}>✕</button>
              </div>

              {successMsg ? (
                <div style={{ background: C.greenBg, border:`1px solid rgba(16,185,129,0.25)`, borderRadius:14, padding:'18px 22px', textAlign:'center' }}>
                  <p style={{ color: C.green, fontWeight:700, fontSize:15 }}>{successMsg}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Title */}
                  <div style={{ marginBottom:14 }}>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, color: C.sub, marginBottom:6 }}>عنوان الدورة *</label>
                    <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
                      placeholder="مثال: الرياضيات — الوحدة 4" required
                      style={{ width:'100%', padding:'10px 14px', borderRadius:12, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none', boxSizing:'border-box' }} />
                  </div>

                  {/* Description */}
                  <div style={{ marginBottom:14 }}>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, color: C.sub, marginBottom:6 }}>الوصف</label>
                    <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
                      placeholder="وصف مختصر للدورة..." rows={3}
                      style={{ width:'100%', padding:'10px 14px', borderRadius:12, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none', boxSizing:'border-box', resize:'none' }} />
                  </div>

                  {/* Grade + Category */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:700, color: C.sub, marginBottom:6 }}>الصف الدراسي</label>
                      <select value={form.grade} onChange={e=>setForm({...form,grade:e.target.value})}
                        style={{ width:'100%', padding:'10px 14px', borderRadius:12, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none', background:'#fff' }}>
                        <option value="">— اختر —</option>
                        {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:700, color: C.sub, marginBottom:6 }}>المادة</label>
                      <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
                        style={{ width:'100%', padding:'10px 14px', borderRadius:12, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none', background:'#fff' }}>
                        <option value="">— اختر —</option>
                        {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, color: C.sub, marginBottom:6 }}>السعر</label>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer' }}>
                        <input type="checkbox" checked={form.is_free} onChange={e=>setForm({...form,is_free:e.target.checked,price:''})} />
                        <span style={{ fontSize:13, color: C.text }}>دورة مجانية</span>
                      </label>
                      {!form.is_free && (
                        <input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}
                          placeholder="السعر بالريال" min={0}
                          style={{ flex:1, padding:'10px 14px', borderRadius:12, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:"'Cairo',sans-serif", outline:'none' }} />
                      )}
                    </div>
                  </div>

                  <div style={{ background: C.amberBg, border:`1px solid rgba(217,119,6,0.2)`, borderRadius:12, padding:'10px 14px', fontSize:12, color: C.amber, marginBottom:18 }}>
                    ⏳ سيتم مراجعة الدورة من قِبَل الأدمن قبل نشرها للطلاب. ستتلقى إشعاراً عند الموافقة أو الرفض.
                  </div>

                  <div style={{ display:'flex', gap:10 }}>
                    <button type="submit" disabled={submitting || !form.title.trim()}
                      style={{ flex:1, padding:'12px', borderRadius:13, background: C.goldGrad, color:'#1B2038', fontWeight:700, fontSize:14, border:'none', cursor: submitting ? 'wait' : 'pointer', opacity: !form.title.trim() ? 0.5 : 1, fontFamily:"'Cairo',sans-serif" }}>
                      {submitting ? 'جاري الإرسال...' : '📤 إرسال للمراجعة'}
                    </button>
                    <button type="button" onClick={() => setShowCreate(false)}
                      style={{ flex:1, padding:'12px', borderRadius:13, background:'transparent', border:`1.5px solid ${C.border}`, color: C.text, fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                      إلغاء
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
      `}</style>
    </TeacherLayout>
  );
}
