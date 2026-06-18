import { useEffect, useState } from 'react';
import TeacherLayout from '../components/TeacherLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchTeacherExams, createExam, deleteExam,
  fetchExamSubmissions, gradeExamSubmission,
} from '../features/teacher/examSlice';
import type { ExamQuestion } from '../features/teacher/examSlice';

const DK = {
  card:    { background: '#070e22', border: '1px solid rgba(245,166,35,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  gold:    '#f5a623',
  goldL:   '#ffd166',
  navy:    '#040a18',
  dimTxt:  'rgba(255,255,255,0.4)',
};

const STATUS_MAP: Record<string, { label: string; style: React.CSSProperties }> = {
  pending:  { label: 'بانتظار الموافقة', style: { background: 'rgba(245,158,11,0.12)', color: '#fbbf24' } },
  approved: { label: 'معتمد',            style: { background: 'rgba(52,211,153,0.12)',  color: '#34d399' } },
  rejected: { label: 'مرفوض',           style: { background: 'rgba(239,68,68,0.1)',    color: '#f87171' } },
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

export default function TeacherExamsPage() {
  const dispatch = useAppDispatch();
  const { exams, submissions, loading, saving } = useAppSelector((s) => s.teacherExams);
  const courses = useAppSelector((s) => s.teacher.courses);

  const [showModal, setShowModal] = useState(false);
  const [viewSubs, setViewSubs]   = useState<number | null>(null);
  const [gradeInput, setGradeInput] = useState<Record<number, string>>({});

  const [form, setForm] = useState({
    course_id: '', title: '', description: '', duration: '',
  });

  const [questions, setQuestions] = useState<ExamQuestion[]>([
    { question: '', type: 'mcq', options: ['', '', '', ''], answer: '', points: 1 },
  ]);

  useEffect(() => { dispatch(fetchTeacherExams()); }, [dispatch]);

  function addQuestion() {
    setQuestions([...questions, { question: '', type: 'mcq', options: ['', '', '', ''], answer: '', points: 1 }]);
  }

  function updateQuestion(i: number, field: keyof ExamQuestion, value: unknown) {
    const next = [...questions];
    (next[i] as Record<string, unknown>)[field] = value;
    if (field === 'type' && value === 'true_false') next[i].options = ['صح', 'خطأ'];
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
      <div className="p-6" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f5a623, #ffd166)' }} />
            <div>
              <h1 className="text-xl font-bold text-white">امتحاناتي</h1>
              <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>{exams.length} امتحان</p>
            </div>
          </div>
          <button onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #f5a623, #ffd166)', color: '#040a18' }}>
            + إنشاء امتحان
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(245,166,35,0.2)', borderTopColor: '#f5a623' }} />
          </div>
        ) : exams.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3" style={{ color: DK.dimTxt }}>
            <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <div key={exam.id} className="p-5 rounded-2xl" style={DK.card}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white">{exam.title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={st.style}>{st.label}</span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: DK.dimTxt }}>
                        {exam.course?.title} · {exam.questions_count} سؤال
                        {exam.duration ? ` · ${exam.duration} دقيقة` : ''}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>{exam.submissions_count} تسليم</p>
                    </div>
                    <div className="flex gap-2">
                      {exam.status === 'approved' && (
                        <button onClick={() => handleViewSubs(exam.id)}
                          className="text-xs px-3 py-1.5 rounded-lg transition"
                          style={{ background: 'rgba(245,166,35,0.08)', color: DK.gold }}>
                          التسليمات
                        </button>
                      )}
                      <button onClick={() => dispatch(deleteExam(exam.id))}
                        className="text-xs px-2 py-1.5 rounded-lg transition"
                        style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171' }}>
                        حذف
                      </button>
                    </div>
                  </div>

                  {/* Submissions panel */}
                  {viewSubs === exam.id && (
                    <div className="mt-4 pt-4 space-y-2" style={{ borderTop: '1px solid rgba(245,166,35,0.08)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-white">تسليمات الطلاب</p>
                        <button onClick={() => setViewSubs(null)} className="text-xs" style={{ color: DK.dimTxt }}>إغلاق</button>
                      </div>
                      {(submissions[exam.id] ?? []).length === 0 ? (
                        <p className="text-xs" style={{ color: DK.dimTxt }}>لا توجد تسليمات بعد</p>
                      ) : (submissions[exam.id] ?? []).map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <span className="text-sm text-white">{sub.student.name}</span>
                          <div className="flex items-center gap-3">
                            {sub.score !== null ? (
                              <span className="text-sm font-bold" style={{ color: DK.gold }}>{sub.score} / {sub.total_points}</span>
                            ) : (
                              <div className="flex items-center gap-1">
                                <input type="number" min="0" placeholder="الدرجة"
                                  value={gradeInput[sub.id] ?? ''}
                                  onChange={(e) => setGradeInput({ ...gradeInput, [sub.id]: e.target.value })}
                                  style={{ ...baseInput, width: '80px', padding: '4px 8px', textAlign: 'center' }} />
                                <button
                                  onClick={() => dispatch(gradeExamSubmission({ examId: exam.id, submissionId: sub.id, score: parseFloat(gradeInput[sub.id] ?? '0') }))}
                                  className="text-xs px-2 py-1 rounded-lg"
                                  style={{ background: 'rgba(245,166,35,0.15)', color: DK.gold }}>
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
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto" dir="rtl"
          style={{ background: 'rgba(4,10,24,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-2xl p-6 rounded-2xl mb-10"
            style={{ background: '#070e22', border: '1px solid rgba(245,166,35,0.15)' }}>
            <h2 className="text-lg font-bold text-white mb-5">إنشاء امتحان جديد</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: DK.dimTxt }}>الكورس</label>
                  <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                    style={{ ...baseInput, cursor: 'pointer' }} required>
                    <option value="" style={{ background: '#070e22' }}>اختر كورساً</option>
                    {courses.map((c) => <option key={c.id} value={c.id} style={{ background: '#070e22' }}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: DK.dimTxt }}>مدة الامتحان (دقيقة)</label>
                  <input type="number" min="1" value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="اختياري" style={baseInput} />
                </div>
              </div>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="عنوان الامتحان" required style={baseInput} />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="وصف الامتحان (اختياري)" rows={2}
                style={{ ...baseInput, resize: 'none' }} />

              {/* Questions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-white text-sm">الأسئلة</p>
                  <button type="button" onClick={addQuestion}
                    className="text-xs px-2 py-1 rounded transition"
                    style={{ color: DK.gold, background: 'rgba(245,166,35,0.08)' }}>
                    + سؤال
                  </button>
                </div>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {questions.map((q, i) => (
                    <div key={i} className="p-4 rounded-xl space-y-2"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(245,166,35,0.08)' }}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs flex-shrink-0" style={{ color: DK.dimTxt }}>س{i + 1}</span>
                        <select value={q.type} onChange={(e) => updateQuestion(i, 'type', e.target.value)}
                          style={{ ...baseInput, width: 'auto', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>
                          <option value="mcq"        style={{ background: '#070e22' }}>اختيار متعدد</option>
                          <option value="true_false" style={{ background: '#070e22' }}>صح/خطأ</option>
                          <option value="short"      style={{ background: '#070e22' }}>إجابة قصيرة</option>
                        </select>
                        <input type="number" min="1" value={q.points}
                          onChange={(e) => updateQuestion(i, 'points', parseInt(e.target.value))}
                          style={{ ...baseInput, width: '64px', padding: '4px 8px', fontSize: '12px', textAlign: 'center' }}
                          placeholder="نقاط" />
                      </div>
                      <input value={q.question} onChange={(e) => updateQuestion(i, 'question', e.target.value)}
                        placeholder="نص السؤال" required style={baseInput} />
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
                              style={{ ...baseInput, padding: '6px 10px', fontSize: '12px' }} />
                          ))}
                        </div>
                      )}
                      {q.type !== 'short' && (
                        <input value={q.answer ?? ''} onChange={(e) => updateQuestion(i, 'answer', e.target.value)}
                          placeholder="الإجابة الصحيحة"
                          style={{ ...baseInput, border: '1px solid rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.04)' }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #f5a623, #ffd166)', color: '#040a18' }}>
                  {saving ? 'جاري الحفظ...' : 'إنشاء الامتحان'}
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
