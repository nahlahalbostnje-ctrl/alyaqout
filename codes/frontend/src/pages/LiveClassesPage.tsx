import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchCourses } from '../features/admin/coursesSlice';
import { fetchUsers }   from '../features/admin/usersSlice';
import {
  fetchLiveClasses,
  addLiveClass,
  updateClassStatus,
  deleteLiveClass,
  type ClassStatus,
  type LiveClassPayload,
} from '../features/admin/liveClassesSlice';
import AdminLayout from '../components/AdminLayout';

const DK = {
  card:    { background: '#070e22', border: '1px solid rgba(245,166,35,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  gold:    '#f5a623',
  goldL:   '#ffd166',
  navy:    '#040a18',
  dimTxt:  'rgba(255,255,255,0.4)',
  inputStyle: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(245,166,35,0.15)',
    color: '#fff',
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
  } as React.CSSProperties,
};

const STATUS_LABELS: Record<ClassStatus, string> = {
  scheduled: 'مجدولة',
  live:      'جارية الآن',
  ended:     'انتهت',
};

const STATUS_STYLES: Record<ClassStatus, React.CSSProperties> = {
  scheduled: { background: 'rgba(96,165,250,0.12)',  color: '#60a5fa', border: '1px solid rgba(96,165,250,0.2)' },
  live:      { background: 'rgba(52,211,153,0.12)',  color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' },
  ended:     { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' },
};

const TABS: { value: ClassStatus | null; label: string }[] = [
  { value: null,        label: 'الكل' },
  { value: 'scheduled', label: 'مجدولة' },
  { value: 'live',      label: 'جارية' },
  { value: 'ended',     label: 'منتهية' },
];

function toLocalInput(dateStr: string): string {
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const emptyForm: LiveClassPayload = {
  course_id: 0, teacher_id: 0, title: '',
  description: '', scheduled_at: '', duration_minutes: 60,
};

export default function LiveClassesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { list: courses }           = useAppSelector((s) => s.courses);
  const { list: allUsers }          = useAppSelector((s) => s.adminUsers);
  const { list: classes, loading }  = useAppSelector((s) => s.liveClasses);

  const teachers = allUsers.filter((u) => u.role === 'teacher');

  const [activeTab, setActiveTab]   = useState<ClassStatus | null>(null);
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState<LiveClassPayload>(emptyForm);
  const [addError, setAddError]     = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [deleting, setDeleting]     = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchCourses(null));
    dispatch(fetchUsers(null));
    dispatch(fetchLiveClasses(null));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchLiveClasses(activeTab));
  }, [dispatch, activeTab]);

  const openModal = () => {
    setForm({
      ...emptyForm,
      course_id:  courses[0]?.id  ?? 0,
      teacher_id: teachers[0]?.id ?? 0,
    });
    setAddError(null);
    setShowModal(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.course_id)   { setAddError('اختر الدورة'); return; }
    if (!form.teacher_id)  { setAddError('اختر المعلم'); return; }
    if (!form.scheduled_at){ setAddError('حدد موعد الحصة'); return; }
    setAddLoading(true);
    setAddError(null);
    const result = await dispatch(addLiveClass(form));
    setAddLoading(false);
    if (addLiveClass.fulfilled.match(result)) {
      setShowModal(false);
    } else {
      setAddError(result.payload as string);
    }
  };

  const handleStatusChange = async (id: number, status: ClassStatus) => {
    setUpdatingStatus(id);
    await dispatch(updateClassStatus({ id, status }));
    setUpdatingStatus(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الحصة؟')) return;
    setDeleting(id);
    await dispatch(deleteLiveClass(id));
    setDeleting(null);
  };

  const nextStatus: Record<ClassStatus, { label: string; value: ClassStatus } | null> = {
    scheduled: { label: 'بدء الحصة', value: 'live' },
    live:      { label: 'إنهاء الحصة', value: 'ended' },
    ended:     null,
  };

  return (
    <AdminLayout>
      <div className="p-8 min-h-screen" style={{ fontFamily: "'Cairo', sans-serif" }}>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(180deg, ${DK.gold}, ${DK.goldL})` }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: DK.gold, opacity: 0.65 }}>البث المباشر</span>
              </div>
              <h1 className="text-2xl font-black text-white">الحصص المباشرة</h1>
            </div>
            <button
              onClick={openModal}
              className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: `linear-gradient(135deg, ${DK.gold}, ${DK.goldL})`, color: DK.navy, boxShadow: '0 4px 18px rgba(245,166,35,0.3)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              جدولة حصة
            </button>
          </div>
          <div className="mt-5 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(245,166,35,0.2), transparent)' }} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map((tab) => {
            const count = tab.value
              ? classes.filter((c) => c.status === tab.value).length
              : classes.length;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={String(tab.value)}
                onClick={() => setActiveTab(tab.value)}
                className="text-sm px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 font-semibold"
                style={isActive
                  ? { background: `linear-gradient(135deg, ${DK.gold}, ${DK.goldL})`, color: DK.navy }
                  : { background: 'rgba(255,255,255,0.05)', color: DK.dimTxt, border: '1px solid rgba(255,255,255,0.08)' }
                }
              >
                {tab.label}
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={isActive
                    ? { background: 'rgba(4,10,24,0.25)', color: DK.navy }
                    : { background: 'rgba(255,255,255,0.08)', color: DK.dimTxt }
                  }
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={DK.card}>
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 rounded-full border-2 animate-spin"
                style={{ borderColor: 'rgba(245,166,35,0.2)', borderTopColor: DK.gold }} />
            </div>
          ) : classes.length === 0 ? (
            <p className="text-center py-16 text-sm font-semibold" style={{ color: DK.dimTxt }}>
              لا توجد حصص بعد.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(245,166,35,0.04)', borderBottom: '1px solid rgba(245,166,35,0.08)' }}>
                  {['الحصة', 'الدورة', 'المعلم', 'الموعد', 'المدة', 'الحالة', 'إجراءات'].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wide"
                      style={{ color: 'rgba(245,166,35,0.55)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => {
                  const next = nextStatus[cls.status];
                  return (
                    <tr
                      key={cls.id}
                      className="transition-colors"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(245,166,35,0.025)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                    >
                      <td className="px-4 py-4">
                        <p className="font-bold text-white">{cls.title}</p>
                        {cls.agora_channel && (
                          <span className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#34d399' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                            قناة Agora داخلية
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4" style={{ color: DK.dimTxt }}>{cls.course?.title ?? '—'}</td>
                      <td className="px-4 py-4" style={{ color: DK.dimTxt }}>{cls.teacher?.name ?? '—'}</td>
                      <td className="px-4 py-4 text-xs" dir="ltr" style={{ color: DK.dimTxt }}>
                        {new Date(cls.scheduled_at).toLocaleString('ar-EG')}
                      </td>
                      <td className="px-4 py-4" style={{ color: DK.dimTxt }}>{cls.duration_minutes} د</td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={STATUS_STYLES[cls.status]}>
                          {cls.status === 'live' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />}
                          {STATUS_LABELS[cls.status]}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1.5 flex-wrap items-center">
                          {next && (
                            <button
                              onClick={() => handleStatusChange(cls.id, next.value)}
                              disabled={updatingStatus === cls.id}
                              className="text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80 disabled:opacity-40"
                              style={next.value === 'live'
                                ? { background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }
                                : { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }
                              }
                            >
                              {updatingStatus === cls.id ? '...' : next.label}
                            </button>
                          )}
                          {cls.status === 'live' && cls.agora_channel && (
                            <button
                              onClick={() => navigate(`/live/${cls.agora_channel}?classId=${cls.id}`)}
                              className="text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all hover:opacity-80"
                              style={{ background: `linear-gradient(135deg, ${DK.gold}, ${DK.goldL})`, color: DK.navy }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse inline-block" />
                              دخول مباشر
                            </button>
                          )}
                          {cls.status === 'scheduled' && (
                            <button
                              onClick={() => handleDelete(cls.id)}
                              disabled={deleting === cls.id}
                              className="text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80 disabled:opacity-40"
                              style={{ background: 'rgba(255,255,255,0.05)', color: DK.dimTxt, border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                              {deleting === cls.id ? '...' : 'حذف'}
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

      {/* Schedule Modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{ background: '#070e22', border: '1px solid rgba(245,166,35,0.15)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">جدولة حصة مباشرة</h3>
              <button onClick={() => setShowModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-lg leading-none hover:bg-white/10 transition"
                style={{ color: DK.dimTxt }}>×</button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'rgba(245,166,35,0.6)' }}>الدورة</label>
                <select
                  value={form.course_id}
                  onChange={(e) => setForm({ ...form, course_id: Number(e.target.value) })}
                  style={{ ...DK.inputStyle }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(245,166,35,0.4)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(245,166,35,0.15)')}
                >
                  <option value={0} style={{ background: '#070e22' }} disabled>اختر الدورة</option>
                  {courses.map((c) => <option key={c.id} value={c.id} style={{ background: '#070e22' }}>{c.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'rgba(245,166,35,0.6)' }}>المعلم</label>
                <select
                  value={form.teacher_id}
                  onChange={(e) => setForm({ ...form, teacher_id: Number(e.target.value) })}
                  style={{ ...DK.inputStyle }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(245,166,35,0.4)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(245,166,35,0.15)')}
                >
                  <option value={0} style={{ background: '#070e22' }} disabled>اختر المعلم</option>
                  {teachers.map((t) => <option key={t.id} value={t.id} style={{ background: '#070e22' }}>{t.name}</option>)}
                </select>
                {teachers.length === 0 && (
                  <p className="text-xs mt-1" style={{ color: '#fbbf24' }}>أضف معلمين أولاً من صفحة المستخدمين.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'rgba(245,166,35,0.6)' }}>عنوان الحصة</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="مثال: الدرس الأول — المقدمة"
                  required
                  autoFocus
                  style={DK.inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(245,166,35,0.4)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(245,166,35,0.15)')}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'rgba(245,166,35,0.6)' }}>موعد الحصة</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.scheduled_at ? toLocalInput(form.scheduled_at) : ''}
                    onChange={(e) => setForm({ ...form, scheduled_at: new Date(e.target.value).toISOString() })}
                    dir="ltr"
                    style={{ ...DK.inputStyle, colorScheme: 'dark' }}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(245,166,35,0.4)')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(245,166,35,0.15)')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'rgba(245,166,35,0.6)' }}>المدة (دقيقة)</label>
                  <input
                    type="number"
                    min={15}
                    max={480}
                    value={form.duration_minutes}
                    onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                    dir="ltr"
                    style={DK.inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(245,166,35,0.4)')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(245,166,35,0.15)')}
                  />
                </div>
              </div>

              <div
                className="flex items-center gap-2 py-3 px-4 rounded-xl"
                style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <p className="text-xs" style={{ color: '#34d399' }}>سيتم إنشاء قناة Agora داخلية تلقائياً للحصة.</p>
              </div>

              {addError && (
                <p className="text-xs px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}>
                  {addError}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${DK.gold}, ${DK.goldL})`, color: DK.navy }}
                >
                  {addLoading ? 'جاري الجدولة...' : 'جدولة'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                  style={{ background: 'rgba(255,255,255,0.05)', color: DK.dimTxt }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
