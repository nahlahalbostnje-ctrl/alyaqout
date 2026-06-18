import { useEffect, useState } from 'react';
import TeacherLayout from '../components/TeacherLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchTeacherHomework, createHomework, deleteHomework,
  fetchHomeworkSubmissions, gradeHomeworkSubmission,
} from '../features/teacher/examSlice';

export default function TeacherHomeworkPage() {
  const dispatch = useAppDispatch();
  const { homeworks, hwSubmissions, loading, saving } = useAppSelector((s) => s.teacherExams);
  const courses = useAppSelector((s) => s.teacher.courses);

  const [showModal, setShowModal]   = useState(false);
  const [viewSubs, setViewSubs]     = useState<number | null>(null);
  const [gradeForm, setGradeForm]   = useState<Record<number, { grade: string; feedback: string }>>({});

  const [form, setForm] = useState({ course_id: '', title: '', description: '', due_date: '' });

  useEffect(() => {
    dispatch(fetchTeacherHomework());
  }, [dispatch]);

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

  const statusColor = (s: string) =>
    s === 'approved' ? 'bg-green-100 text-green-700' :
    s === 'rejected' ? 'bg-red-100 text-red-700' :
    'bg-amber-100 text-amber-700';

  const statusLabel = (s: string) =>
    s === 'approved' ? 'معتمد' : s === 'rejected' ? 'مرفوض' : 'بانتظار الموافقة';

  return (
    <TeacherLayout>
      <div className="p-6" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">واجباتي</h1>
            <p className="text-gray-400 text-sm mt-0.5">{homeworks.length} واجب</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl text-white text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}>
            + إضافة واجب
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : homeworks.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3 text-gray-400">
            <svg className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p>لا توجد واجبات بعد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {homeworks.map((hw) => (
              <div key={hw.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-gray-800 font-semibold">{hw.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(hw.status)}`}>
                        {statusLabel(hw.status)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">{hw.course?.title} · التسليم: {hw.due_date}</p>
                    <p className="text-gray-400 text-xs">{hw.submissions_count} تسليم</p>
                  </div>
                  <div className="flex gap-2">
                    {hw.status === 'approved' && (
                      <button onClick={() => handleViewSubs(hw.id)}
                        className="text-xs text-teal-600 hover:text-teal-800 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition">
                        التسليمات
                      </button>
                    )}
                    <button onClick={() => dispatch(deleteHomework(hw.id))}
                      className="text-xs text-red-400 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 transition">
                      حذف
                    </button>
                  </div>
                </div>

                {viewSubs === hw.id && (
                  <div className="mt-4 border-t border-gray-100 pt-4 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">تسليمات الطلاب</p>
                      <button onClick={() => setViewSubs(null)} className="text-xs text-gray-400">إغلاق</button>
                    </div>
                    {(hwSubmissions[hw.id] ?? []).length === 0 ? (
                      <p className="text-gray-400 text-xs">لا توجد تسليمات</p>
                    ) : (hwSubmissions[hw.id] ?? []).map((sub) => (
                      <div key={sub.id} className="bg-gray-50 rounded-xl px-4 py-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">{sub.student.name}</span>
                          {sub.file_url && (
                            <a href={sub.file_url} target="_blank" rel="noreferrer"
                              className="text-xs text-teal-600 hover:underline">
                              عرض الملف
                            </a>
                          )}
                        </div>
                        {sub.notes && <p className="text-xs text-gray-500">{sub.notes}</p>}
                        {sub.grade !== null ? (
                          <p className="text-xs font-bold text-green-600">الدرجة: {sub.grade}/100</p>
                        ) : (
                          <div className="flex gap-2 flex-wrap">
                            <input type="number" min="0" max="100" placeholder="الدرجة"
                              value={gradeForm[sub.id]?.grade ?? ''}
                              onChange={(e) => setGradeForm({ ...gradeForm, [sub.id]: { ...gradeForm[sub.id], grade: e.target.value } })}
                              className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center" />
                            <input placeholder="ملاحظة (اختياري)"
                              value={gradeForm[sub.id]?.feedback ?? ''}
                              onChange={(e) => setGradeForm({ ...gradeForm, [sub.id]: { ...gradeForm[sub.id], feedback: e.target.value } })}
                              className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-sm min-w-32" />
                            <button
                              onClick={() => dispatch(gradeHomeworkSubmission({
                                hwId: hw.id, subId: sub.id,
                                grade: parseFloat(gradeForm[sub.id]?.grade ?? '0'),
                                feedback: gradeForm[sub.id]?.feedback,
                              }))}
                              className="text-xs bg-teal-500 text-white px-3 py-1 rounded-lg">
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-gray-800 mb-5">إضافة واجب جديد</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" required>
                <option value="">اختر الكورس</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="عنوان الواجب" required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="وصف الواجب / التعليمات" rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 resize-none" />
              <div>
                <label className="text-xs text-gray-500 mb-1 block">تاريخ التسليم</label>
                <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}>
                  {saving ? 'جاري الحفظ...' : 'إضافة الواجب'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm">
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
