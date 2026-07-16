import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  createTeacherCourse,
  fetchTeacherCourses,
  fetchTeacherDashboard,
} from '../features/teacher/teacherSlice';
import TeacherLayout from '../components/TeacherLayout';

const C = {
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  gold:'#C59341', goldL:'#D4A65A', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.22)',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', greenBg:'rgba(16,185,129,0.08)',
  red:'#EF4444', redBg:'rgba(239,68,68,0.08)',
  amber:'#D97706', amberBg:'rgba(217,119,6,0.08)',
};

const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 12,
  border: `1.5px solid ${C.border}`, fontSize: 13, fontFamily: "'Cairo',sans-serif",
  outline: 'none', boxSizing: 'border-box', background: '#FFFFFF',
  color: C.text, WebkitTextFillColor: C.text, caretColor: C.text,
};

function courseStatus(c: { approval_status?: string; is_active: boolean }) {
  if (c.approval_status === 'pending') return { label: 'انتظار الموافقة', color: C.amber, bg: C.amberBg };
  if (c.approval_status === 'rejected') return { label: 'مرفوضة', color: C.red, bg: C.redBg };
  if (c.is_active) return { label: 'نشطة', color: C.green, bg: C.greenBg };
  return { label: 'معطّلة', color: C.sub, bg: '#F3F4F6' };
}

const EMPTY = { title: '', description: '', subject_id: '', grade_id: '', price: '', is_free: false };

export default function TeacherCoursesPage() {
  const dispatch = useAppDispatch();
  const { courses, subjects, loading, error } = useAppSelector((s) => s.teacher);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    dispatch(fetchTeacherCourses());
    dispatch(fetchTeacherDashboard());
  }, [dispatch]);

  const selectedSubject = useMemo(
    () => subjects.find((s) => String(s.subject_id) === form.subject_id),
    [subjects, form.subject_id],
  );

  const gradeOptions = selectedSubject?.grades ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.subject_id) return;
    setSubmitting(true);
    setFormError('');
    try {
      await dispatch(createTeacherCourse({
        subject_id: Number(form.subject_id),
        grade_id: form.grade_id ? Number(form.grade_id) : null,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        is_free: form.is_free,
        price: form.is_free ? 0 : (form.price ? Number(form.price) : 0),
      })).unwrap();
      setSuccessMsg('تم إرسال الدورة بانتظار موافقة الإدارة');
      setForm(EMPTY);
      setTimeout(() => { setShowCreate(false); setSuccessMsg(''); }, 2000);
    } catch (err: unknown) {
      setFormError(typeof err === 'string' ? err : 'تعذّر إرسال الدورة');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = courses.filter((c) => c.approval_status === 'pending').length;

  return (
    <TeacherLayout>
      <div style={{ fontFamily: "'Cairo',sans-serif", background: C.bg, minHeight: '100vh', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 4, height: 28, borderRadius: 4, background: C.goldGrad }} />
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: C.text }}>دوراتي</h2>
              <p style={{ margin: 0, fontSize: 12, color: C.sub, marginTop: 2 }}>إنشاء دورة يُرسل لموافقة أدمن البلد</p>
            </div>
          </div>
          <button onClick={() => { setForm(EMPTY); setFormError(''); setShowCreate(true); }}
            style={{ padding: '10px 20px', borderRadius: 14, background: C.goldGrad, color: '#1B2038', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: "'Cairo',sans-serif" }}>
            + إنشاء دورة جديدة
          </button>
        </div>

        {pendingCount > 0 && (
          <div style={{ background: C.amberBg, border: '1px solid rgba(217,119,6,0.25)', borderRadius: 14, padding: '12px 16px', marginBottom: 16 }}>
            <p style={{ color: C.amber, fontWeight: 700, fontSize: 13 }}>{pendingCount} دورة بانتظار موافقة الأدمن</p>
          </div>
        )}

        {error && (
          <p style={{ padding: '12px 16px', borderRadius: 12, background: C.redBg, color: C.red, fontSize: 13, marginBottom: 16 }}>{error}</p>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', color: C.sub, padding: 40 }}>جارٍ التحميل...</p>
        ) : courses.length === 0 ? (
          <div style={{ background: C.card, borderRadius: 16, padding: 48, textAlign: 'center', border: `1px solid ${C.border}` }}>
            <p style={{ color: C.sub, fontWeight: 600 }}>لا توجد دورات بعد</p>
            <button onClick={() => setShowCreate(true)}
              style={{ marginTop: 16, padding: '12px 28px', borderRadius: 14, background: C.goldGrad, color: '#1B2038', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              + إنشاء دورة
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
            {courses.map((course) => {
              const st = courseStatus(course);
              return (
                <div key={course.id} style={{ background: C.card, borderRadius: 16, padding: 18, boxShadow: C.shadow, border: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                    <p style={{ color: C.text, fontWeight: 800, fontSize: 15, margin: 0 }}>{course.title}</p>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color, flexShrink: 0 }}>{st.label}</span>
                  </div>
                  {course.description && (
                    <p style={{ color: C.sub, fontSize: 12, marginBottom: 10 }}>{course.description}</p>
                  )}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    {course.subject?.name && (
                      <span style={{ padding: '3px 9px', borderRadius: 8, background: C.goldBg, color: C.gold, fontSize: 11, fontWeight: 600 }}>{course.subject.name}</span>
                    )}
                    {course.grade?.name && (
                      <span style={{ padding: '3px 9px', borderRadius: 8, background: 'rgba(0,0,0,0.04)', color: C.dim, fontSize: 11 }}>{course.grade.name}</span>
                    )}
                  </div>
                  <p style={{ fontWeight: 800, fontSize: 14, color: course.is_free ? C.green : C.gold, margin: 0 }}>
                    {course.is_free ? 'مجاني' : `${course.price}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {showCreate && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={() => setShowCreate(false)}>
            <div style={{ background: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
              onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h2 style={{ color: C.text, fontWeight: 900, fontSize: 18, margin: 0 }}>إنشاء دورة جديدة</h2>
                  <p style={{ color: C.sub, fontSize: 12, marginTop: 3 }}>ستُرسل للأدمن للمراجعة والموافقة</p>
                </div>
                <button type="button" onClick={() => setShowCreate(false)}
                  style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer' }}>✕</button>
              </div>

              {successMsg ? (
                <p style={{ color: C.green, fontWeight: 700, textAlign: 'center', padding: 24 }}>{successMsg}</p>
              ) : (
                <form onSubmit={handleSubmit}>
                  {formError && (
                    <div style={{ background: C.redBg, color: C.red, padding: '10px 12px', borderRadius: 10, marginBottom: 12, fontSize: 12, fontWeight: 600 }}>{formError}</div>
                  )}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.sub, marginBottom: 6 }}>عنوان الدورة *</label>
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required style={fieldStyle} placeholder="مثال: الرياضيات — الوحدة 4" />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.sub, marginBottom: 6 }}>الوصف</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...fieldStyle, resize: 'none' }} placeholder="وصف مختصر..." />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.sub, marginBottom: 6 }}>المادة *</label>
                      <select value={form.subject_id} required
                        onChange={(e) => setForm({ ...form, subject_id: e.target.value, grade_id: '' })}
                        style={fieldStyle}>
                        <option value="">— اختر —</option>
                        {subjects.map((s) => (
                          <option key={s.subject_id} value={s.subject_id}>{s.name}</option>
                        ))}
                      </select>
                      {subjects.length === 0 && (
                        <p style={{ fontSize: 11, color: C.dim, marginTop: 6 }}>لا توجد مواد مسندة لك — اطلب من الأدمن إسناد التخصص</p>
                      )}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.sub, marginBottom: 6 }}>الصف</label>
                      <select value={form.grade_id}
                        onChange={(e) => setForm({ ...form, grade_id: e.target.value })}
                        style={fieldStyle}
                        required={selectedSubject?.type === 'curriculum'}>
                        <option value="">— اختر —</option>
                        {gradeOptions.map((g) => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 8 }}>
                      <input type="checkbox" checked={form.is_free} onChange={(e) => setForm({ ...form, is_free: e.target.checked, price: '' })} />
                      <span style={{ fontSize: 13, color: C.text }}>دورة مجانية</span>
                    </label>
                    {!form.is_free && (
                      <input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                        placeholder="السعر" style={fieldStyle} />
                    )}
                  </div>
                  <div style={{ background: C.amberBg, border: '1px solid rgba(217,119,6,0.2)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: C.amber, marginBottom: 18 }}>
                    سيتم مراجعة الدورة من أدمن البلد قبل نشرها للطلاب.
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" disabled={submitting || !form.title.trim() || !form.subject_id}
                      style={{ flex: 1, padding: 12, borderRadius: 13, background: C.goldGrad, color: '#1B2038', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
                      {submitting ? 'جاري الإرسال...' : 'إرسال للمراجعة'}
                    </button>
                    <button type="button" onClick={() => setShowCreate(false)}
                      style={{ flex: 1, padding: 12, borderRadius: 13, background: 'transparent', border: `1.5px solid ${C.border}`, color: C.text, fontWeight: 700, cursor: 'pointer' }}>
                      إلغاء
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
