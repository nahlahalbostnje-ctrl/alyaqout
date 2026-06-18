import { useEffect, useState } from 'react';
import TeacherLayout from '../components/TeacherLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchTeacherExams, createExam, deleteExam,
  fetchExamSubmissions, gradeExamSubmission,
} from '../features/teacher/examSlice';
import type { ExamQuestion } from '../features/teacher/examSlice';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:  { label: 'بانتظار الموافقة', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'معتمد',            color: 'bg-green-100 text-green-700' },
  rejected: { label: 'مرفوض',           color: 'bg-red-100 text-red-700' },
};

export default function TeacherExamsPage() {
  const dispatch = useAppDispatch();
  const { exams, submissions, loading, saving } = useAppSelector((s) => s.teacherExams);
  const courses = useAppSelector((s) => s.teacher.courses);

  const [showModal, setShowModal]         = useState(false);
  const [viewSubs, setViewSubs]           = useState<number | null>(null);
  const [gradeInput, setGradeInput]       = useState<Record<number, string>>({});

  const [form, setForm] = useState({
    course_id: '',
    title: '',
    description: '',
    duration: '',
  });

  const [questions, setQuestions] = useState<ExamQuestion[]>([
    { question: '', type: 'mcq', options: ['', '', '', ''], answer: '', points: 1 },
  ]);

  useEffect(() => {
    dispatch(fetchTeacherExams());
  }, [dispatch]);

  function addQuestion() {
    setQuestions([...questions, { question: '', type: 'mcq', options: ['', '', '', ''], answer: '', points: 1 }]);
  }

  function updateQuestion(i: number, field: keyof ExamQuestion, value: unknown) {
    const next = [...questions];
    (next[i] as Record<string, unknown>)[field] = value;
    if (field === 'type' && value === 'true_false') {
      next[i].options = ['صح', 'خطأ'];
    }
    setQuestions(next);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.course_id || !form.title || questions.length === 0) return;

    await dispatch(createExam({
      course_id:   parseInt(form.course_id),
      title:       form.title,
      description: form.description || undefined,
      duration:    form.duration ? parseInt(form.duration) : undefined,
      questions,
    }));

    setShowModal(false);
    setForm({ course_id: '', title: '', description: '', duration: '' });
    setQuestions([{ question: '', type: 'mcq', options: ['', '', '', ''], answer: '', points: 1 }]);
  }

  async function handleViewSubs(examId: number) {
    setViewSubs(examId);
    if (!submissions[examId]) dispatch(fetchExamSubmissions(examId));
  }

  return (
    <TeacherLayout>
      <div className="p-6" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">امتحاناتي</h1>
            <p className="text-gray-400 text-sm mt-0.5">{exams.length} امتحان</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl text-white text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}>
            + إنشاء امتحان
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : exams.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3 text-gray-400">
            <svg className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p>لا توجد امتحانات بعد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {exams.map((exam) => {
              const st = STATUS_MAP[exam.status];
              return (
                <div key={exam.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-gray-800 font-semibold">{exam.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                      </div>
                      <p className="text-gray-400 text-xs mt-1">
                        {exam.course?.title} · {exam.questions_count} سؤال
                        {exam.duration ? ` · ${exam.duration} دقيقة` : ''}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">{exam.submissions_count} تسليم</p>
                    </div>
                    <div className="flex gap-2">
                      {exam.status === 'approved' && (
                        <button onClick={() => handleViewSubs(exam.id)}
                          className="text-xs text-teal-600 hover:text-teal-800 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition">
                          التسليمات
                        </button>
                      )}
                      <button onClick={() => dispatch(deleteExam(exam.id))}
                        className="text-xs text-red-400 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 transition">
                        حذف
                      </button>
                    </div>
                  </div>

                  {/* Submissions panel */}
                  {viewSubs === exam.id && (
                    <div className="mt-4 border-t border-gray-100 pt-4 space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">تسليمات الطلاب</p>
                        <button onClick={() => setViewSubs(null)} className="text-xs text-gray-400">إغلاق</button>
                      </div>
                      {(submissions[exam.id] ?? []).length === 0 ? (
                        <p className="text-gray-400 text-xs">لا توجد تسليمات بعد</p>
                      ) : (submissions[exam.id] ?? []).map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                          <span className="text-sm text-gray-700">{sub.student.name}</span>
                          <div className="flex items-center gap-3">
                            {sub.score !== null ? (
                              <span className="text-sm font-bold text-teal-600">{sub.score} / {sub.total_points}</span>
                            ) : (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number" min="0" placeholder="الدرجة"
                                  value={gradeInput[sub.id] ?? ''}
                                  onChange={(e) => setGradeInput({ ...gradeInput, [sub.id]: e.target.value })}
                                  className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center"
                                />
                                <button
                                  onClick={() => dispatch(gradeExamSubmission({ examId: exam.id, submissionId: sub.id, score: parseFloat(gradeInput[sub.id] ?? '0') }))}
                                  className="text-xs bg-teal-500 text-white px-2 py-1 rounded-lg">
                                  حفظ
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Exam Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-10 overflow-y-auto" dir="rtl">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl mb-10">
            <h2 className="text-lg font-bold text-gray-800 mb-5">إنشاء امتحان جديد</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">الكورس</label>
                  <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" required>
                    <option value="">اختر كورساً</option>
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">مدة الامتحان (دقيقة)</label>
                  <input type="number" min="1" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="اختياري"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" />
                </div>
              </div>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="عنوان الامتحان" required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="وصف الامتحان (اختياري)" rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 resize-none" />

              {/* Questions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-gray-700 text-sm">الأسئلة</p>
                  <button type="button" onClick={addQuestion}
                    className="text-xs text-teal-600 hover:text-teal-800 px-2 py-1 rounded hover:bg-teal-50">
                    + سؤال
                  </button>
                </div>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {questions.map((q, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-2 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 flex-shrink-0">س{i + 1}</span>
                        <select value={q.type} onChange={(e) => updateQuestion(i, 'type', e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none">
                          <option value="mcq">اختيار متعدد</option>
                          <option value="true_false">صح/خطأ</option>
                          <option value="short">إجابة قصيرة</option>
                        </select>
                        <input type="number" min="1" value={q.points} onChange={(e) => updateQuestion(i, 'points', parseInt(e.target.value))}
                          className="w-16 text-xs border border-gray-200 rounded-lg px-2 py-1 text-center focus:outline-none"
                          placeholder="نقاط" />
                      </div>
                      <input value={q.question} onChange={(e) => updateQuestion(i, 'question', e.target.value)}
                        placeholder="نص السؤال" required
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
                      {q.type === 'mcq' && (
                        <div className="grid grid-cols-2 gap-2">
                          {(q.options ?? ['', '', '', '']).map((opt, oi) => (
                            <input key={oi} value={opt}
                              onChange={(e) => {
                                const opts = [...(q.options ?? ['', '', '', ''])];
                                opts[oi] = e.target.value;
                                updateQuestion(i, 'options', opts);
                              }}
                              placeholder={`خيار ${oi + 1}`}
                              className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
                          ))}
                        </div>
                      )}
                      {q.type !== 'short' && (
                        <input value={q.answer ?? ''} onChange={(e) => updateQuestion(i, 'answer', e.target.value)}
                          placeholder="الإجابة الصحيحة"
                          className="w-full border border-teal-200 bg-teal-50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-teal-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}>
                  {saving ? 'جاري الحفظ...' : 'إنشاء الامتحان'}
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
