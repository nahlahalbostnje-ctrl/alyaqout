import { useEffect, useState } from 'react';
import TeacherLayout from '../components/TeacherLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchTeacherHomework, createHomework, deleteHomework,
  fetchHomeworkSubmissions, gradeHomeworkSubmission,
} from '../features/teacher/examSlice';

const DK = {
  card:   { background: '#070e22', border: '1px solid rgba(245,166,35,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  gold:   '#f5a623',
  navy:   '#040a18',
  dimTxt: 'rgba(255,255,255,0.4)',
};

const baseInput: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(245,166,35,0.15)',
  color: '#fff',
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

  async function handleViewSubs(hwId: number) {
    setViewSubs(hwId);
    if (!hwSubmissions[hwId]) dispatch(fetchHomeworkSubmissions(hwId));
  }

  const statusStyle = (s: string): React.CSSProperties =>
    s === 'approved' ? { background: 'rgba(52,211,153,0.12)', color: '#34d399' } :
    s === 'rejected' ? { background: 'rgba(239,68,68,0.1)',   color: '#f87171' } :
    { background: 'rgba(245,158,11,0.12)', color: '#fbbf24' };

  const statusLabel = (s: string) =>
    s === 'approved' ? 'معتمد' : s === 'rejected' ? 'مرفوض' : 'بانتظار الموافقة';

  return (
    <TeacherLayout>
      <div className="p-6" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f5a623, #ffd166)' }} />
            <div>
              <h1 className="text-xl font-bold text-white">واجباتي</h1>
              <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>{homeworks.length} واجب</p>
            </div>
          </div>
          <button onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #f5a623, #ffd166)', color: '#040a18' }}>
            + إضافة واجب
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(245,166,35,0.2)', borderTopColor: '#f5a623' }} />
          </div>
        ) : homeworks.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3" style={{ color: DK.dimTxt }}>
            <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p>لا توجد واجبات بعد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {homeworks.map((hw) => (
              <div key={hw.id} className="p-5 rounded-2xl" style={DK.card}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white">{hw.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={statusStyle(hw.status)}>
                        {statusLabel(hw.status)}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: DK.dimTxt }}>{hw.course?.title} · التسليم: {hw.due_date}</p>
                    <p className="text-xs" style={{ color: DK.dimTxt }}>{hw.submissions_count} تسليم</p>
                  </div>
                  <div className="flex gap-2">
                    {hw.status === 'approved' && (
                      <button onClick={() => handleViewSubs(hw.id)}
                        className="text-xs px-3 py-1.5 rounded-lg transition"
                        style={{ background: 'rgba(245,166,35,0.08)', color: DK.gold }}>
                        التسليمات
                      </button>
                    )}
                    <button onClick={() => dispatch(deleteHomework(hw.id))}
                      className="text-xs px-2 py-1.5 rounded-lg transition"
                      style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171' }}>
                      حذف
                    </button>
                  </div>
                </div>

                {viewSubs === hw.id && (
                  <div className="mt-4 pt-4 space-y-2" style={{ borderTop: '1px solid rgba(245,166,35,0.08)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-white">تسليمات الطلاب</p>
                      <button onClick={() => setViewSubs(null)} className="text-xs" style={{ color: DK.dimTxt }}>إغلاق</button>
                    </div>
                    {(hwSubmissions[hw.id] ?? []).length === 0 ? (
                      <p className="text-xs" style={{ color: DK.dimTxt }}>لا توجد تسليمات</p>
                    ) : (hwSubmissions[hw.id] ?? []).map((sub) => (
                      <div key={sub.id} className="px-4 py-3 rounded-xl space-y-2"
                        style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">{sub.student.name}</span>
                          {sub.file_url && (
                            <a href={sub.file_url} target="_blank" rel="noreferrer"
                              className="text-xs" style={{ color: DK.gold }}>
                              عرض الملف
                            </a>
                          )}
                        </div>
                        {sub.notes && <p className="text-xs" style={{ color: DK.dimTxt }}>{sub.notes}</p>}
                        {sub.grade !== null ? (
                          <p className="text-xs font-bold" style={{ color: '#34d399' }}>الدرجة: {sub.grade}/100</p>
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
                              style={{ background: 'rgba(245,166,35,0.15)', color: DK.gold }}>
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
          style={{ background: 'rgba(4,10,24,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-lg p-6 rounded-2xl"
            style={{ background: '#070e22', border: '1px solid rgba(245,166,35,0.15)' }}>
            <h2 className="text-lg font-bold text-white mb-5">إضافة واجب جديد</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                style={{ ...baseInput, cursor: 'pointer' }} required>
                <option value="" style={{ background: '#070e22' }}>اختر الكورس</option>
                {courses.map((c) => <option key={c.id} value={c.id} style={{ background: '#070e22' }}>{c.title}</option>)}
              </select>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="عنوان الواجب" required style={baseInput} />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="وصف الواجب / التعليمات" rows={3}
                style={{ ...baseInput, resize: 'none' }} />
              <div>
                <label className="text-xs mb-1 block" style={{ color: DK.dimTxt }}>تاريخ التسليم</label>
                <input type="date" value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  required style={{ ...baseInput, colorScheme: 'dark' }} />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #f5a623, #ffd166)', color: '#040a18' }}>
                  {saving ? 'جاري الحفظ...' : 'إضافة الواجب'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm"
                  style={{ background: 'rgba(255,255,255,0.05)', color: DK.dimTxt }}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}
