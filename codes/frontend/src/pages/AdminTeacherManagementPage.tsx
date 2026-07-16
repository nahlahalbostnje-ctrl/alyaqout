import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchUsers, toggleUser } from '../features/admin/usersSlice';
import { useCurrency } from '../hooks/useCurrency';

const C = {
  gold:'#C59341', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  navy:'#0D1E3A', bg:'#F5EDD8', card:'#FFFFFF', text:'#1B2038',
  sub:'#6B7280', border:'#EDE3CE', shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', greenBg:'rgba(16,185,129,0.08)', greenBdr:'rgba(16,185,129,0.2)',
  red:'#DC2626', redBg:'rgba(220,38,38,0.08)',
  blue:'#3B82F6', blueBg:'rgba(59,130,246,0.08)',
  amber:'#F59E0B', amberBg:'rgba(245,158,11,0.08)',
  goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.25)',
};

interface Teacher {
  id: number;
  name: string;
  subject: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  hoursPerWeek: number;
  studentsCount: number;
  coursesCount: number;
  joinDate: string;
  salary: number;
  incentives: number;
  rating: number;
  permissions: string[];
}

const ALL_PERMS = [
  'إنشاء دورات', 'إنشاء امتحانات', 'إنشاء واجبات',
  'الحصص المباشرة', 'تسجيل الحضور', 'رفع مواد',
  'التواصل مع أولياء الأمور', 'تقارير الطلاب',
];

const STATUS_LABEL: Record<Teacher['status'], { label: string; color: string; bg: string }> = {
  active:    { label:'نشط',     color:C.green, bg:C.greenBg },
  inactive:  { label:'غير نشط', color:C.amber, bg:C.amberBg },
  suspended: { label:'موقوف',   color:C.red,   bg:C.redBg   },
};

export default function AdminTeacherManagementPage() {
  const navigate = useNavigate();
  const { formatMoney } = useCurrency();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const dispatch = useAppDispatch();
  const { list: users, loading } = useAppSelector(s => s.adminUsers);
  useEffect(() => { dispatch(fetchUsers('teacher')); }, [dispatch]);

  const mapUser = (u: { id:number; name:string; phone:string; is_active:boolean; created_at:string }): Teacher => ({
    id: u.id, name: u.name, subject: '—', phone: u.phone, email: '—',
    status: u.is_active ? 'active' : 'inactive',
    hoursPerWeek: 0, studentsCount: 0, coursesCount: 0,
    joinDate: u.created_at?.slice(0, 10) ?? '—',
    salary: 0, incentives: 0, rating: 0, permissions: [],
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  useEffect(() => {
    setTeachers(users.filter(u => u.role === 'teacher').map(mapUser));
  }, [users]);
  const [selected, setSelected] = useState<Teacher | null>(null);
  void loading;
  const [tab, setTab] = useState<'info' | 'permissions' | 'financial'>('info');
  const [editPerms, setEditPerms] = useState<string[]>([]);
  const [editHours, setEditHours] = useState(0);
  const [editSalary, setEditSalary] = useState(0);
  const [editIncentives, setEditIncentives] = useState(0);
  const [saveMsg, setSaveMsg] = useState('');
  const [search, setSearch] = useState('');

  const openTeacher = (t: Teacher) => {
    setSelected(t);
    setEditPerms([...t.permissions]);
    setEditHours(t.hoursPerWeek);
    setEditSalary(t.salary);
    setEditIncentives(t.incentives);
    setSaveMsg('');
    setTab('info');
  };

  const saveChanges = () => {
    if (!selected) return;
    setTeachers(p => p.map(t => t.id === selected.id
      ? { ...t, permissions: editPerms, hoursPerWeek: editHours, salary: editSalary, incentives: editIncentives }
      : t
    ));
    setSaveMsg('✅ تم حفظ التغييرات بنجاح!');
    setTimeout(() => setSaveMsg(''), 2500);
  };

  const toggleStatus = (id: number) => {
    dispatch(toggleUser(id));
  };

  const filtered = teachers.filter(t =>
    t.name.includes(search) || t.subject.includes(search) || t.phone.includes(search)
  );

  const activeCount    = teachers.filter(t => t.status === 'active').length;
  const totalStudents  = teachers.reduce((a, t) => a + t.studentsCount, 0);
  const totalHours     = teachers.reduce((a, t) => a + t.hoursPerWeek, 0);
  const avgRating      = teachers.length ? +(teachers.reduce((a, t) => a + t.rating, 0) / teachers.length).toFixed(1) : 0;

  const inp = (style: React.CSSProperties = {}): React.CSSProperties => ({
    width:'100%', padding:'9px 12px', borderRadius:10, border:`1px solid ${C.border}`,
    fontSize:13, fontFamily:"'Cairo',sans-serif", background:'#F8FAFC',
    outline:'none', color:C.text, ...style,
  });

  return (
    <AdminLayout>
      <div dir="rtl" style={{ padding:'24px', fontFamily:"'Cairo',sans-serif", background:C.bg, minHeight:'100vh' }}>

        {/* Header */}
        <div style={{ marginBottom:24, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
          <div>
            <h1 style={{ color:C.navy, fontWeight:900, fontSize:22 }}>إدارة المعلمين الموسعة</h1>
            <p style={{ color:C.sub, fontSize:13, marginTop:4 }}>إدارة صلاحيات وساعات وحوافز المعلمين</p>
          </div>
          <button onClick={() => navigate('/admin/users')}
            style={{ padding:'9px 18px', borderRadius:12, background:C.goldGrad, color:'#fff', fontWeight:800, fontSize:13, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
            + إضافة معلم
          </button>
        </div>

        {/* KPI Row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:14, marginBottom:24 }}>
          {[
            { label:'المعلمون النشطون', value:activeCount,   icon:'👨‍🏫', color:C.green },
            { label:'إجمالي الطلاب',    value:totalStudents, icon:'🎓',   color:C.blue  },
            { label:'ساعات تدريسية',   value:`${totalHours}`,icon:'⏱',   color:C.gold  },
            { label:'متوسط التقييم',    value:`${avgRating}⭐`,icon:'🏆',  color:C.amber },
          ].map(k => (
            <div key={k.label} style={{ background:C.card, borderRadius:16, padding:'16px 18px', boxShadow:C.shadow, border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:24, marginBottom:6 }}>{k.icon}</div>
              <p style={{ color:k.color, fontWeight:900, fontSize:22 }}>{k.value}</p>
              <p style={{ color:C.sub, fontSize:12 }}>{k.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap:20 }}>

          {/* Teachers List */}
          <div style={{ background:C.card, borderRadius:18, boxShadow:C.shadow, border:`1px solid ${C.border}`, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:12 }}>
              <h2 style={{ color:C.navy, fontWeight:800, fontSize:16, flex:1 }}>قائمة المعلمين</h2>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="بحث بالاسم أو المادة..."
                style={{ ...inp(), width:200 }}
              />
            </div>

            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:520 }}>
                <thead>
                  <tr style={{ background:'#F8FAFC' }}>
                    {['المعلم','المادة','الطلاب','الساعات/أسبوع','التقييم','الحالة','إجراءات'].map(h => (
                      <th key={h} style={{ padding:'10px 14px', color:C.sub, fontWeight:600, fontSize:12, textAlign:'right', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} style={{ padding:32, textAlign:'center', color:C.sub }}>لا يوجد معلمون</td></tr>
                  )}
                  {filtered.map((t, i) => {
                    const st = STATUS_LABEL[t.status];
                    return (
                      <tr key={t.id} style={{ borderTop:`1px solid ${C.border}`, background: selected?.id === t.id ? C.goldBg : i%2===0?'#fff':'#FAFAFA' }}>
                        <td style={{ padding:'12px 14px', whiteSpace:'nowrap' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${C.gold},#D4A65A)`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:14, flexShrink:0 }}>
                              {t.name[0]}
                            </div>
                            <div>
                              <p style={{ color:C.text, fontWeight:700, fontSize:13 }}>{t.name}</p>
                              <p style={{ color:C.sub, fontSize:11 }}>{t.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:'12px 14px', color:C.sub, fontSize:13 }}>{t.subject}</td>
                        <td style={{ padding:'12px 14px', color:C.text, fontWeight:600, fontSize:13 }}>{t.studentsCount}</td>
                        <td style={{ padding:'12px 14px', color:C.text, fontSize:13 }}>{t.hoursPerWeek} س</td>
                        <td style={{ padding:'12px 14px' }}>
                          <span style={{ color:C.amber, fontWeight:700, fontSize:13 }}>{t.rating} ⭐</span>
                        </td>
                        <td style={{ padding:'12px 14px' }}>
                          <span style={{ background:st.bg, color:st.color, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>{st.label}</span>
                        </td>
                        <td style={{ padding:'12px 14px', whiteSpace:'nowrap' }}>
                          <div style={{ display:'flex', gap:6 }}>
                            <button onClick={() => openTeacher(t)}
                              style={{ padding:'5px 12px', borderRadius:8, background:C.goldBg, border:`1px solid ${C.goldBdr}`, color:C.gold, fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                              تفاصيل
                            </button>
                            <button onClick={() => toggleStatus(t.id)}
                              style={{ padding:'5px 12px', borderRadius:8, background: t.status==='active' ? C.redBg : C.greenBg, border:`1px solid ${t.status==='active' ? C.red+'33' : C.green+'33'}`, color: t.status==='active' ? C.red : C.green, fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                              {t.status==='active' ? 'إيقاف' : 'تفعيل'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail Panel */}
          {selected ? (
            <div style={{ background:C.card, borderRadius:18, boxShadow:C.shadow, border:`1px solid ${C.border}`, overflow:'hidden', display:'flex', flexDirection:'column' }}>
              {/* Profile header */}
              <div style={{ background:`linear-gradient(135deg,${C.navy},#162144)`, padding:'20px 18px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:`linear-gradient(135deg,${C.gold},#D4A65A)`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:20 }}>
                    {selected.name[0]}
                  </div>
                  <div>
                    <p style={{ color:'#fff', fontWeight:800, fontSize:15 }}>{selected.name}</p>
                    <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12 }}>{selected.subject}</p>
                  </div>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  {(['info','permissions','financial'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                      style={{ flex:1, padding:'6px 0', borderRadius:8, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontWeight:700, fontSize:12,
                        background: tab===t ? C.gold : 'rgba(255,255,255,0.1)', color: tab===t ? '#1B2038' : 'rgba(255,255,255,0.7)',
                      }}>
                      {t==='info' ? 'البيانات' : t==='permissions' ? 'الصلاحيات' : 'المالية'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ padding:'16px', flex:1, overflowY:'auto' }}>

                {/* Tab: Info */}
                {tab==='info' && (
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {[
                      ['📱 الهاتف', selected.phone],
                      ['📧 البريد', selected.email],
                      ['📅 تاريخ الانضمام', selected.joinDate],
                      ['📚 الدورات', `${selected.coursesCount} دورة`],
                      ['🎓 الطلاب', `${selected.studentsCount} طالب`],
                      ['⭐ التقييم', `${selected.rating} / 5`],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px solid ${C.border}` }}>
                        <span style={{ color:C.sub, fontSize:13 }}>{label}</span>
                        <span style={{ color:C.text, fontWeight:600, fontSize:13 }}>{value}</span>
                      </div>
                    ))}
                    <div style={{ marginTop:8 }}>
                      <label style={{ color:C.text, fontWeight:700, fontSize:13, display:'block', marginBottom:6 }}>ساعات التدريس الأسبوعية</label>
                      <input type="number" value={editHours} onChange={e => setEditHours(+e.target.value)} min={0} max={40} style={inp()} />
                    </div>
                  </div>
                )}

                {/* Tab: Permissions */}
                {tab==='permissions' && (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    <p style={{ color:C.sub, fontSize:12, marginBottom:4 }}>حدد الصلاحيات الممنوحة لهذا المعلم</p>
                    {ALL_PERMS.map(perm => (
                      <label key={perm} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, border:`1px solid ${editPerms.includes(perm) ? C.goldBdr : C.border}`, background: editPerms.includes(perm) ? C.goldBg : '#F8FAFC', cursor:'pointer' }}>
                        <input type="checkbox" checked={editPerms.includes(perm)}
                          onChange={e => setEditPerms(p => e.target.checked ? [...p, perm] : p.filter(x => x!==perm))}
                          style={{ accentColor: C.gold, width:16, height:16 }}
                        />
                        <span style={{ color: editPerms.includes(perm) ? C.navy : C.sub, fontWeight: editPerms.includes(perm) ? 700 : 500, fontSize:13 }}>{perm}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Tab: Financial */}
                {tab==='financial' && (
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    <div style={{ background:C.goldBg, border:`1px solid ${C.goldBdr}`, borderRadius:12, padding:'12px 14px', marginBottom:4 }}>
                      <p style={{ color:C.sub, fontSize:11, marginBottom:4 }}>الراتب الأساسي الحالي</p>
                      <p style={{ color:C.gold, fontWeight:900, fontSize:20 }}>{formatMoney(selected.salary)}</p>
                    </div>
                    <div>
                      <label style={{ color:C.text, fontWeight:700, fontSize:13, display:'block', marginBottom:6 }}>تعديل الراتب الأساسي</label>
                      <input type="number" value={editSalary} onChange={e => setEditSalary(+e.target.value)} min={0} step={100} style={inp()} />
                    </div>
                    <div>
                      <label style={{ color:C.text, fontWeight:700, fontSize:13, display:'block', marginBottom:6 }}>الحوافز الشهرية</label>
                      <input type="number" value={editIncentives} onChange={e => setEditIncentives(+e.target.value)} min={0} step={50} style={inp()} />
                    </div>
                    <div style={{ background:'#F8FAFC', borderRadius:12, padding:'12px 14px', border:`1px solid ${C.border}` }}>
                      <div style={{ display:'flex', justifyContent:'space-between' }}>
                        <span style={{ color:C.sub, fontSize:13 }}>الإجمالي المتوقع</span>
                        <span style={{ color:C.green, fontWeight:800, fontSize:15 }}>{formatMoney(editSalary+editIncentives)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Save */}
              <div style={{ padding:'12px 16px', borderTop:`1px solid ${C.border}` }}>
                {saveMsg && <p style={{ color:C.green, fontSize:12, marginBottom:8, fontWeight:600 }}>{saveMsg}</p>}
                <button onClick={saveChanges} style={{ width:'100%', padding:'11px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:14, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                  حفظ التغييرات
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background:C.card, borderRadius:18, boxShadow:C.shadow, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
              <div style={{ textAlign:'center', color:C.sub }}>
                <div style={{ fontSize:48, marginBottom:12 }}>👈</div>
                <p style={{ fontWeight:700 }}>اختر معلماً من القائمة لعرض تفاصيله</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
