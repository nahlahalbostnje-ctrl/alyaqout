import { useEffect, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchStudentHomework, submitHomework } from '../features/student/examSlice';

const statusConfig = {
  submitted: { label: 'مُسلَّم', color: 'bg-blue-100 text-blue-700' },
  graded:    { label: 'مُصحَّح', color: 'bg-green-100 text-green-700' },
  late:      { label: 'متأخر',   color: 'bg-red-100 text-red-700' },
};

export default function StudentHomeworkPage() {
  const dispatch = useAppDispatch();
  const { homeworks, loading, submitting } = useAppSelector((s) => s.studentExam);

  const [activeHw, setActiveHw] = useState<number | null>(null);
  const [form, setForm]         = useState({ file_url: '', notes: '' });
  const [flash, setFlash]       = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchStudentHomework());
  }, [dispatch]);

  async function handleSubmit(hwId: number) {
    if (!form.file_url.trim()) return;
    await dispatch(submitHomework({ homeworkId: hwId, file_url: form.file_url, notes: form.notes || undefined }));
    setFlash(hwId);
    setActiveHw(null);
    setForm({ file_url: '', notes: '' });
    setTimeout(() => setFlash(null), 3000);
  }

  const now = new Date();

  return (
    <StudentLayout>
      <div className="p-6" dir="rtl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">واجباتي</h1>
          <p className="text-gray-400 text-sm mt-0.5">{homeworks.length} واجب</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : homeworks.length === 0 ? (
          <div className="flex flex-col items-center py-24 gap-3 text-gray-400">
            <svg className="w-14 h-14 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p>لا توجد واجبات حالياً</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {homeworks.map((hw) => {
              const dueDate  = new Date(hw.due_date);
              const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const isOpen   = activeHw === hw.id;

              return (
                <div key={hw.id}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                    hw.is_overdue && !hw.submitted ? 'border-red-200' : 'border-gray-100'
                  }`}>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-gray-800">{hw.title}</h3>
                          {hw.submitted && hw.sub_status && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              statusConfig[hw.sub_status as keyof typeof statusConfig]?.color ?? 'bg-gray-100 text-gray-600'
                            }`}>
                              {statusConfig[hw.sub_status as keyof typeof statusConfig]?.label ?? hw.sub_status}
                            </span>
                          )}
                          {!hw.submitted && hw.is_overdue && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">منتهي</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{hw.course.title}</p>
                        {hw.description && (
                          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{hw.description}</p>
                        )}
                      </div>

                      <div className="flex-shrink-0 text-left">
                        <p className="text-xs text-gray-400">آخر موعد</p>
                        <p className={`text-sm font-bold ${
                          hw.is_overdue ? 'text-red-500' : daysLeft <= 2 ? 'text-amber-500' : 'text-gray-700'
                        }`}>
                          {hw.due_date}
                        </p>
                        {!hw.submitted && !hw.is_overdue && (
                          <p className="text-xs text-gray-400">
                            {daysLeft === 0 ? 'اليوم!' : `${daysLeft} يوم متبقي`}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Grade display */}
                    {hw.grade !== undefined && hw.grade !== null && (
                      <div className="mt-3 inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-bold text-green-700">الدرجة: {hw.grade}/100</span>
                      </div>
                    )}

                    {/* Flash success */}
                    {flash === hw.id && (
                      <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-sm text-green-700">
                        تم تسليم الواجب بنجاح
                      </div>
                    )}

                    {/* Submit button */}
                    {!hw.submitted && !hw.is_overdue && (
                      <button onClick={() => setActiveHw(isOpen ? null : hw.id)}
                        className="mt-3 px-4 py-2 rounded-xl text-white text-sm font-medium"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                        {isOpen ? 'إلغاء' : 'تسليم الواجب'}
                      </button>
                    )}
                  </div>

                  {/* Submit form */}
                  {isOpen && (
                    <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">رابط الملف / Google Drive</label>
                        <input
                          type="url"
                          value={form.file_url}
                          onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                          placeholder="https://drive.google.com/..."
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-400 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">ملاحظة للمعلم (اختياري)</label>
                        <textarea
                          rows={2}
                          value={form.notes}
                          onChange={(e) => setForm({ ...form, notes: e.target.value })}
                          placeholder="أي تعليق تريد إرساله..."
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-400 resize-none bg-white"
                        />
                      </div>
                      <button
                        onClick={() => handleSubmit(hw.id)}
                        disabled={submitting || !form.file_url.trim()}
                        className="w-full py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                        {submitting ? 'جاري التسليم...' : 'إرسال'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
