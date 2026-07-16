import { useEffect, useState } from 'react';
import TeacherLayout from '../components/TeacherLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchTeacherCourses } from '../features/teacher/teacherSlice';
import {
  fetchTeacherExams, createExam, updateExam, archiveExam,
  fetchExamSubmissions, gradeExamSubmission, clearTeacherExamError,
} from '../features/teacher/examSlice';
import type { ExamQuestion, TeacherExam } from '../features/teacher/examSlice';

const TH = {
  pageBg:     '#F5EDD8',
  card:       { background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  gold:       '#C9952A',
  goldL:      '#DDAD50',
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

const emptyForm = { course_id: '', title: '', description: '', duration: '' };
const emptyQuestion = (): ExamQuestion => ({
  question: '', type: 'mcq', options: ['', '', '', ''], answer: '', points: 1,
});

export default function TeacherExamsPage() {
  const dispatch = useAppDispatch();
  const { exams, submissions, loading, saving, error } = useAppSelector((s) => s.teacherExams);
  const courses = useAppSelector((s) => s.teacher.courses);

  const [scope, setScope] = useState<'active' | 'archived'>('active');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<TeacherExam | null>(null);
  const [viewSubs, setViewSubs] = useState<number | null>(null);
  const [gradeInput, setGradeInput] = useState<Record<number, string>>({});
  const [form, setForm] = useState(emptyForm);
  const [questions, setQuestions] = useState<ExamQuestion[]>([emptyQuestion()]);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    dispatch(fetchTeacherCourses());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchTeacherExams(scope));
  }, [dispatch, scope]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setQuestions([emptyQuestion()]);
    setFormError('');
    dispatch(clearTeacherExamError());
    setShowModal(true);
  }

  function openEdit(exam: TeacherExam) {
    setEditing(exam);
    setForm({
      course_id: String(exam.course?.id ?? ''),
      title: exam.title,
      description: exam.description ?? '',
      duration: exam.duration ? String(exam.duration) : '',
    });
    setFormError('');
    dispatch(clearTeacherExamError());
    setShowModal(true);
  }

  function addQuestion() {
    setQuestions([...questions, emptyQuestion()]);
  }

  function updateQuestion(i: number, field: keyof ExamQuestion, value: unknown) {
    const next = [...questions];
    (next[i] as unknown as Record<string, unknown>)[field as string] = value;
    if (field === 'type' && value === 'true_false') next[i].options = ['صح', 'خطأ'];
    setQuestions(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.course_id || !form.title.trim()) return;
    if (!editing && questions.length === 0) return;
    setFormError('');
    try {
      if (editing) {
        await dispatch(updateExam({
          id: editing.id,
          course_id: parseInt(form.course_id),
          title: form.title.trim(),
          description: form.description || undefined,
          duration: form.duration ? parseInt(form.duration) : undefined,
        })).unwrap();
        setSuccessMsg('تم تعديل الامتحان');
      } else {
        await dispatch(createExam({
          course_id: parseInt(form.course_id),
          title: form.title.trim(),
          description: form.description || undefined,
          duration: form.duration ? parseInt(form.duration) : undefined,
          questions,
        })).unwrap();
        setSuccessMsg('تم إرسال الامتحان بانتظار موافقة الإدارة');
      }
      setShowModal(false);
      setForm(emptyForm);
      setQuestions([emptyQuestion()]);
      setEditing(null);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: unknown) {
      setFormError(typeof err === 'string' ? err : 'تعذّر الحفظ');
    }
  }

  async function handleArchive(exam: TeacherExam) {
    if (!confirm(`أرشفة الامتحان «${exam.title}»؟ سيختفي عن الطلاب.`)) return;
    try {
      await dispatch(archiveExam(exam.id)).unwrap();
      setSuccessMsg('تم أرشفة الامتحان');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      setFormError(typeof err === 'string' ? err : 'تعذّر الأرشفة');
    }
  }

  async function handleViewSubs(examId: number) {
    setViewSubs(examId);
    if (!submissions[examId]) dispatch(fetchExamSubmissions(examId));
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
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: TH.goldGrad }} />
            <div>
              <h1 className="text-xl font-bold" style={{ color: TH.text }}>امتحاناتي</h1>
              <p className="text-xs mt-0.5" style={{ color: TH.textSub }}>إضافة وتعديل وأرشفة — الحذف من صلاحية الإدارة فقط</p>
            </div>
          </div>
          {scope === 'active' && (
            <button onClick={openCreate}
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: TH.goldGrad, color: '#fff' }}>
              + إنشاء امتحان
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {([
            { key: 'active' as const, label: 'نشطة' },
            { key: 'archived' as const, label: 'مؤرشفة' },
          ]).map((t) => (
            <button key={t.key} onClick={() => setScope(t.key)}
              style={{
                padding: '8px 18px', borderRadius: 40, cursor: 'pointer',
                fontFamily: "'Cairo',sans-serif", fontSize: 13, fontWeight: 700,
                background: scope === t.key ? TH.goldGrad : '#FFFFFF',
                color: scope === t.key ? '#fff' : TH.textSub,
                border: scope === t.key ? 'none' : '1px solid #EDE3CE',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {successMsg && (
          <div style={{ background: TH.greenBg, border: `1px solid ${TH.greenBorder}`, color: TH.green, padding: '12px 16px', borderRadius: 12, marginBottom: 16, fontWeight: 600, fontSize: 13 }}>
            {successMsg}
          </div>
        )}
        {(formError || error) && !showModal && (
          <div style={{ background: TH.redBg, border: `1px solid ${TH.redBorder}`, color: TH.red, padding: '12px 16px', borderRadius: 12, marginBottom: 16, fontWeight: 600, fontSize: 13 }}>
            {formError || error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: `2px solid ${TH.goldBorder}`, borderTopColor: TH.gold }} />
          </div>
        ) : exams.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3" style={{ color: TH.textDim }}>
            <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p style={{ fontWeight: 700 }}>{scope === 'archived' ? 'لا توجد امتحانات مؤرشفة' : 'لا توجد امتحانات بعد'}</p>
            {scope === 'active' && <p style={{ fontSize: 13 }}>اضغط «إنشاء امتحان» لبدء أول امتحان</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {exams.map((exam) => (
              <div key={exam.id} className="p-5 rounded-2xl" style={TH.card}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold" style={{ color: TH.text }}>{exam.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={statusStyle(exam.status)}>
                        {statusLabel(exam.status)}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: TH.textSub }}>
                      {exam.course?.title} · {exam.questions_count} سؤال
                      {exam.duration ? ` · ${exam.duration} دقيقة` : ''}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: TH.textDim }}>{exam.submissions_count} تسليم</p>
                  </div>
                  {scope === 'active' && (
                    <div className="flex gap-2 flex-wrap justify-end">
                      {exam.status === 'approved' && (
                        <button onClick={() => handleViewSubs(exam.id)}
                          className="text-xs px-3 py-1.5 rounded-lg transition"
                          style={{ background: TH.goldBg, color: TH.gold, border: `1px solid ${TH.goldBorder}` }}>
                          التسليمات
                        </button>
                      )}
                      <button onClick={() => openEdit(exam)}
                        className="text-xs px-3 py-1.5 rounded-lg"
                        style={{ background: '#F8FAFC', color: TH.text, border: '1px solid #EDE3CE' }}>
                        تعديل
                      </button>
                      <button onClick={() => handleArchive(exam)}
                        className="text-xs px-3 py-1.5 rounded-lg"
                        style={{ background: TH.amberBg, color: TH.amber, border: `1px solid ${TH.amberBorder}` }}>
                        أرشفة
                      </button>
                    </div>
                  )}
                </div>

                {viewSubs === exam.id && (
                  <div className="mt-4 pt-4 space-y-2" style={{ borderTop: '1px solid #EDE3CE' }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium" style={{ color: TH.text }}>تسليمات الطلاب</p>
                      <button onClick={() => setViewSubs(null)} className="text-xs" style={{ color: TH.textDim }}>إغلاق</button>
                    </div>
                    {(submissions[exam.id] ?? []).length === 0 ? (
                      <p className="text-xs" style={{ color: TH.textDim }}>لا توجد تسليمات بعد</p>
                    ) : (submissions[exam.id] ?? []).map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                        style={{ background: '#F9FAFB', border: '1px solid #EDE3CE' }}>
                        <span className="text-sm" style={{ color: TH.text }}>{sub.student.name}</span>
                        <div className="flex items-center gap-3">
                          {sub.score !== null ? (
                            <span className="text-sm font-bold" style={{ color: TH.gold }}>{sub.score} / {sub.total_points}</span>
                          ) : (
                            <div className="flex items-center gap-1">
                              <input type="number" min="0" placeholder="الدرجة"
                                value={gradeInput[sub.id] ?? ''}
                                onChange={(e) => setGradeInput({ ...gradeInput, [sub.id]: e.target.value })}
                                style={{ ...baseInput, width: '80px', padding: '4px 8px', textAlign: 'center' }} />
                              <button
                                onClick={() => dispatch(gradeExamSubmission({ examId: exam.id, submissionId: sub.id, score: parseFloat(gradeInput[sub.id] ?? '0') }))}
                                className="text-xs px-2 py-1 rounded-lg"
                                style={{ background: TH.goldBg, color: TH.gold, border: `1px solid ${TH.goldBorder}` }}>
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
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto" dir="rtl"
          style={{ background: 'rgba(27,32,56,0.5)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-2xl p-6 rounded-2xl mb-10"
            style={{ background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <h2 className="text-lg font-bold mb-2" style={{ color: TH.text }}>
              {editing ? 'تعديل الامتحان' : 'إنشاء امتحان جديد'}
            </h2>
            <p className="text-xs mb-4" style={{ color: TH.textSub }}>
              {editing
                ? 'تعديل البيانات فقط (بدون الأسئلة) — التعديل على امتحان معتمد يعيده لانتظار الموافقة'
                : 'يُرسل للإدارة للموافقة قبل ظهوره للطلاب'}
            </p>
            {formError && (
              <div style={{ background: TH.redBg, border: `1px solid ${TH.redBorder}`, color: TH.red, padding: '10px 12px', borderRadius: 10, marginBottom: 12, fontSize: 12, fontWeight: 600 }}>
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: TH.textSub }}>الكورس</label>
                  <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                    style={{ ...baseInput, cursor: 'pointer' }} required>
                    <option value="">اختر كورساً</option>
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                  {courses.length === 0 && (
                    <p style={{ fontSize: 11, color: TH.textDim, marginTop: 4 }}>لا توجد دورات مسندة لك حالياً</p>
                  )}
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: TH.textSub }}>مدة الامتحان (دقيقة)</label>
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

              {!editing && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium text-sm" style={{ color: TH.text }}>الأسئلة</p>
                    <button type="button" onClick={addQuestion}
                      className="text-xs px-2 py-1 rounded transition"
                      style={{ color: TH.gold, background: TH.goldBg, border: `1px solid ${TH.goldBorder}` }}>
                      + سؤال
                    </button>
                  </div>
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {questions.map((q, i) => (
                      <div key={i} className="p-4 rounded-xl space-y-2"
                        style={{ background: '#F9FAFB', border: '1px solid #EDE3CE' }}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs flex-shrink-0" style={{ color: TH.textDim }}>س{i + 1}</span>
                          <select value={q.type} onChange={(e) => updateQuestion(i, 'type', e.target.value)}
                            style={{ ...baseInput, width: 'auto', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>
                            <option value="mcq">اختيار متعدد</option>
                            <option value="true_false">صح/خطأ</option>
                            <option value="short">إجابة قصيرة</option>
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
                            style={{ ...baseInput, border: `1px solid ${TH.greenBorder}`, background: TH.greenBg, color: TH.text }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving || !form.course_id}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                  style={{ background: TH.goldGrad, color: '#fff' }}>
                  {saving ? 'جاري الحفظ...' : editing ? 'حفظ التعديل' : 'إنشاء الامتحان'}
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
    </TeacherLayout>
  );
}
