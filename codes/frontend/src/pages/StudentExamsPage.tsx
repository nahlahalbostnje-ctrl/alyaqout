import { useEffect, useState, useRef } from 'react';
import StudentLayout from '../components/StudentLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchStudentExams, loadExam, submitExam, clearActiveExam,
} from '../features/student/examSlice';
import type { ExamQuestionItem } from '../features/student/examSlice';

function CountdownTimer({ minutes, onExpire }: { minutes: number; onExpire: () => void }) {
  const [secs, setSecs] = useState(minutes * 60);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    ref.current = setInterval(() => {
      setSecs((prev) => {
        if (prev <= 1) { clearInterval(ref.current!); onExpire(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current!);
  }, [onExpire]);

  const m = Math.floor(secs / 60);
  const s = secs % 60;
  const urgent = secs <= 60;
  return (
    <span className={`font-mono text-lg font-bold ${urgent ? 'text-red-500 animate-pulse' : 'text-teal-600'}`}>
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  );
}

function QuestionCard({
  q, idx, answer, onChange,
}: {
  q: ExamQuestionItem; idx: number; answer: string; onChange: (v: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start gap-3 mb-4">
        <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
          {idx + 1}
        </span>
        <p className="text-gray-800 font-medium leading-relaxed">{q.question}</p>
        <span className="mr-auto text-xs text-gray-400 flex-shrink-0">{q.points} نقطة</span>
      </div>

      {q.type === 'mcq' && q.options && (
        <div className="space-y-2 pr-10">
          {q.options.map((opt, oi) => (
            <label key={oi}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                answer === opt
                  ? 'border-purple-400 bg-purple-50'
                  : 'border-gray-100 hover:border-purple-200 hover:bg-gray-50'
              }`}>
              <input type="radio" name={`q-${q.id}`} value={opt} checked={answer === opt}
                onChange={() => onChange(opt)} className="accent-purple-500 w-4 h-4" />
              <span className="text-sm text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {q.type === 'true_false' && (
        <div className="flex gap-3 pr-10">
          {['صح', 'خطأ'].map((opt) => (
            <button key={opt} type="button"
              onClick={() => onChange(opt)}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all border ${
                answer === opt
                  ? opt === 'صح'
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-red-500 text-white border-red-500'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300'
              }`}>
              {opt}
            </button>
          ))}
        </div>
      )}

      {q.type === 'short' && (
        <div className="pr-10">
          <textarea
            rows={3}
            value={answer}
            onChange={(e) => onChange(e.target.value)}
            placeholder="اكتب إجابتك هنا..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-purple-400 resize-none"
          />
        </div>
      )}
    </div>
  );
}

export default function StudentExamsPage() {
  const dispatch = useAppDispatch();
  const { exams, activeExam, result, loading, submitting } = useAppSelector((s) => s.studentExam);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    dispatch(fetchStudentExams());
  }, [dispatch]);

  async function handleOpenExam(id: number) {
    dispatch(clearActiveExam());
    setAnswers({});
    await dispatch(loadExam(id));
  }

  function handleSubmit() {
    if (!activeExam) return;
    dispatch(submitExam({ examId: activeExam.id, answers }));
    setShowConfirm(false);
  }

  const answered = activeExam ? activeExam.questions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== '').length : 0;
  const total = activeExam?.questions.length ?? 0;

  const pct = result ? Math.round((result.score / (result.total_points || 1)) * 100) : 0;

  return (
    <StudentLayout>
      <div className="p-6" dir="rtl">
        {/* Exam list */}
        {!activeExam && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">امتحاناتي</h1>
              <p className="text-gray-400 text-sm mt-0.5">{exams.length} امتحان</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : exams.length === 0 ? (
              <div className="flex flex-col items-center py-24 gap-3 text-gray-400">
                <svg className="w-14 h-14 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>لا توجد امتحانات متاحة حالياً</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {exams.map((exam) => (
                  <div key={exam.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-800 leading-snug">{exam.title}</h3>
                      {exam.submitted && (
                        <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                          مُسلَّم
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{exam.course?.title}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{exam.questions_count} سؤال</span>
                      {exam.duration && <span>· {exam.duration} دقيقة</span>}
                    </div>
                    {!exam.submitted ? (
                      <button onClick={() => handleOpenExam(exam.id)}
                        className="mt-auto py-2.5 rounded-xl text-white text-sm font-medium"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                        ابدأ الامتحان
                      </button>
                    ) : (
                      <div className="mt-auto py-2.5 text-center text-sm text-gray-400 bg-gray-50 rounded-xl">
                        تم التسليم
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Result screen */}
        {result && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl" dir="rtl">
              <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white`}
                style={{
                  background: pct >= 60
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'linear-gradient(135deg, #f59e0b, #d97706)',
                }}>
                {pct}%
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                {pct >= 60 ? 'أحسنت! 🎉' : 'استمر في المحاولة'}
              </h2>
              <p className="text-gray-500 text-sm mb-2">
                نتيجتك: <span className="font-bold text-gray-800">{result.score}</span> / {result.total_points} نقطة
              </p>
              <button onClick={() => dispatch(clearActiveExam())}
                className="mt-4 w-full py-2.5 rounded-xl text-white text-sm font-medium"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                العودة للقائمة
              </button>
            </div>
          </div>
        )}

        {/* Active exam */}
        {activeExam && !result && (
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{activeExam.title}</h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  {answered}/{total} سؤال تمت الإجابة عليه
                </p>
              </div>
              <div className="flex items-center gap-3">
                {activeExam.duration && (
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <CountdownTimer minutes={activeExam.duration} onExpire={handleSubmit} />
                  </div>
                )}
                <button onClick={() => setShowConfirm(true)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                  {submitting ? 'جاري التسليم...' : 'تسليم الامتحان'}
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${total > 0 ? (answered / total) * 100 : 0}%`,
                  background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
                }} />
            </div>

            <div className="space-y-4">
              {activeExam.questions.map((q, idx) => (
                <QuestionCard
                  key={q.id} q={q} idx={idx}
                  answer={answers[q.id] ?? ''}
                  onChange={(v) => setAnswers({ ...answers, [q.id]: v })}
                />
              ))}
            </div>

            <div className="mt-6 pb-6 flex justify-end">
              <button onClick={() => setShowConfirm(true)}
                disabled={submitting}
                className="px-6 py-3 rounded-xl text-white font-medium disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                {submitting ? 'جاري التسليم...' : 'تسليم الامتحان'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm submit dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" dir="rtl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">تأكيد التسليم</h3>
            <p className="text-gray-500 text-sm mb-1">
              أجبت على <span className="font-bold text-gray-800">{answered}</span> من أصل{' '}
              <span className="font-bold text-gray-800">{total}</span> سؤال.
            </p>
            {answered < total && (
              <p className="text-amber-600 text-sm mb-4">
                لم تجب على {total - answered} سؤال بعد. هل أنت متأكد؟
              </p>
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                نعم، تسليم
              </button>
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm">
                رجوع
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}
