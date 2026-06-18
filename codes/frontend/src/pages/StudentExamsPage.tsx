import { useEffect, useState, useRef } from 'react';
import StudentLayout from '../components/StudentLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchStudentExams, loadExam, submitExam, clearActiveExam,
} from '../features/student/examSlice';
import type { ExamQuestionItem } from '../features/student/examSlice';

const DK = {
  card:   { background: '#070e22', border: '1px solid rgba(245,166,35,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  gold:   '#f5a623',
  goldL:  '#ffd166',
  navy:   '#040a18',
  dimTxt: 'rgba(255,255,255,0.4)',
};

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
    <span className="font-mono text-lg font-bold" style={{ color: urgent ? '#f87171' : DK.gold }}>
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  );
}

function QuestionCard({ q, idx, answer, onChange }: {
  q: ExamQuestionItem; idx: number; answer: string; onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-2xl p-5" style={DK.card}>
      <div className="flex items-start gap-3 mb-4">
        <span className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(245,166,35,0.15)', color: DK.gold }}>
          {idx + 1}
        </span>
        <p className="text-white font-medium leading-relaxed">{q.question}</p>
        <span className="mr-auto text-xs flex-shrink-0" style={{ color: DK.dimTxt }}>{q.points} نقطة</span>
      </div>

      {q.type === 'mcq' && q.options && (
        <div className="space-y-2 pr-10">
          {q.options.map((opt, oi) => (
            <label key={oi}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
              style={answer === opt
                ? { border: '1px solid rgba(245,166,35,0.4)', background: 'rgba(245,166,35,0.08)' }
                : { border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
              <input type="radio" name={`q-${q.id}`} value={opt} checked={answer === opt}
                onChange={() => onChange(opt)} className="w-4 h-4 accent-yellow-500" />
              <span className="text-sm text-white">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {q.type === 'true_false' && (
        <div className="flex gap-3 pr-10">
          {['صح', 'خطأ'].map((opt) => (
            <button key={opt} type="button" onClick={() => onChange(opt)}
              className="flex-1 py-2.5 rounded-xl font-medium text-sm transition-all"
              style={answer === opt
                ? opt === 'صح'
                  ? { background: 'rgba(52,211,153,0.2)', color: '#34d399', border: '1px solid rgba(52,211,153,0.4)' }
                  : { background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)' }
                : { background: 'rgba(255,255,255,0.04)', color: DK.dimTxt, border: '1px solid rgba(255,255,255,0.08)' }}>
              {opt}
            </button>
          ))}
        </div>
      )}

      {q.type === 'short' && (
        <div className="pr-10">
          <textarea rows={3} value={answer} onChange={(e) => onChange(e.target.value)}
            placeholder="اكتب إجابتك هنا..."
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(245,166,35,0.15)', color: '#fff', borderRadius: '12px', padding: '12px 16px', fontSize: '13px', width: '100%', outline: 'none', resize: 'none' }} />
        </div>
      )}
    </div>
  );
}

export default function StudentExamsPage() {
  const dispatch = useAppDispatch();
  const { exams, activeExam, result, loading, submitting } = useAppSelector((s) => s.studentExam);

  const [answers, setAnswers]       = useState<Record<number, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => { dispatch(fetchStudentExams()); }, [dispatch]);

  async function handleOpenExam(id: number) {
    dispatch(clearActiveExam()); setAnswers({});
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
      <div className="p-6" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>

        {/* Exam list */}
        {!activeExam && (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f5a623, #ffd166)' }} />
                <h1 className="text-xl font-bold text-white">امتحاناتي</h1>
              </div>
              <p className="text-xs mr-4" style={{ color: DK.dimTxt }}>{exams.length} امتحان</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(245,166,35,0.2)', borderTopColor: '#f5a623' }} />
              </div>
            ) : exams.length === 0 ? (
              <div className="flex flex-col items-center py-24 gap-3" style={{ color: DK.dimTxt }}>
                <svg className="w-14 h-14 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>لا توجد امتحانات متاحة حالياً</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {exams.map((exam) => (
                  <div key={exam.id} className="rounded-2xl p-5 flex flex-col gap-3" style={DK.card}>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-white leading-snug">{exam.title}</h3>
                      {exam.submitted && (
                        <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}>
                          مُسلَّم
                        </span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: DK.dimTxt }}>{exam.course?.title}</p>
                    <div className="flex items-center gap-3 text-xs" style={{ color: DK.dimTxt }}>
                      <span>{exam.questions_count} سؤال</span>
                      {exam.duration && <span>· {exam.duration} دقيقة</span>}
                    </div>
                    {!exam.submitted ? (
                      <button onClick={() => handleOpenExam(exam.id)}
                        className="mt-auto py-2.5 rounded-xl text-sm font-semibold"
                        style={{ background: 'linear-gradient(135deg, #f5a623, #ffd166)', color: '#040a18' }}>
                        ابدأ الامتحان
                      </button>
                    ) : (
                      <div className="mt-auto py-2.5 text-center text-sm rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.04)', color: DK.dimTxt }}>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(4,10,24,0.9)', backdropFilter: 'blur(8px)' }}>
            <div className="rounded-3xl p-8 max-w-sm w-full text-center" dir="rtl"
              style={{ background: '#070e22', border: '1px solid rgba(245,166,35,0.2)' }}>
              <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold"
                style={{
                  background: pct >= 60
                    ? 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(52,211,153,0.1))'
                    : 'linear-gradient(135deg, rgba(245,166,35,0.2), rgba(245,166,35,0.1))',
                  border: pct >= 60 ? '2px solid rgba(52,211,153,0.4)' : '2px solid rgba(245,166,35,0.4)',
                  color: pct >= 60 ? '#34d399' : DK.gold,
                }}>
                {pct}%
              </div>
              <h2 className="text-xl font-bold text-white mb-1">
                {pct >= 60 ? 'أحسنت! 🎉' : 'استمر في المحاولة'}
              </h2>
              <p className="text-sm mb-2" style={{ color: DK.dimTxt }}>
                نتيجتك: <span className="font-bold text-white">{result.score}</span> / {result.total_points} نقطة
              </p>
              <button onClick={() => dispatch(clearActiveExam())}
                className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, #f5a623, #ffd166)', color: '#040a18' }}>
                العودة للقائمة
              </button>
            </div>
          </div>
        )}

        {/* Active exam */}
        {activeExam && !result && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h1 className="text-xl font-bold text-white">{activeExam.title}</h1>
                <p className="text-sm mt-0.5" style={{ color: DK.dimTxt }}>
                  {answered}/{total} سؤال تمت الإجابة عليه
                </p>
              </div>
              <div className="flex items-center gap-3">
                {activeExam.duration && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(245,166,35,0.1)' }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: DK.dimTxt }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <CountdownTimer minutes={activeExam.duration} onExpire={handleSubmit} />
                  </div>
                )}
                <button onClick={() => setShowConfirm(true)} disabled={submitting}
                  className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #f5a623, #ffd166)', color: '#040a18' }}>
                  {submitting ? 'جاري التسليم...' : 'تسليم الامتحان'}
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full mb-6 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${total > 0 ? (answered / total) * 100 : 0}%`,
                  background: 'linear-gradient(90deg, #f5a623, #ffd166)',
                }} />
            </div>

            <div className="space-y-4">
              {activeExam.questions.map((q, idx) => (
                <QuestionCard key={q.id} q={q} idx={idx}
                  answer={answers[q.id] ?? ''}
                  onChange={(v) => setAnswers({ ...answers, [q.id]: v })} />
              ))}
            </div>

            <div className="mt-6 pb-6 flex justify-end">
              <button onClick={() => setShowConfirm(true)} disabled={submitting}
                className="px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #f5a623, #ffd166)', color: '#040a18' }}>
                {submitting ? 'جاري التسليم...' : 'تسليم الامتحان'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm submit dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(4,10,24,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="rounded-2xl p-6 max-w-sm w-full" dir="rtl"
            style={{ background: '#070e22', border: '1px solid rgba(245,166,35,0.2)' }}>
            <h3 className="text-lg font-bold text-white mb-2">تأكيد التسليم</h3>
            <p className="text-sm mb-1" style={{ color: DK.dimTxt }}>
              أجبت على <span className="font-bold text-white">{answered}</span> من أصل{' '}
              <span className="font-bold text-white">{total}</span> سؤال.
            </p>
            {answered < total && (
              <p className="text-sm mb-4" style={{ color: '#fbbf24' }}>
                لم تجب على {total - answered} سؤال بعد. هل أنت متأكد؟
              </p>
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, #f5a623, #ffd166)', color: '#040a18' }}>
                نعم، تسليم
              </button>
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', color: DK.dimTxt }}>
                رجوع
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}
