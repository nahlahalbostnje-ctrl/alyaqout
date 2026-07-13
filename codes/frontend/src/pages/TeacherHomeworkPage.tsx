import { useEffect, useState } from 'react';
import TeacherLayout from '../components/TeacherLayout';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchTeacherHomework, createHomework, deleteHomework,
  fetchHomeworkSubmissions, gradeHomeworkSubmission,
} from '../features/teacher/examSlice';

const TH = {
  pageBg:     '#F5EDD8',
  card:       { background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  gold:       '#C9952A',
  goldGrad:   'linear-gradient(135deg, #C9952A 0%, #DDAD50 100%)',
  goldBg:     'rgba(201,149,42,0.08)',
  goldBorder: 'rgba(201,149,42,0.2)',
  text:       '#1B2038',
  textSub:    '#6B7280',
  textDim:    '#9CA3AF',
  green:      '#10B981',
  greenBg:    'rgba(16,185,129,0.08)',
  greenBorder:'rgba(16,185,129,0.2)',
  red:        '#EF4444',
  redBg:      'rgba(239,68,68,0.08)',
  redBorder:  'rgba(239,68,68,0.2)',
  amber:      '#F59E0B',
  amberBg:    'rgba(245,158,11,0.08)',
  amberBorder:'rgba(245,158,11,0.2)',
};

const baseInput: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #EDE3CE',
  color: '#1B2038',
  borderRadius: '12px',
  padding: '10px 14px',
  fontSize: '13px',
  width: '100%',
  outline: 'none',
};

export default function TeacherHomeworkPage() {
  const dispatch = useAppDispatch();
  const { homeworks, hwSubmissions, loading, saving } = useAppSelector((s) => s.teacherExams);
  const courses = useAppSelector((s) => s.teacher.courses);

  const [showModal, setShowModal] = useState(false);
  const [viewSubs, setViewSubs]   = useState<number | null>(null);
  const [gradeForm, setGradeForm] = useState<Record<number, { grade: string; feedback: string }>>({});
  const [form, setForm] = useState({ course_id: '', title: '', description: '', due_date: '' });
  const [pendingDelete, setPendingDelete] = useState<{ id: number; label: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);


  useEffect(() => { dispatch(fetchTeacherHomework()); }, [dispatch]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await dispatch(createHomework({
      course_id:   parseInt(form.course_id),
      title:       form.title,
      description: form.description || undefined,
      due_date:    form.due_date,
    }));
    setShowModal(false);
    setForm({ course_id: '', title: '', description: '', due_date: '' });
  }


  async function confirmPendingDelete() {
    if (!pendingDelete) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await dispatch(deleteHomework(pendingDelete.id));
      setPendingDelete(null);
    } catch {
      setDeleteError('تعذّر حذف الواجب');
    } finally {
      setDeleteBusy(false);
    }
  }

  async function handleViewSubs(hwId: number) {
    setViewSubs(hwId);
    if (!hwSubmissions[hwId]) dispatch(fetchHomeworkSubmissions(hwId));
  }

  const statusStyle = (s: string): React.CSSProperties =>
    s === 'approved' ? { background: TH.greenBg, color: TH.green, border: `1px solid ${TH.greenBorder}` } :
    s === 'rejected' ? { background: TH.redBg,   color: TH.red,   border: `1px solid ${TH.redBorder}` } :
    { background: TH.amberBg, color: TH.amber, border: `1px solid ${TH.amberBorder}` };

  const statusLabel = (s: string) =>
    s === 'approved' ? 'معتمد' : s === 'rejected' ? 'مرفوض' : 'بانتظار الموافقة';

  return (
    <TeacherLayout>
      <div className="p-6 min-h-screen" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif", background: TH.pageBg }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: TH.goldGrad }} />
            <div>
              <h1 className="text-xl font-bold" style={{ color: TH.text }}>واجباتي</h1>
              <p className="text-xs mt-0.5" style={{ color: TH.textSub }}>{homeworks.length} واجب</p>
            </div>
          </div>
          <button onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: TH.goldGrad, color: '#fff' }}>
            + إضافة واجب
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: `2px solid ${TH.goldBorder}`, borderTopColor: TH.gold }} />
          </div>
        ) : homeworks.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3" style={{ color: TH.textDim }}>
            <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p>لا توجد واجبات بعد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {homeworks.map((hw) => (
              <div key={hw.id} className="p-5 rounded-2xl" style={TH.card}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold" style={{ color: TH.text }}>{hw.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={statusStyle(hw.status)}>
                        {statusLabel(hw.status)}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: TH.textSub }}>{hw.course?.title} · التسليم: {hw.due_date}</p>
                    <p className="text-xs" style={{ color: TH.textDim }}>{hw.submissions_count} تسليم</p>
                  </div>
                  <div className="flex gap-2">
                    {hw.status === 'approved' && (
                      <button onClick={() => handleViewSubs(hw.id)}
                        className="text-xs px-3 py-1.5 rounded-lg transition"
                        style={{ background: TH.goldBg, color: TH.gold, border: `1px solid ${TH.goldBorder}` }}>
                        التسليمات
                      </button>
                    )}
                    <button onClick={() => { setDeleteError(null); setPendingDelete({ id: hw.id, label: hw.title }); }}
                      className="text-xs px-2 py-1.5 rounded-lg transition"
                      style={{ background: TH.redBg, color: TH.red, border: `1px solid ${TH.redBorder}` }}>
                      حذف
                    </button>
                  </div>
                </div>

                {viewSubs === hw.id && (
                  <div className="mt-4 pt-4 space-y-2" style={{ borderTop: '1px solid #EDE3CE' }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium" style={{ color: TH.text }}>تسليمات الطلاب</p>
                      <button onClick={() => setViewSubs(null)} className="text-xs" style={{ color: TH.textDim }}>إغلاق</button>
                    </div>
                    {(hwSubmissions[hw.id] ?? []).length === 0 ? (
                      <p className="text-xs" style={{ color: TH.textDim }}>لا توجد تسليمات</p>
                    ) : (hwSubmissions[hw.id] ?? []).map((sub) => (
                      <div key={sub.id} className="px-4 py-3 rounded-xl space-y-2"
                        style={{ background: '#F9FAFB', border: '1px solid #EDE3CE' }}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium" style={{ color: TH.text }}>{sub.student.name}</span>
                          {sub.file_url && (
                            <a href={sub.file_url} target="_blank" rel="noreferrer"
                              className="text-xs" style={{ color: TH.gold }}>
                              عرض الملف
                            </a>
                          )}
                        </div>
                        {sub.notes && <p className="text-xs" style={{ color: TH.textSub }}>{sub.notes}</p>}
                        {sub.grade !== null ? (
                          <p className="text-xs font-bold" style={{ color: TH.green }}>الدرجة: {sub.grade}/100</p>
                        ) : (
                          <div className="flex gap-2 flex-wrap">
                            <input type="number" min="0" max="100" placeholder="الدرجة"
                              value={gradeForm[sub.id]?.grade ?? ''}
                              onChange={(e) => setGradeForm({ ...gradeForm, [sub.id]: { ...gradeForm[sub.id], grade: e.target.value } })}
                              style={{ ...baseInput, width: '80px', padding: '4px 8px', textAlign: 'center' }} />
                            <input placeholder="ملاحظة (اختياري)"
                              value={gradeForm[sub.id]?.feedback ?? ''}
                              onChange={(e) => setGradeForm({ ...gradeForm, [sub.id]: { ...gradeForm[sub.id], feedback: e.target.value } })}
                              style={{ ...baseInput, flex: 1, padding: '4px 8px', minWidth: '128px' }} />
                            <button
                              onClick={() => dispatch(gradeHomeworkSubmission({
                                hwId: hw.id, subId: sub.id,
                                grade: parseFloat(gradeForm[sub.id]?.grade ?? '0'),
                                feedback: gradeForm[sub.id]?.feedback,
                              }))}
                              className="text-xs px-3 py-1 rounded-lg"
                              style={{ background: TH.goldBg, color: TH.gold, border: `1px solid ${TH.goldBorder}` }}>
                              حفظ
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl"
          style={{ background: 'rgba(27,32,56,0.5)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-lg p-6 rounded-2xl"
            style={{ background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <h2 className="text-lg font-bold mb-5" style={{ color: TH.text }}>إضافة واجب جديد</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                style={{ ...baseInput, cursor: 'pointer' }} required>
                <option value="">اختر الكورس</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="عنوان الواجب" required style={baseInput} />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="وصف الواجب / التعليمات" rows={3}
                style={{ ...baseInput, resize: 'none' }} />
              <div>
                <label className="text-xs mb-1 block" style={{ color: TH.textSub }}>تاريخ التسليم</label>
                <input type="date" value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  required style={baseInput} />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                  style={{ background: TH.goldGrad, color: '#fff' }}>
                  {saving ? 'جاري الحفظ...' : 'إضافة الواجب'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm"
                  style={{ background: '#F9FAFB', border: '1px solid #EDE3CE', color: TH.text }}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDeleteModal
        open={!!pendingDelete}
        itemLabel={pendingDelete?.label}
        busy={deleteBusy}
        error={deleteError}
        onConfirm={() => void confirmPendingDelete()}
        onCancel={() => { if (!deleteBusy) { setPendingDelete(null); setDeleteError(null); } }}
      />
    </TeacherLayout>
  );
}
