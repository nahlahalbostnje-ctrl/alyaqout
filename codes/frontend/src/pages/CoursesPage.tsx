import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchCategories } from '../features/admin/categoriesSlice';
import { fetchUsers } from '../features/admin/usersSlice';
import {
  fetchCourses,
  addCourse,
  assignTeacher,
  toggleCourse,
  deleteCourse,
  type CoursePayload,
  type Course,
} from '../features/admin/coursesSlice';
import AdminLayout from '../components/AdminLayout';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

/* ─── Design tokens ─────────────────────────────────────────── */
const DK = {
  gold: '#C59341',
  goldL: '#D4A65A',
  goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
  bg: '#F5EDD8',
  text: '#1B2038',
  sub: '#6B7280',
  border: '#EDE3CE',
  green: '#10B981',
  red: '#EF4444',
  blue: '#3B82F6',
};

const cardStyle = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: '#FFFFFF',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
  border: '1px solid #EDE3CE',
  ...extra,
});

const TH: React.CSSProperties = {
  padding: '11px 16px',
  textAlign: 'right',
  color: '#6B7280',
  fontSize: 12,
  fontWeight: 700,
  background: '#F8F5EE',
  borderBottom: '1px solid #EDE3CE',
  whiteSpace: 'nowrap',
};

const TD: React.CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid #F3EDE0',
  fontSize: 13,
  color: '#1B2038',
};

/* ─── Shared helpers ─────────────────────────────────────────── */
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
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 20, padding: 28, width: 480, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ color: '#1B2038', fontWeight: 900, fontSize: 17, margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #EDE3CE', background: 'transparent', cursor: 'pointer', fontSize: 16, color: '#6B7280' }}
          >✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Toggle Switch ─────────────────────────────────────────── */
function ToggleSwitch({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: on ? '#10B981' : '#D1D5DB',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s',
        opacity: disabled ? 0.5 : 1,
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 3, left: on ? 23 : 3,
        width: 18, height: 18,
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        transition: 'left 0.2s',
      }} />
    </div>
  );
}

/* ─── Empty course payload ───────────────────────────────────── */
const emptyForm: CoursePayload = {
  category_id: 0, title: '', description: '', price: 0, is_free: false, sort_order: 0,
};

/* ─── Main page ─────────────────────────────────────────────── */
export default function CoursesPage() {
  const dispatch = useAppDispatch();
  const { list: categories }       = useAppSelector((s) => s.categories);
  const { list: courses, loading } = useAppSelector((s) => s.courses);
  const { list: allUsers }         = useAppSelector((s) => s.adminUsers);
  const teachers = allUsers.filter((u) => u.role === 'teacher');

  const [filterCat, setFilterCat]         = useState<number | null>(null);
  const [showModal, setShowModal]         = useState(false);
  const [form, setForm]                   = useState<CoursePayload>(emptyForm);
  const [addError, setAddError]           = useState<string | null>(null);
  const [addLoading, setAddLoading]       = useState(false);
  const [toggling, setToggling]           = useState<number | null>(null);
  const [deleting, setDeleting]           = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: number; label: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [teacherTarget, setTeacherTarget] = useState<Course | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<number | ''>('');
  const [teacherLoading, setTeacherLoading]   = useState(false);
  const [teacherError, setTeacherError]       = useState<string | null>(null);
  const [focusedInput, setFocusedInput]   = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCategories(null));
    dispatch(fetchCourses(null));
    dispatch(fetchUsers(null));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchCourses(filterCat));
  }, [dispatch, filterCat]);

  const openModal = () => {
    setForm({ ...emptyForm, category_id: categories[0]?.id ?? 0 });
    setAddError(null);
    setShowModal(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category_id) { setAddError('اختر المادة الدراسية'); return; }
    setAddLoading(true);
    setAddError(null);
    const result = await dispatch(addCourse(form));
    setAddLoading(false);
    if (addCourse.fulfilled.match(result)) setShowModal(false);
    else setAddError(result.payload as string);
  };

  const openTeacherModal = (course: Course) => {
    setTeacherTarget(course);
    setSelectedTeacher(course.teacher?.id ?? '');
    setTeacherError(null);
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

  const askDelete = (id: number, label: string) => {
    setDeleteError(null);
    setPendingDelete({ id, label });
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

  const displayed = filterCat ? courses.filter((c) => c.category_id === filterCat) : courses;

  const inp = (field: string): React.CSSProperties => ({
    background: '#FFFFFF',
    border: `1.5px solid ${focusedInput === field ? '#C59341' : '#EDE3CE'}`,
    color: '#1B2038',
    borderRadius: 12,
    padding: '10px 14px',
    fontSize: 13,
    width: '100%',
    outline: 'none',
    fontFamily: "'Cairo',sans-serif",
    transition: 'border-color 0.2s',
    boxSizing: 'border-box' as const,
  });

  return (
    <AdminLayout>
      <div style={{ fontFamily: "'Cairo',sans-serif", background: '#F5EDD8', minHeight: '100vh', padding: 24 }}>

        <PageHeader
          title="الدورات التعليمية"
          sub="إدارة الدورات وتعيين المعلمين"
          action={
            <button
              onClick={openModal}
              style={{
                padding: '10px 20px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg,#C59341,#D4A65A)',
                color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                fontFamily: "'Cairo',sans-serif",
                boxShadow: '0 4px 14px rgba(197,147,65,0.3)',
              }}
            >
              + إضافة دورة
            </button>
          }
        />

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: DK.sub, marginLeft: 4 }}>تصفية:</span>
          <button
            onClick={() => setFilterCat(null)}
            style={{
              padding: '7px 16px', borderRadius: 20, cursor: 'pointer',
              background: filterCat === null ? 'linear-gradient(135deg,#C59341,#D4A65A)' : '#fff',
              color: filterCat === null ? '#fff' : DK.sub,
              fontWeight: 700, fontSize: 12,
              border: filterCat === null ? 'none' : '1px solid #EDE3CE',
              boxShadow: filterCat === null ? '0 2px 8px rgba(197,147,65,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
              fontFamily: "'Cairo',sans-serif",
            }}
          >
            الكل
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCat(cat.id)}
              style={{
                padding: '7px 16px', borderRadius: 20, cursor: 'pointer',
                background: filterCat === cat.id ? 'linear-gradient(135deg,#C59341,#D4A65A)' : '#fff',
                color: filterCat === cat.id ? '#fff' : DK.sub,
                fontWeight: 700, fontSize: 12,
                border: filterCat === cat.id ? 'none' : '1px solid #EDE3CE',
                boxShadow: filterCat === cat.id ? '0 2px 8px rgba(197,147,65,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
                fontFamily: "'Cairo',sans-serif",
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Courses Table */}
        <div style={cardStyle({ padding: 0, overflowX: 'auto' })}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                border: '3px solid rgba(197,147,65,0.15)',
                borderTopColor: '#C59341',
                animation: 'spin 0.8s linear infinite',
              }} />
            </div>
          ) : displayed.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '48px 0', color: DK.sub, fontSize: 14 }}>
              {categories.length === 0 ? 'أضف مواد دراسية أولاً.' : 'لا توجد دورات بعد. أضف أول دورة!'}
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
              <thead>
                <tr>
                  {['#', 'عنوان الدورة', 'القسم', 'المعلم', 'السعر', 'المشتركون', 'الحالة', 'إجراءات'].map((h) => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map((course, idx) => (
                  <tr
                    key={course.id}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(197,147,65,0.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                    style={{ transition: 'background 0.15s' }}
                  >
                    {/* # */}
                    <td style={{ ...TD, color: DK.sub, fontWeight: 700, width: 40 }}>
                      {idx + 1}
                    </td>

                    {/* Title + description */}
                    <td style={TD}>
                      <div style={{ fontWeight: 700, color: DK.text, marginBottom: 2 }}>{course.title}</div>
                      {course.description && (
                        <div style={{
                          fontSize: 11, color: DK.sub,
                          maxWidth: 200, overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {course.description}
                        </div>
                      )}
                    </td>

                    {/* Category / grade */}
                    <td style={TD}>
                      <div style={{ fontWeight: 600, color: DK.text }}>{course.category?.name ?? '—'}</div>
                      {course.category?.grade?.name && (
                        <div style={{ fontSize: 11, color: DK.sub }}>{course.category.grade.name}</div>
                      )}
                    </td>

                    {/* Teacher */}
                    <td style={TD}>
                      {course.teacher ? (
                        <button
                          onClick={() => openTeacherModal(course)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: DK.gold, fontWeight: 700, fontSize: 13,
                            fontFamily: "'Cairo',sans-serif", padding: 0,
                            textDecoration: 'underline',
                          }}
                        >
                          {course.teacher.name}
                        </button>
                      ) : (
                        <button
                          onClick={() => openTeacherModal(course)}
                          style={{
                            padding: '4px 10px', borderRadius: 8, border: 'none',
                            background: 'rgba(197,147,65,0.10)', color: DK.gold,
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            fontFamily: "'Cairo',sans-serif",
                          }}
                        >
                          + تعيين معلم
                        </button>
                      )}
                    </td>

                    {/* Price */}
                    <td style={TD}>
                      {course.is_free ? (
                        <span style={{
                          display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                          background: 'rgba(16,185,129,0.10)', color: '#10B981',
                          fontSize: 12, fontWeight: 700,
                        }}>مجاني</span>
                      ) : (
                        <span dir="ltr" style={{ fontWeight: 700, color: DK.text }}>
                          {Number(course.price).toFixed(2)}{' '}
                          <span style={{ fontSize: 11, color: DK.sub }}>ر.س</span>
                        </span>
                      )}
                    </td>

                    {/* Subscribers */}
                    <td style={TD}>
                      <span style={{
                        display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                        background: 'rgba(59,130,246,0.10)', color: '#3B82F6',
                        fontSize: 12, fontWeight: 700,
                      }}>
                        {(course as any).subscribers_count ?? 0}
                      </span>
                    </td>

                    {/* Status toggle */}
                    <td style={TD}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ToggleSwitch
                          on={course.is_active}
                          onClick={() => handleToggle(course.id)}
                          disabled={toggling === course.id}
                        />
                        <span style={{
                          padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                          background: course.is_active ? 'rgba(16,185,129,0.10)' : 'rgba(239,68,68,0.08)',
                          color: course.is_active ? '#10B981' : '#EF4444',
                        }}>
                          {toggling === course.id ? '...' : course.is_active ? 'نشط' : 'معطّل'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={TD}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <Link
                          to={`/admin/courses/${course.id}/content`}
                          style={{
                            padding: '5px 12px', borderRadius: 8,
                            background: 'rgba(197,147,65,0.10)', color: DK.gold,
                            fontSize: 12, fontWeight: 700, textDecoration: 'none',
                            display: 'inline-block',
                          }}
                        >
                          المحتوى
                        </Link>
                        <button
                          onClick={() => handleToggle(course.id)}
                          disabled={toggling === course.id}
                          style={{
                            padding: '5px 12px', borderRadius: 8, border: 'none',
                            background: course.is_active ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                            color: course.is_active ? '#EF4444' : '#10B981',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            fontFamily: "'Cairo',sans-serif",
                            opacity: toggling === course.id ? 0.5 : 1,
                          }}
                        >
                          {toggling === course.id ? '...' : course.is_active ? 'تعطيل' : 'تفعيل'}
                        </button>
                        <button
                          onClick={() => askDelete(course.id, course.title)}
                          disabled={deleting === course.id}
                          style={{
                            padding: '5px 12px', borderRadius: 8,
                            border: '1px solid #EDE3CE', background: '#fff', color: '#EF4444',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            fontFamily: "'Cairo',sans-serif",
                            opacity: deleting === course.id ? 0.5 : 1,
                          }}
                        >
                          {deleting === course.id ? '...' : 'حذف'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Course Modal */}
      {showModal && (
        <Modal title="إضافة دورة تعليمية" onClose={() => setShowModal(false)}>
          <form onSubmit={handleAdd}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: DK.gold, marginBottom: 6 }}>
                المادة الدراسية
              </label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
                onFocus={() => setFocusedInput('cat')}
                onBlur={() => setFocusedInput(null)}
                style={{ ...inp('cat'), cursor: 'pointer' }}
              >
                <option value={0} disabled>اختر المادة الدراسية</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: DK.gold, marginBottom: 6 }}>
                عنوان الدورة
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="مثال: دورة الرياضيات الشاملة"
                required
                autoFocus
                onFocus={() => setFocusedInput('title')}
                onBlur={() => setFocusedInput(null)}
                style={inp('title')}
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: DK.gold, marginBottom: 6 }}>
                الوصف (اختياري)
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="وصف مختصر..."
                rows={2}
                onFocus={() => setFocusedInput('desc')}
                onBlur={() => setFocusedInput(null)}
                style={{ ...inp('desc'), resize: 'none' }}
              />
            </div>
            <label style={{
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
              marginBottom: 14, fontSize: 13, color: DK.sub, fontWeight: 600,
            }}>
              <input
                type="checkbox"
                checked={form.is_free}
                onChange={(e) => setForm({ ...form, is_free: e.target.checked, price: 0 })}
                style={{ width: 16, height: 16, accentColor: '#C59341' }}
              />
              دورة مجانية
            </label>
            {!form.is_free && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: DK.gold, marginBottom: 6 }}>
                  السعر (ر.س)
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  min={0}
                  step={0.01}
                  dir="ltr"
                  onFocus={() => setFocusedInput('price')}
                  onBlur={() => setFocusedInput(null)}
                  style={inp('price')}
                />
              </div>
            )}
            {addError && (
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#EF4444', borderRadius: 10, padding: '8px 12px', fontSize: 12, marginBottom: 14,
              }}>
                {addError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="submit"
                disabled={addLoading}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg,#C59341,#D4A65A)', color: '#fff',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  fontFamily: "'Cairo',sans-serif",
                  opacity: addLoading ? 0.6 : 1,
                }}
              >
                {addLoading ? 'جاري الإضافة...' : 'إضافة'}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 12,
                  border: '1px solid #EDE3CE', background: '#fff', color: '#6B7280',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  fontFamily: "'Cairo',sans-serif",
                }}
              >
                إلغاء
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Assign Teacher Modal */}
      {teacherTarget && (
        <Modal title="تعيين معلم للدورة" onClose={() => setTeacherTarget(null)}>
          <div style={{
            padding: '8px 12px', borderRadius: 10,
            background: 'rgba(197,147,65,0.08)', border: '1px solid rgba(197,147,65,0.2)',
            marginBottom: 18,
          }}>
            <span style={{ fontSize: 12, color: DK.sub }}>الدورة: </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: DK.gold }}>{teacherTarget.title}</span>
          </div>
          <form onSubmit={handleAssignTeacher}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: DK.gold, marginBottom: 6 }}>
                اختر المعلم
              </label>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value === '' ? '' : Number(e.target.value))}
                onFocus={() => setFocusedInput('teacher')}
                onBlur={() => setFocusedInput(null)}
                style={{ ...inp('teacher'), cursor: 'pointer' }}
              >
                <option value="">— بدون معلم —</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {teachers.length === 0 && (
                <p style={{ fontSize: 12, color: DK.gold, marginTop: 6, marginBottom: 0 }}>
                  لا يوجد معلمون. أضف معلمين أولاً من صفحة المستخدمين.
                </p>
              )}
            </div>
            {teacherError && (
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#EF4444', borderRadius: 10, padding: '8px 12px', fontSize: 12, marginBottom: 14,
              }}>
                {teacherError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="submit"
                disabled={teacherLoading}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg,#C59341,#D4A65A)', color: '#fff',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  fontFamily: "'Cairo',sans-serif",
                  opacity: teacherLoading ? 0.6 : 1,
                }}
              >
                {teacherLoading ? 'جاري الحفظ...' : 'حفظ'}
              </button>
              <button
                type="button"
                onClick={() => setTeacherTarget(null)}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 12,
                  border: '1px solid #EDE3CE', background: '#fff', color: '#6B7280',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  fontFamily: "'Cairo',sans-serif",
                }}
              >
                إلغاء
              </button>
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
