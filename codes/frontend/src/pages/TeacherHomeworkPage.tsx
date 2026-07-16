import { useEffect, useState } from 'react';
import TeacherLayout from '../components/TeacherLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchTeacherCourses } from '../features/teacher/teacherSlice';
import {
  fetchTeacherHomework, createHomework, updateHomework, archiveHomework,
  fetchHomeworkSubmissions, gradeHomeworkSubmission, clearTeacherExamError,
} from '../features/teacher/examSlice';
import type { Homework } from '../features/teacher/examSlice';

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

const emptyForm = { course_id: '', title: '', description: '', due_date: '' };

export default function TeacherHomeworkPage() {
  const dispatch = useAppDispatch();
  const { homeworks, hwSubmissions, loading, saving, error } = useAppSelector((s) => s.teacherExams);
  const courses = useAppSelector((s) => s.teacher.courses);

  const [scope, setScope] = useState<'active' | 'archived'>('active');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Homework | null>(null);
  const [viewSubs, setViewSubs] = useState<number | null>(null);
  const [gradeForm, setGradeForm] = useState<Record<number, { grade: string; feedback: string }>>({});
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    dispatch(fetchTeacherCourses());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchTeacherHomework(scope));
  }, [dispatch, scope]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    dispatch(clearTeacherExamError());
    setShowModal(true);
  }

  function openEdit(hw: Homework) {
    setEditing(hw);
    setForm({
      course_id: String(hw.course?.id ?? ''),
      title: hw.title,
      description: hw.description ?? '',
      due_date: hw.due_date ?? '',
    });
    setFormError('');
    dispatch(clearTeacherExamError());
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.course_id || !form.title.trim() || !form.due_date) return;
    setFormError('');
    try {
      if (editing) {
        await dispatch(updateHomework({
          id: editing.id,
          course_id: parseInt(form.course_id),
          title: form.title.trim(),
          description: form.description || undefined,
          due_date: form.due_date,
        })).unwrap();
        setSuccessMsg('تم تعديل الواجب');
      } else {
        await dispatch(createHomework({
          course_id: parseInt(form.course_id),
          title: form.title.trim(),
          description: form.description || undefined,
          due_date: form.due_date,
        })).unwrap();
        setSuccessMsg('تم إرسال الواجب بانتظار موافقة الإدارة');
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditing(null);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: unknown) {
      setFormError(typeof err === 'string' ? err : 'تعذّر الحفظ');
    }
  }

  async function handleArchive(hw: Homework) {
    if (!confirm(`أرشفة الواجب «${hw.title}»؟ سيختفي عن الطلاب.`)) return;
    try {
      await dispatch(archiveHomework(hw.id)).unwrap();
      setSuccessMsg('تم أرشفة الواجب');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      setFormError(typeof err === 'string' ? err : 'تعذّر الأرشفة');
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
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: TH.goldGrad }} />
            <div>
              <h1 className="text-xl font-bold" style={{ color: TH.text }}>واجباتي</h1>
              <p className="text-xs mt-0.5" style={{ color: TH.textSub }}>إضافة وتعديل وأرشفة — الحذف من صلاحية الإدارة فقط</p>
            </div>
          </div>
          {scope === 'active' && (
            <button onClick={openCreate}
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: TH.goldGrad, color: '#fff' }}>
              + إضافة واجب
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {([
            { key: 'active' as const, label: 'النشطة' },
            { key: 'archived' as const, label: 'المؤرشفة' },
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
        ) : homeworks.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3" style={{ color: TH.textDim }}>
            <p style={{ fontWeight: 700 }}>{scope === 'archived' ? 'لا توجد واجبات مؤرشفة' : 'لا توجد واجبات بعد'}</p>
            {scope === 'active' && <p style={{ fontSize: 13 }}>اضغط «إضافة واجب» لبدء أول واجب</p>}
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
                  {scope === 'active' && (
                    <div className="flex gap-2 flex-wrap justify-end">
                      {hw.status === 'approved' && (
                        <button onClick={() => handleViewSubs(hw.id)}
                          className="text-xs px-3 py-1.5 rounded-lg"
                          style={{ background: TH.goldBg, color: TH.gold, border: `1px solid ${TH.goldBorder}` }}>
                          التسليمات
                        </button>
                      )}
                      <button onClick={() => openEdit(hw)}
                        className="text-xs px-3 py-1.5 rounded-lg"
                        style={{ background: '#F8FAFC', color: TH.text, border: '1px solid #EDE3CE' }}>
                        تعديل
                      </button>
                      <button onClick={() => handleArchive(hw)}
                        className="text-xs px-3 py-1.5 rounded-lg"
                        style={{ background: TH.amberBg, color: TH.amber, border: `1px solid ${TH.amberBorder}` }}>
                        أرشفة
                      </button>
                    </div>
                  )}
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
                            <a href={sub.file_url} target="_blank" rel="noreferrer" className="text-xs" style={{ color: TH.gold }}>عرض الملف</a>
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
          style={{ background: 'rgba(27,32,56,0.5)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowModal(false)}>
          <div className="w-full max-w-lg p-6 rounded-2xl"
            style={{ background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-2" style={{ color: TH.text }}>
              {editing ? 'تعديل الواجب' : 'إضافة واجب جديد'}
            </h2>
            <p className="text-xs mb-4" style={{ color: TH.textSub }}>
              {editing ? 'تعديل واجب معتمد يعيده لانتظار الموافقة' : 'يُرسل للإدارة للموافقة قبل ظهوره للطلاب'}
            </p>
            {formError && (
              <div style={{ background: TH.redBg, border: `1px solid ${TH.redBorder}`, color: TH.red, padding: '10px 12px', borderRadius: 10, marginBottom: 12, fontSize: 12, fontWeight: 600 }}>
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                style={{ ...baseInput, cursor: 'pointer' }} required>
                <option value="">اختر الدورة</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              {courses.length === 0 && (
                <p style={{ fontSize: 11, color: TH.textDim }}>لا توجد دورات مسندة لك حالياً</p>
              )}
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
                <button type="submit" disabled={saving || !form.course_id}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                  style={{ background: TH.goldGrad, color: '#fff' }}>
                  {saving ? 'جاري الحفظ...' : editing ? 'حفظ التعديل' : 'إرسال للموافقة'}
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
