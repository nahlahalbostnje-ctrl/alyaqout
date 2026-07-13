import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchCourses } from '../features/admin/coursesSlice';
import { fetchUsers }   from '../features/admin/usersSlice';
import {
  fetchLiveClasses,
  addLiveClass,
  updateLiveClass,
  updateClassStatus,
  deleteLiveClass,
  type ClassStatus,
  type LiveClassPayload,
  type LiveClass,
} from '../features/admin/liveClassesSlice';
import AdminLayout from '../components/AdminLayout';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const DK = {
  gold:'#C59341', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', red:'#EF4444', blue:'#3B82F6', orange:'#F59E0B', purple:'#8B5CF6',
};
const card = (e: React.CSSProperties = {}): React.CSSProperties => ({
  background:'#FFFFFF', borderRadius:16, padding:20,
  boxShadow:'0 2px 16px rgba(0,0,0,0.06)', border:'1px solid #EDE3CE', ...e,
});
const btn = (v:'gold'|'outline'|'danger'='gold'): React.CSSProperties => ({
  padding:'9px 20px', borderRadius:12, border: v==='outline'?'1px solid #EDE3CE':'none',
  background: v==='gold'?'#C59341': v==='danger'?'#EF4444':'#FFFFFF',
  color: v==='outline'?'#1B2038':'#fff', fontWeight:700, fontSize:13, cursor:'pointer',
  fontFamily:"'Cairo',sans-serif",
});
const inp = (focused=false): React.CSSProperties => ({
  background:'#FFFFFF', border:`1.5px solid ${focused?'#C59341':'#EDE3CE'}`,
  color:'#1B2038', borderRadius:12, padding:'10px 14px', fontSize:13,
  width:'100%', outline:'none', fontFamily:"'Cairo',sans-serif",
});
const TH: React.CSSProperties = {
  padding:'11px 16px', textAlign:'right', color:'#6B7280', fontSize:12,
  fontWeight:700, background:'#F8F5EE', borderBottom:'1px solid #EDE3CE',
};
const TD: React.CSSProperties = {
  padding:'12px 16px', borderBottom:'1px solid #F3EDE0', fontSize:13, color:'#1B2038',
};

function Modal({ title, onClose, children }: { title:string; onClose:()=>void; children:ReactNode }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>
      <div style={{background:'#fff',borderRadius:20,padding:28,width:500,maxWidth:'95vw',maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <h2 style={{color:'#1B2038',fontWeight:900,fontSize:17,margin:0}}>{title}</h2>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:8,border:'1px solid #EDE3CE',background:'transparent',cursor:'pointer',fontSize:16,color:'#6B7280'}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatusBadge({ label, color, bg, pulse=false }: { label:string; color:string; bg:string; pulse?:boolean }) {
  return (
    <span style={{padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:bg,color,display:'inline-flex',alignItems:'center',gap:5}}>
      {pulse && (
        <span style={{width:7,height:7,borderRadius:'50%',background:color,display:'inline-block',animation:'pulse 1.5s ease-in-out infinite'}} />
      )}
      {label}
    </span>
  );
}

const STATUS_LABELS: Record<ClassStatus, string> = {
  scheduled: 'مجدولة',
  live:      'جارية الآن',
  ended:     'انتهت',
};

const STATUS_COLORS: Record<ClassStatus, { color:string; bg:string }> = {
  scheduled: { color:'#3B82F6', bg:'rgba(59,130,246,0.1)'  },
  live:      { color:'#10B981', bg:'rgba(16,185,129,0.1)'  },
  ended:     { color:'#9CA3AF', bg:'#F3F4F6'               },
};

const TABS: { value: ClassStatus | null; label: string }[] = [
  { value: null,        label: 'الكل'     },
  { value: 'scheduled', label: 'مجدولة'  },
  { value: 'live',      label: 'جارية'   },
  { value: 'ended',     label: 'منتهية'  },
];

function toLocalInput(dateStr: string): string {
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const emptyForm: LiveClassPayload = {
  course_id: 0, teacher_id: 0, title: '',
  description: '', scheduled_at: '', duration_minutes: 60,
  session_type: 'group', student_id: null,
};

export default function LiveClassesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { list: courses }          = useAppSelector((s) => s.courses);
  const { list: allUsers }         = useAppSelector((s) => s.adminUsers);
  const { list: classes, loading } = useAppSelector((s) => s.liveClasses);

  const teachers = allUsers.filter((u) => u.role === 'teacher');
  const students = allUsers.filter((u) => u.role === 'student');

  const [activeTab, setActiveTab]   = useState<ClassStatus | null>(null);
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState<LiveClass | null>(null);
  const [form, setForm]             = useState<LiveClassPayload>(emptyForm);
  const [addError, setAddError]     = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [deleting, setDeleting]     = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: number; label: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [focused, setFocused]       = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCourses(null));
    dispatch(fetchUsers(null));
    dispatch(fetchLiveClasses(null));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchLiveClasses(activeTab));
  }, [dispatch, activeTab]);

  const openModal = () => {
    setEditTarget(null);
    setForm({
      ...emptyForm,
      course_id:  courses[0]?.id  ?? 0,
      teacher_id: teachers[0]?.id ?? 0,
    });
    setAddError(null);
    setShowModal(true);
  };

  const openEdit = (cls: LiveClass) => {
    setEditTarget(cls);
    setForm({
      course_id: cls.course_id,
      teacher_id: cls.teacher_id,
      title: cls.title,
      description: cls.description ?? '',
      scheduled_at: cls.scheduled_at,
      duration_minutes: cls.duration_minutes,
      session_type: cls.session_type,
      student_id: cls.student_id,
    });
    setAddError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setAddError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setAddError('عنوان الحصة مطلوب'); return; }
    if (!form.scheduled_at) { setAddError('حدد موعد الحصة'); return; }
    if (!editTarget) {
      if (!form.course_id)    { setAddError('اختر الدورة الدراسية'); return; }
      if (!form.teacher_id)   { setAddError('اختر المعلم'); return; }
      if (form.session_type === 'individual' && !form.student_id) { setAddError('اختر الطالب للحصة الفردية'); return; }
    }
    setAddLoading(true);
    setAddError(null);
    const result = editTarget
      ? await dispatch(updateLiveClass({
          id: editTarget.id,
          title: form.title.trim(),
          scheduled_at: form.scheduled_at,
          duration_minutes: form.duration_minutes,
          description: form.description,
        }))
      : await dispatch(addLiveClass(form));
    setAddLoading(false);
    if (
      (editTarget && updateLiveClass.fulfilled.match(result)) ||
      (!editTarget && addLiveClass.fulfilled.match(result))
    ) {
      closeModal();
    } else {
      setAddError(result.payload as string);
    }
  };

  const handleStatusChange = async (id: number, status: ClassStatus) => {
    setUpdatingStatus(id);
    await dispatch(updateClassStatus({ id, status }));
    setUpdatingStatus(null);
  };

  const askDelete = (id: number, label: string) => {
    setDeleteError(null);
    setPendingDelete({ id, label });
  };

  const confirmPendingDelete = async () => {
    if (!pendingDelete) return;
    setDeleteBusy(true);
    setDeleteError(null);
    setDeleting(pendingDelete.id);
    try {
      await dispatch(deleteLiveClass(pendingDelete.id));
      setPendingDelete(null);
    } catch {
      setDeleteError('تعذّر حذف الحصة');
    } finally {
      setDeleting(null);
      setDeleteBusy(false);
    }
  };

  const nextStatus: Record<ClassStatus, { label: string; value: ClassStatus; color:string; bg:string } | null> = {
    scheduled: { label:'بدء',   value:'live',  color:'#10B981', bg:'rgba(16,185,129,0.1)'  },
    live:      { label:'إنهاء', value:'ended', color:'#EF4444', bg:'rgba(239,68,68,0.1)'    },
    ended:     null,
  };

  const liveSessions = classes.filter(c => c.status === 'live');

  return (
    <AdminLayout>
      <div style={{ fontFamily:"'Cairo',sans-serif", background: DK.bg, minHeight:'100vh', padding:24 }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:4, height:28, borderRadius:4, background: DK.goldGrad }} />
            <div>
              <h1 style={{ margin:0, fontSize:22, fontWeight:900, color: DK.text }}>الحصص المباشرة</h1>
              <p style={{ margin:0, fontSize:12, color: DK.sub, marginTop:2 }}>مراقبة وإدارة جلسات البث الحي</p>
            </div>
          </div>
          <button onClick={openModal} style={{ ...btn('gold'), display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:16, fontWeight:400 }}>+</span> إنشاء حصة جديدة
          </button>
        </div>

        {/* Live sessions banner */}
        {liveSessions.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <span style={{ width:10, height:10, borderRadius:'50%', background:'#10B981', display:'inline-block', animation:'pulse 1.5s ease-in-out infinite' }} />
              <span style={{ fontSize:13, fontWeight:800, color: DK.green }}>مباشر الآن ({liveSessions.length})</span>
            </div>
            <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
              {liveSessions.map(cls => (
                <div key={cls.id} style={{
                  background:'#fff',
                  border:'2px solid #10B981',
                  boxShadow:'0 0 0 4px rgba(16,185,129,0.1), 0 4px 20px rgba(0,0,0,0.08)',
                  borderRadius:16,
                  padding:'16px 20px',
                  minWidth:260,
                  display:'flex',
                  alignItems:'center',
                  gap:14,
                }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:'rgba(16,185,129,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                    📡
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                      <span style={{ width:8, height:8, borderRadius:'50%', background:'#10B981', display:'inline-block', animation:'pulse 1.5s ease-in-out infinite' }} />
                      <span style={{ fontSize:11, fontWeight:800, color:'#10B981' }}>مباشر الآن</span>
                    </div>
                    <p style={{ margin:0, fontWeight:800, color: DK.text, fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{cls.title}</p>
                    <p style={{ margin:'2px 0 0', fontSize:11, color: DK.sub }}>{cls.teacher?.name ?? '—'}</p>
                  </div>
                  {cls.agora_channel && (
                    <button onClick={() => navigate(`/live/${cls.agora_channel}?classId=${cls.id}`)}
                      style={{ padding:'7px 14px', borderRadius:10, border:'none', background: DK.goldGrad, color:'#fff', fontWeight:800, fontSize:12, cursor:'pointer', fontFamily:"'Cairo',sans-serif", flexShrink:0 }}>
                      دخول
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status filter tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
          {TABS.map(tab => {
            const count = tab.value ? classes.filter(c => c.status === tab.value).length : classes.length;
            const isActive = activeTab === tab.value;
            return (
              <button key={String(tab.value)} onClick={() => setActiveTab(tab.value)}
                style={{
                  borderRadius:10, padding:'8px 20px', border:'none', cursor:'pointer',
                  fontFamily:"'Cairo',sans-serif", fontSize:13, fontWeight:700,
                  background: isActive ? DK.gold : 'transparent',
                  color: isActive ? '#fff' : DK.sub,
                  transition:'all 0.15s',
                }}>
                {tab.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Main table */}
        <div style={{ ...card({ padding:0 }), overflowX:'auto' }}>
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:60 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', border:`3px solid rgba(197,147,65,0.15)`, borderTopColor: DK.gold, animation:'spin 0.8s linear infinite' }} />
            </div>
          ) : classes.length === 0 ? (
            <p style={{ textAlign:'center', padding:60, color: DK.sub, fontSize:14 }}>لا توجد حصص بعد.</p>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr>
                  {['#','العنوان','الدورة الدراسية','المعلم المسؤول','وقت البدء','الرابط','الحالة','إجراءات'].map(h => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classes.map((cls, idx) => {
                  const sc = STATUS_COLORS[cls.status];
                  const next = nextStatus[cls.status];
                  return (
                    <tr key={cls.id}
                      onMouseEnter={e => (e.currentTarget.style.background='rgba(197,147,65,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                      <td style={{ ...TD, width:48, color: DK.dim, fontWeight:700 }}>{idx + 1}</td>
                      <td style={TD}>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <p style={{ margin:0, fontWeight:700, color: DK.text }}>{cls.title}</p>
                          {cls.session_type === 'individual' && (
                            <span style={{ padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:800, background:'rgba(139,92,246,0.1)', color: DK.purple, flexShrink:0 }}>
                              فردية 1:1{cls.student?.name ? ` — ${cls.student.name}` : ''}
                            </span>
                          )}
                        </div>
                        {cls.agora_channel && (
                          <p style={{ margin:'2px 0 0', fontSize:11, color: DK.green, display:'flex', alignItems:'center', gap:4 }}>
                            <span style={{ width:6, height:6, borderRadius:'50%', background:'#10B981', display:'inline-block' }} />
                            قناة Agora داخلية
                          </p>
                        )}
                      </td>
                      <td style={{ ...TD, color: DK.sub }}>{cls.course?.title ?? '—'}</td>
                      <td style={{ ...TD, color: DK.sub }}>{cls.teacher?.name ?? '—'}</td>
                      <td style={{ ...TD, color: DK.sub, fontSize:12, direction:'ltr', unicodeBidi:'embed', whiteSpace:'nowrap' }}>
                        {new Date(cls.scheduled_at).toLocaleString('ar-EG')}
                      </td>
                      <td style={TD}>
                        {(cls as any).link ? (
                          <a href={(cls as any).link} target="_blank" rel="noreferrer"
                            style={{ color: DK.blue, fontSize:12, textDecoration:'underline', wordBreak:'break-all' }}>
                            {(cls as any).link}
                          </a>
                        ) : (
                          <span style={{ color: DK.dim, fontSize:12 }}>—</span>
                        )}
                      </td>
                      <td style={TD}>
                        <StatusBadge
                          label={STATUS_LABELS[cls.status]}
                          color={sc.color}
                          bg={sc.bg}
                          pulse={cls.status === 'live'}
                        />
                      </td>
                      <td style={TD}>
                        <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
                          <button onClick={() => openEdit(cls)} title="تعديل"
                            style={{
                              padding:'5px 12px', borderRadius:8, border:'1px solid #EDE3CE',
                              background:'#fff', color: DK.gold,
                              fontWeight:700, fontSize:12, cursor:'pointer',
                              fontFamily:"'Cairo',sans-serif",
                            }}>
                            ✏️
                          </button>
                          {next && (
                            <button onClick={() => handleStatusChange(cls.id, next.value)}
                              disabled={updatingStatus === cls.id}
                              style={{
                                padding:'5px 14px', borderRadius:8, border:'none',
                                background: next.bg, color: next.color,
                                fontWeight:800, fontSize:12, cursor:'pointer',
                                fontFamily:"'Cairo',sans-serif",
                                opacity: updatingStatus === cls.id ? 0.5 : 1,
                              }}>
                              {updatingStatus === cls.id ? '...' : next.label}
                            </button>
                          )}
                          {cls.status === 'live' && cls.agora_channel && (
                            <button onClick={() => navigate(`/live/${cls.agora_channel}?classId=${cls.id}`)}
                              style={{ padding:'5px 14px', borderRadius:8, border:'none', background: DK.goldGrad, color:'#fff', fontWeight:800, fontSize:12, cursor:'pointer', fontFamily:"'Cairo',sans-serif", display:'flex', alignItems:'center', gap:4 }}>
                              <span style={{ width:6, height:6, borderRadius:'50%', background:'#EF4444', display:'inline-block', animation:'pulse 1.5s ease-in-out infinite' }} />
                              دخول مباشر
                            </button>
                          )}
                          {(cls.status === 'scheduled' || cls.status === 'ended') && (
                            <button onClick={() => askDelete(cls.id, cls.title)} disabled={deleting === cls.id}
                              style={{
                                padding:'5px 12px', borderRadius:8, border:'1px solid #EDE3CE',
                                background:'#fff', color: DK.sub,
                                fontWeight:700, fontSize:12, cursor:'pointer',
                                fontFamily:"'Cairo',sans-serif",
                                opacity: deleting === cls.id ? 0.5 : 1,
                              }}>
                              {deleting === cls.id ? '...' : '🗑️'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Live Class Modal */}
      {showModal && (
        <Modal title={editTarget ? `تعديل ${editTarget.title}` : 'إنشاء حصة مباشرة جديدة'} onClose={closeModal}>
          <form onSubmit={handleSubmit}>
            {!editTarget && (
              <>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>الدورة الدراسية</label>
              <select value={form.course_id} onChange={e => setForm({...form, course_id: Number(e.target.value)})}
                style={{ ...inp(focused==='course'), cursor:'pointer' }}
                onFocus={() => setFocused('course')} onBlur={() => setFocused(null)}>
                <option value={0} disabled>اختر الدورة الدراسية</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>المعلم المسؤول</label>
              <select value={form.teacher_id} onChange={e => setForm({...form, teacher_id: Number(e.target.value)})}
                style={{ ...inp(focused==='teacher'), cursor:'pointer' }}
                onFocus={() => setFocused('teacher')} onBlur={() => setFocused(null)}>
                <option value={0} disabled>اختر المعلم المسؤول</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {teachers.length === 0 && (
                <p style={{ fontSize:11, color: DK.orange, marginTop:4 }}>أضف معلمين أولاً من صفحة المستخدمين.</p>
              )}
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>نوع الحصة</label>
              <div style={{ display:'flex', gap:8 }}>
                {(['group', 'individual'] as const).map(t => (
                  <button key={t} type="button"
                    onClick={() => setForm({ ...form, session_type: t, student_id: t === 'group' ? null : form.student_id })}
                    style={{
                      flex:1, padding:'9px 0', borderRadius:10, cursor:'pointer', fontWeight:700, fontSize:12.5,
                      fontFamily:"'Cairo',sans-serif",
                      border: form.session_type === t ? 'none' : '1.5px solid #EDE3CE',
                      background: form.session_type === t ? DK.goldGrad : '#fff',
                      color: form.session_type === t ? '#fff' : DK.sub,
                    }}>
                    {t === 'group' ? 'جماعية (كل طلاب الدورة)' : 'فردية (طالب واحد 1:1)'}
                  </button>
                ))}
              </div>
            </div>
            {form.session_type === 'individual' && (
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>الطالب</label>
                <select value={form.student_id ?? 0} onChange={e => setForm({...form, student_id: Number(e.target.value)})}
                  style={{ ...inp(focused==='student'), cursor:'pointer' }}
                  onFocus={() => setFocused('student')} onBlur={() => setFocused(null)}>
                  <option value={0} disabled>اختر الطالب</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {students.length === 0 && (
                  <p style={{ fontSize:11, color: DK.orange, marginTop:4 }}>لا يوجد طلاب مسجّلون بعد.</p>
                )}
              </div>
            )}
              </>
            )}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>عنوان الحصة</label>
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                placeholder="مثال: الدرس الأول — المقدمة" required autoFocus
                style={inp(focused==='title')}
                onFocus={() => setFocused('title')} onBlur={() => setFocused(null)} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:14 }}>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>موعد الحصة</label>
                <input type="datetime-local" required
                  value={form.scheduled_at ? toLocalInput(form.scheduled_at) : ''}
                  onChange={e => setForm({...form, scheduled_at: new Date(e.target.value).toISOString()})}
                  dir="ltr"
                  style={inp(focused==='scheduled')}
                  onFocus={() => setFocused('scheduled')} onBlur={() => setFocused(null)} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>المدة (دقيقة)</label>
                <input type="number" min={15} max={480} value={form.duration_minutes}
                  onChange={e => setForm({...form, duration_minutes: Number(e.target.value)})}
                  dir="ltr"
                  style={inp(focused==='duration')}
                  onFocus={() => setFocused('duration')} onBlur={() => setFocused(null)} />
              </div>
            </div>
            {!editTarget && (
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:10, padding:'10px 14px', marginBottom:20 }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:'#10B981', display:'inline-block', flexShrink:0 }} />
              <p style={{ margin:0, fontSize:12, color:'#10B981' }}>سيتم إنشاء قناة Agora داخلية تلقائياً للحصة.</p>
            </div>
            )}
            {addError && (
              <p style={{ background:'rgba(239,68,68,0.08)', color:'#EF4444', borderRadius:10, padding:'10px 14px', fontSize:13, marginBottom:14 }}>{addError}</p>
            )}
            <div style={{ display:'flex', gap:10, marginTop: editTarget ? 6 : 0 }}>
              <button type="submit" disabled={addLoading}
                style={{ ...btn('gold'), flex:1, opacity: addLoading ? 0.7 : 1 }}>
                {addLoading ? 'جارٍ الحفظ...' : (editTarget ? 'حفظ التعديلات' : 'إنشاء الحصة')}
              </button>
              <button type="button" onClick={closeModal}
                style={{ ...btn('outline'), flex:1 }}>إلغاء</button>
            </div>
          </form>
        </Modal>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
      `}</style>
      <ConfirmDeleteModal
        open={!!pendingDelete}
        itemLabel={pendingDelete?.label}
        busy={deleteBusy}
        error={deleteError}
        onConfirm={() => void confirmPendingDelete()}
        onCancel={() => { if (!deleteBusy) { setPendingDelete(null); setDeleteError(null); } }}
      />
    </AdminLayout>
  );
}
