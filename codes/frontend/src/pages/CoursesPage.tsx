import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchSubjects } from '../features/admin/subjectsSlice';
import { fetchUsers } from '../features/admin/usersSlice';
import {
  fetchCourses,
  addCourse,
  updateCourse,
  assignTeacher,
  toggleCourse,
  deleteCourse,
  type CoursePayload,
  type Course,
} from '../features/admin/coursesSlice';
import api from '../services/axios';
import AdminLayout from '../components/AdminLayout';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { useCurrency } from '../hooks/useCurrency';

const DK = {
  gold: '#C59341', goldL: '#D4A65A',
  goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
  bg: '#F5EDD8', text: '#1B2038', sub: '#6B7280', border: '#EDE3CE',
  green: '#10B981', red: '#EF4444', blue: '#3B82F6',
};

const cardStyle = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: '#FFFFFF', borderRadius: 16, padding: 20,
  boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #EDE3CE', ...extra,
});

const TH: React.CSSProperties = {
  padding: '11px 16px', textAlign: 'right', color: '#6B7280', fontSize: 12, fontWeight: 700,
  background: '#F8F5EE', borderBottom: '1px solid #EDE3CE', whiteSpace: 'nowrap',
};
const TD: React.CSSProperties = {
  padding: '12px 16px', borderBottom: '1px solid #F3EDE0', fontSize: 13, color: '#1B2038',
};

function PageHeader({ title, sub, action }: { title: string; sub: string; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 4, height: 20, borderRadius: 2, background: '#C59341' }} />
          <h1 style={{ color: '#1B2038', fontWeight: 900, fontSize: 20, margin: 0 }}>{title}</h1>
        </div>
        <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>{sub}</p>
      </div>
      {action}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: 480, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ color: '#1B2038', fontWeight: 900, fontSize: 17, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #EDE3CE', background: 'transparent', cursor: 'pointer', fontSize: 16, color: '#6B7280' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ToggleSwitch({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <div onClick={disabled ? undefined : onClick} style={{
      width: 44, height: 24, borderRadius: 12, background: on ? '#10B981' : '#D1D5DB',
      position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, flexShrink: 0,
    }}>
      <div style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.18)', transition: 'left 0.2s' }} />
    </div>
  );
}

const emptyForm: CoursePayload = {
  subject_id: 0, grade_id: null, teacher_id: null,
  title: '', description: '', price: 0, is_free: false, sort_order: 0,
};

type EligibleTeacher = { id: number; name: string };

export default function CoursesPage() {
  const dispatch = useAppDispatch();
  const { formatMoney, withLabel } = useCurrency();
  const { list: subjects } = useAppSelector((s) => s.subjects);
  const { list: courses, loading } = useAppSelector((s) => s.courses);
  const { list: allUsers } = useAppSelector((s) => s.adminUsers);
  const teachers = allUsers.filter((u) => u.role === 'teacher');

  const [filterSubject, setFilterSubject] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Course | null>(null);
  const [form, setForm] = useState<CoursePayload>(emptyForm);
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: number; label: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [teacherTarget, setTeacherTarget] = useState<Course | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<number | ''>('');
  const [eligibleTeachers, setEligibleTeachers] = useState<EligibleTeacher[]>([]);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherError, setTeacherError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchSubjects(null));
    dispatch(fetchCourses(null));
    dispatch(fetchUsers(null));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchCourses(filterSubject));
  }, [dispatch, filterSubject]);

  const selectedSubject = useMemo(
    () => subjects.find((s) => s.id === form.subject_id) ?? null,
    [subjects, form.subject_id]
  );

  const gradeOptions = selectedSubject?.grades ?? [];
  const needsGrade = selectedSubject?.type === 'curriculum'
    || (selectedSubject?.type === 'extracurricular' && gradeOptions.length > 0);

  const openModal = () => {
    setEditTarget(null);
    const first = subjects[0];
    setForm({
      ...emptyForm,
      subject_id: first?.id ?? 0,
      grade_id: first?.grades?.[0]?.id ?? null,
    });
    setAddError(null);
    setShowModal(true);
  };

  const openEdit = (course: Course) => {
    setEditTarget(course);
    setForm({
      subject_id: course.subject_id ?? 0,
      grade_id: course.grade_id,
      title: course.title,
      description: course.description ?? '',
      price: Number(course.price),
      is_free: course.is_free,
      sort_order: course.sort_order,
    });
    setAddError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setAddError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget && !form.subject_id) { setAddError('اختر المادة'); return; }
    if (!editTarget && needsGrade && !form.grade_id) { setAddError('اختر الصف'); return; }
    if (!form.title.trim()) { setAddError('عنوان الدورة مطلوب'); return; }
    setAddLoading(true);
    setAddError(null);
    const result = editTarget
      ? await dispatch(updateCourse({
          id: editTarget.id,
          title: form.title.trim(),
          description: form.description,
          price: form.price,
          is_free: form.is_free,
          sort_order: form.sort_order,
          subject_id: form.subject_id || undefined,
          grade_id: form.grade_id,
        }))
      : await dispatch(addCourse({
          ...form,
          title: form.title.trim(),
          grade_id: form.grade_id || null,
        }));
    setAddLoading(false);
    if (
      (editTarget && updateCourse.fulfilled.match(result)) ||
      (!editTarget && addCourse.fulfilled.match(result))
    ) {
      closeModal();
    } else {
      setAddError(result.payload as string);
    }
  };

  const openTeacherModal = async (course: Course) => {
    setTeacherTarget(course);
    setSelectedTeacher(course.teacher?.id ?? '');
    setTeacherError(null);
    setEligibleTeachers(teachers.map((t) => ({ id: t.id, name: t.name })));

    if (!course.subject_id) return;

    // Filter teachers assigned to this subject (+ grade when set)
    const checks = await Promise.all(
      teachers.map(async (t) => {
        try {
          const { data } = await api.get(`/admin/teachers/${t.id}/subjects`);
          const rows = data.data as { subject_id: number; grade_ids: number[] }[];
          const row = rows.find((r) => r.subject_id === course.subject_id);
          if (!row) return null;
          if (course.grade_id && row.grade_ids.length > 0 && !row.grade_ids.includes(course.grade_id)) {
            return null;
          }
          return { id: t.id, name: t.name };
        } catch {
          return { id: t.id, name: t.name };
        }
      })
    );
    const filtered = checks.filter(Boolean) as EligibleTeacher[];
    setEligibleTeachers(filtered.length ? filtered : []);
  };

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherTarget) return;
    setTeacherLoading(true);
    setTeacherError(null);
    const result = await dispatch(assignTeacher({
      courseId: teacherTarget.id,
      teacherId: selectedTeacher === '' ? null : Number(selectedTeacher),
    }));
    setTeacherLoading(false);
    if (assignTeacher.fulfilled.match(result)) setTeacherTarget(null);
    else setTeacherError(result.payload as string);
  };

  const handleToggle = async (id: number) => {
    setToggling(id);
    await dispatch(toggleCourse(id));
    setToggling(null);
  };

  const confirmPendingDelete = async () => {
    if (!pendingDelete) return;
    setDeleteBusy(true);
    setDeleteError(null);
    setDeleting(pendingDelete.id);
    try {
      await dispatch(deleteCourse(pendingDelete.id));
      setPendingDelete(null);
    } catch {
      setDeleteError('تعذّر حذف الدورة');
    } finally {
      setDeleting(null);
      setDeleteBusy(false);
    }
  };

  const displayed = filterSubject ? courses.filter((c) => c.subject_id === filterSubject) : courses;

  const inp = (): React.CSSProperties => ({
    background: '#FFFFFF',
    border: '1.5px solid #EDE3CE',
    color: '#1B2038', borderRadius: 12, padding: '10px 14px', fontSize: 13, width: '100%',
    outline: 'none', fontFamily: "'Cairo',sans-serif", boxSizing: 'border-box',
  });

  return (
    <AdminLayout>
      <div style={{ fontFamily: "'Cairo',sans-serif", background: '#F5EDD8', minHeight: '100vh', padding: 24 }}>
        <PageHeader
          title="الدورات التعليمية"
          sub="دورة = مادة + صف + معلم مؤهل"
          action={
            <button onClick={openModal} style={{
              padding: '10px 20px', borderRadius: 12, border: 'none', background: DK.goldGrad,
              color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
              boxShadow: '0 4px 14px rgba(197,147,65,0.3)',
            }}>+ إضافة دورة</button>
          }
        />

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: DK.sub }}>تصفية:</span>
          <button onClick={() => setFilterSubject(null)} style={{
            padding: '7px 16px', borderRadius: 20, cursor: 'pointer',
            background: filterSubject === null ? DK.goldGrad : '#fff',
            color: filterSubject === null ? '#fff' : DK.sub, fontWeight: 700, fontSize: 12,
            border: filterSubject === null ? 'none' : '1px solid #EDE3CE', fontFamily: "'Cairo',sans-serif",
          }}>الكل</button>
          {subjects.map((s) => (
            <button key={s.id} onClick={() => setFilterSubject(s.id)} style={{
              padding: '7px 16px', borderRadius: 20, cursor: 'pointer',
              background: filterSubject === s.id ? DK.goldGrad : '#fff',
              color: filterSubject === s.id ? '#fff' : DK.sub, fontWeight: 700, fontSize: 12,
              border: filterSubject === s.id ? 'none' : '1px solid #EDE3CE', fontFamily: "'Cairo',sans-serif",
            }}>{s.name}</button>
          ))}
        </div>

        <div style={cardStyle({ padding: 0, overflowX: 'auto' })}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: DK.sub }}>جاري التحميل...</div>
          ) : displayed.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '48px 0', color: DK.sub, fontSize: 14 }}>
              {subjects.length === 0 ? 'أضف مواد أولاً من صفحة المواد.' : 'لا توجد دورات بعد. أضف أول دورة!'}
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
              <thead>
                <tr>{['#', 'عنوان الدورة', 'المادة / الصف', 'المعلم', 'السعر', 'الحالة', 'إجراءات'].map((h) => <th key={h} style={TH}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {displayed.map((course, idx) => (
                  <tr key={course.id}>
                    <td style={{ ...TD, color: DK.sub, fontWeight: 700 }}>{idx + 1}</td>
                    <td style={TD}>
                      <Link to={`/admin/courses/${course.id}`} style={{ fontWeight: 700, color: DK.text, textDecoration: 'none' }}>
                        {course.title}
                      </Link>
                      {course.description && <div style={{ fontSize: 11, color: DK.sub }}>{course.description}</div>}
                    </td>
                    <td style={TD}>
                      <div style={{ fontWeight: 600 }}>{course.subject?.name ?? course.category?.name ?? '—'}</div>
                      <div style={{ fontSize: 11, color: DK.sub }}>
                        {course.grade?.name ?? course.category?.grade?.name ?? (course.subject?.type === 'extracurricular' ? 'غير منهجي' : '—')}
                      </div>
                    </td>
                    <td style={TD}>
                      <button onClick={() => void openTeacherModal(course)} style={{
                        background: 'none', border: 'none', cursor: 'pointer', color: DK.gold,
                        fontWeight: 700, fontSize: 13, fontFamily: "'Cairo',sans-serif", padding: 0,
                        textDecoration: course.teacher ? 'underline' : 'none',
                      }}>
                        {course.teacher?.name ?? '+ تعيين معلم'}
                      </button>
                    </td>
                    <td style={TD}>
                      {course.is_free ? (
                        <span style={{ padding: '2px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.10)', color: '#10B981', fontSize: 12, fontWeight: 700 }}>مجاني</span>
                      ) : (
                        <span dir="ltr" style={{ fontWeight: 700 }}>{formatMoney(course.price)}</span>
                      )}
                    </td>
                    <td style={TD}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {course.approval_status === 'pending' && (
                          <span style={{ padding: '2px 10px', borderRadius: 20, background: 'rgba(217,119,6,0.12)', color: '#D97706', fontSize: 11, fontWeight: 700, width: 'fit-content' }}>
                            بانتظار الموافقة
                          </span>
                        )}
                        {course.approval_status === 'rejected' && (
                          <span style={{ padding: '2px 10px', borderRadius: 20, background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontSize: 11, fontWeight: 700, width: 'fit-content' }}>
                            مرفوضة
                          </span>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <ToggleSwitch on={course.is_active} onClick={() => handleToggle(course.id)} disabled={toggling === course.id} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: course.is_active ? DK.green : DK.red }}>
                            {course.is_active ? 'نشط' : 'معطّل'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={TD}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <Link to={`/admin/courses/${course.id}`} style={{
                          padding: '5px 12px', borderRadius: 8, background: DK.goldGrad,
                          color: '#1B2038', fontSize: 12, fontWeight: 800, textDecoration: 'none',
                        }}>ملف الدورة</Link>
                        <button onClick={() => openEdit(course)} style={{
                          padding: '5px 12px', borderRadius: 8, border: '1px solid #EDE3CE',
                          background: '#fff', color: DK.gold, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        }}>تعديل</button>
                        <Link to={`/admin/courses/${course.id}/content`} style={{
                          padding: '5px 12px', borderRadius: 8, background: 'rgba(197,147,65,0.10)',
                          color: DK.gold, fontSize: 12, fontWeight: 700, textDecoration: 'none',
                        }}>المحتوى</Link>
                        <button onClick={() => setPendingDelete({ id: course.id, label: course.title })} disabled={deleting === course.id} style={{
                          padding: '5px 12px', borderRadius: 8, border: '1px solid #EDE3CE',
                          background: '#fff', color: DK.red, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        }}>حذف</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <Modal title={editTarget ? `تعديل ${editTarget.title}` : 'إضافة دورة تعليمية'} onClose={closeModal}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: DK.gold, marginBottom: 6 }}>المادة</label>
              <select
                value={form.subject_id}
                onChange={(e) => {
                  const sid = Number(e.target.value);
                  const sub = subjects.find((s) => s.id === sid);
                  setForm({
                    ...form,
                    subject_id: sid,
                    grade_id: sub?.grades?.[0]?.id ?? null,
                  });
                }}
                style={{ ...inp(), cursor: 'pointer' }}
              >
                <option value={0} disabled>اختر المادة</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.type === 'curriculum' ? 'منهجية' : 'غير منهجية'})
                  </option>
                ))}
              </select>
            </div>
            {selectedSubject && (needsGrade || gradeOptions.length > 0) && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: DK.gold, marginBottom: 6 }}>
                  الصف {selectedSubject.type === 'extracurricular' && gradeOptions.length === 0 ? '(اختياري)' : ''}
                </label>
                <select
                  value={form.grade_id ?? ''}
                  onChange={(e) => setForm({ ...form, grade_id: e.target.value ? Number(e.target.value) : null })}
                  style={{ ...inp(), cursor: 'pointer' }}
                >
                  <option value="">{selectedSubject.type === 'curriculum' ? 'اختر الصف' : 'كل الصفوف / بدون تقييد'}</option>
                  {gradeOptions.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: DK.gold, marginBottom: 6 }}>عنوان الدورة</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required style={inp()} placeholder="مثال: رياضيات سادس — مجموعة أ" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: DK.gold, marginBottom: 6 }}>الوصف</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} style={{ ...inp(), resize: 'none' }} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 14, fontSize: 13, color: DK.sub, fontWeight: 600 }}>
              <input type="checkbox" checked={form.is_free} onChange={(e) => setForm({ ...form, is_free: e.target.checked, price: 0 })} style={{ width: 16, height: 16, accentColor: '#C59341' }} />
              دورة مجانية
            </label>
            {!form.is_free && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: DK.gold, marginBottom: 6 }}>{withLabel('السعر')}</label>
                <input type="number" min={0} step={0.01} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} dir="ltr" style={inp()} />
              </div>
            )}
            {addError && <p style={{ color: DK.red, fontSize: 12, marginBottom: 12 }}>{addError}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={addLoading} style={{
                flex: 1, padding: '11px 0', borderRadius: 12, border: 'none', background: DK.goldGrad,
                color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: addLoading ? 0.6 : 1,
              }}>{addLoading ? 'جارٍ الحفظ...' : 'حفظ'}</button>
              <button type="button" onClick={closeModal} style={{
                flex: 1, padding: '11px 0', borderRadius: 12, border: '1px solid #EDE3CE',
                background: '#fff', color: DK.sub, fontWeight: 700, cursor: 'pointer',
              }}>إلغاء</button>
            </div>
          </form>
        </Modal>
      )}

      {teacherTarget && (
        <Modal title="تعيين معلم للدورة" onClose={() => setTeacherTarget(null)}>
          <p style={{ fontSize: 13, marginBottom: 14 }}>
            <span style={{ color: DK.sub }}>الدورة: </span>
            <strong style={{ color: DK.gold }}>{teacherTarget.title}</strong>
          </p>
          <form onSubmit={handleAssignTeacher}>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value === '' ? '' : Number(e.target.value))}
              style={{ ...inp(), cursor: 'pointer', marginBottom: 14 }}
            >
              <option value="">— بدون معلم —</option>
              {(eligibleTeachers.length ? eligibleTeachers : teachers).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {eligibleTeachers.length === 0 && (
              <p style={{ fontSize: 12, color: DK.sub, marginBottom: 12 }}>
                لا يوجد معلمون مسندون لهذه المادة/الصف. أسند التخصص من صفحة المستخدمين أولاً.
              </p>
            )}
            {teacherError && <p style={{ color: DK.red, fontSize: 12, marginBottom: 12 }}>{teacherError}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={teacherLoading} style={{
                flex: 1, padding: '11px 0', borderRadius: 12, border: 'none', background: DK.goldGrad,
                color: '#fff', fontWeight: 700, cursor: 'pointer',
              }}>{teacherLoading ? 'جاري الحفظ...' : 'حفظ'}</button>
              <button type="button" onClick={() => setTeacherTarget(null)} style={{
                flex: 1, padding: '11px 0', borderRadius: 12, border: '1px solid #EDE3CE',
                background: '#fff', color: DK.sub, fontWeight: 700, cursor: 'pointer',
              }}>إلغاء</button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDeleteModal
        open={!!pendingDelete}
        itemLabel={pendingDelete?.label}
        busy={deleteBusy}
        error={deleteError}
        onConfirm={() => void confirmPendingDelete()}
        onCancel={() => { if (!deleteBusy) { setPendingDelete(null); setDeleteError(null); } }}
      />
    </AdminLayout>
  );
}
