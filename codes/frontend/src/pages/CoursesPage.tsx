import { useEffect, useState } from 'react';
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

const DK = {
  card:    { background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  gold:    '#C9952A',
  goldL:   '#DDAD50',
  navy:    '#fff',
  dimTxt:  '#6B7280',
  inputStyle: {
    background: '#FFFFFF',
    border: '1px solid #EDE3CE',
    color: '#1B2038',
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
  }
};

const emptyForm: CoursePayload = {
  category_id: 0, title: '', description: '', price: 0, is_free: false, sort_order: 0,
};

export default function CoursesPage() {
  const dispatch = useAppDispatch();
  const { list: categories }       = useAppSelector((s) => s.categories);
  const { list: courses, loading } = useAppSelector((s) => s.courses);
  const { list: allUsers }         = useAppSelector((s) => s.adminUsers);
  const teachers = allUsers.filter((u) => u.role === 'teacher');

  const [filterCat, setFilterCat]     = useState<number | null>(null);
  const [showModal, setShowModal]     = useState(false);
  const [form, setForm]               = useState<CoursePayload>(emptyForm);
  const [addError, setAddError]       = useState<string | null>(null);
  const [addLoading, setAddLoading]   = useState(false);
  const [toggling, setToggling]       = useState<number | null>(null);
  const [deleting, setDeleting]       = useState<number | null>(null);
  const [teacherTarget, setTeacherTarget] = useState<Course | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<number | ''>('');
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherError, setTeacherError]     = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

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
    setAddLoading(true); setAddError(null);
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
    setTeacherLoading(true); setTeacherError(null);
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

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الدورة؟')) return;
    setDeleting(id);
    await dispatch(deleteCourse(id));
    setDeleting(null);
  };

  const displayed = filterCat ? courses.filter((c) => c.category_id === filterCat) : courses;
  const inputStyle = (field: string) => ({
    ...DK.inputStyle,
    border: focusedInput === field ? '1px solid #C9952A' : '1px solid #EDE3CE',
  });

  return (
    <AdminLayout>
      <div className="p-6" style={{ fontFamily: "'Cairo', sans-serif", background: '#F5EDD8', minHeight: '100vh' }}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #C9952A, #DDAD50)' }} />
            <h2 className="text-xl font-bold" style={{ color: '#1B2038' }}>الدورات التعليمية</h2>
          </div>
          <button onClick={openModal} className="text-sm px-4 py-2 rounded-xl font-semibold transition"
            style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }}>
            + إضافة دورة
          </button>
        </div>

        {/* Filter by category */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button onClick={() => setFilterCat(null)} className="text-sm px-4 py-1.5 rounded-full transition"
            style={{
              background: filterCat === null ? 'linear-gradient(135deg, #C9952A, #DDAD50)' : '#FFFFFF',
              color: filterCat === null ? '#fff' : DK.dimTxt,
              border: filterCat === null ? 'none' : '1px solid #EDE3CE',
            }}>الكل</button>
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setFilterCat(cat.id)} className="text-sm px-4 py-1.5 rounded-full transition"
              style={{
                background: filterCat === cat.id ? 'linear-gradient(135deg, #C9952A, #DDAD50)' : '#FFFFFF',
                color: filterCat === cat.id ? '#fff' : DK.dimTxt,
                border: filterCat === cat.id ? 'none' : '1px solid #EDE3CE',
              }}>{cat.name}</button>
          ))}
        </div>

        <div style={{ ...DK.card, borderRadius: '16px', overflow: 'hidden' }}>
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid rgba(201,149,42,0.15)', borderTopColor: '#C9952A' }} />
            </div>
          ) : displayed.length === 0 ? (
            <p className="text-center py-12" style={{ color: DK.dimTxt }}>
              {categories.length === 0 ? 'أضف مواد دراسية أولاً.' : 'لا توجد دورات بعد. أضف أول دورة!'}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #EDE3CE' }}>
                <tr>
                  {['الدورة', 'المادة / الصف', 'المعلم', 'السعر', 'الحالة', 'إجراءات'].map((h) => (
                    <th key={h} className="px-4 py-3 text-right font-semibold uppercase text-xs tracking-wider"
                      style={{ color: DK.gold }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map((course) => (
                  <tr key={course.id} className="transition"
                    style={{ borderBottom: '1px solid #EDE3CE' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,149,42,0.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <td className="px-4 py-4">
                      <p className="font-medium" style={{ color: '#1B2038' }}>{course.title}</p>
                      {course.description && (
                        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: DK.dimTxt }}>{course.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p style={{ color: '#1B2038' }}>{course.category?.name ?? '—'}</p>
                      <p className="text-xs" style={{ color: DK.dimTxt }}>{course.category?.grade?.name ?? ''}</p>
                    </td>
                    <td className="px-4 py-4">
                      {course.teacher ? (
                        <button onClick={() => openTeacherModal(course)}
                          className="text-xs hover:underline" style={{ color: DK.gold }}>
                          {course.teacher.name}
                        </button>
                      ) : (
                        <button onClick={() => openTeacherModal(course)}
                          className="text-xs px-2 py-1 rounded-lg transition"
                          style={{ background: 'rgba(201,149,42,0.08)', color: DK.gold }}>
                          + تعيين معلم
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {course.is_free
                        ? <span className="text-xs font-medium" style={{ color: '#10B981' }}>مجاني</span>
                        : <span style={{ color: '#1B2038' }} dir="ltr">{Number(course.price).toFixed(2)}</span>
                      }
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium"
                        style={course.is_active
                          ? { background: 'rgba(16,185,129,0.08)', color: '#10B981' }
                          : { background: '#F9FAFB', color: DK.dimTxt }}>
                        {course.is_active ? 'نشط' : 'معطّل'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        <Link to={`/admin/courses/${course.id}/content`}
                          className="text-xs px-3 py-1.5 rounded-lg transition font-medium"
                          style={{ background: 'rgba(201,149,42,0.08)', color: DK.gold }}>
                          المحتوى
                        </Link>
                        <button onClick={() => handleToggle(course.id)} disabled={toggling === course.id}
                          className="text-xs px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                          style={course.is_active
                            ? { background: 'rgba(239,68,68,0.08)', color: '#EF4444' }
                            : { background: 'rgba(16,185,129,0.08)', color: '#10B981' }}>
                          {toggling === course.id ? '...' : course.is_active ? 'تعطيل' : 'تفعيل'}
                        </button>
                        <button onClick={() => handleDelete(course.id)} disabled={deleting === course.id}
                          className="text-xs px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                          style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>
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
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md p-6 rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid #EDE3CE' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#1B2038' }}>إضافة دورة تعليمية</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-sm mb-1" style={{ color: DK.dimTxt }}>المادة الدراسية</label>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
                  onFocus={() => setFocusedInput('cat')} onBlur={() => setFocusedInput(null)}
                  style={{ ...inputStyle('cat'), cursor: 'pointer' }}>
                  <option value={0} disabled>اختر المادة</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: DK.dimTxt }}>عنوان الدورة</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="مثال: دورة الرياضيات الشاملة" required autoFocus
                  onFocus={() => setFocusedInput('title')} onBlur={() => setFocusedInput(null)}
                  style={inputStyle('title')} />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: DK.dimTxt }}>الوصف (اختياري)</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="وصف مختصر..." rows={2}
                  onFocus={() => setFocusedInput('desc')} onBlur={() => setFocusedInput(null)}
                  style={{ ...inputStyle('desc'), resize: 'none' }} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_free}
                  onChange={(e) => setForm({ ...form, is_free: e.target.checked, price: 0 })}
                  className="w-4 h-4" style={{ accentColor: '#C9952A' }} />
                <span className="text-sm" style={{ color: DK.dimTxt }}>دورة مجانية</span>
              </label>
              {!form.is_free && (
                <div>
                  <label className="block text-sm mb-1" style={{ color: DK.dimTxt }}>السعر</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    min={0} step={0.01} dir="ltr"
                    onFocus={() => setFocusedInput('price')} onBlur={() => setFocusedInput(null)}
                    style={inputStyle('price')} />
                </div>
              )}
              {addError && <p className="text-sm px-3 py-2 rounded-lg" style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)' }}>{addError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={addLoading}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }}>
                  {addLoading ? 'جاري الإضافة...' : 'إضافة'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-xl text-sm"
                  style={{ background: '#F9FAFB', color: DK.dimTxt, border: '1px solid #EDE3CE' }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {teacherTarget && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-sm p-6 rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid #EDE3CE' }}>
            <h3 className="text-lg font-semibold mb-1" style={{ color: '#1B2038' }}>تعيين معلم</h3>
            <p className="text-sm mb-4" style={{ color: DK.dimTxt }}>
              دورة: <span className="font-medium" style={{ color: DK.gold }}>{teacherTarget.title}</span>
            </p>
            <form onSubmit={handleAssignTeacher} className="space-y-3">
              <div>
                <label className="block text-sm mb-1" style={{ color: DK.dimTxt }}>اختر المعلم</label>
                <select value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value === '' ? '' : Number(e.target.value))}
                  onFocus={() => setFocusedInput('teacher')} onBlur={() => setFocusedInput(null)}
                  style={{ ...inputStyle('teacher'), cursor: 'pointer' }}>
                  <option value="">— بدون معلم —</option>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                {teachers.length === 0 && (
                  <p className="text-xs mt-1" style={{ color: DK.gold }}>لا يوجد معلمون. أضف معلمين أولاً من صفحة المستخدمين.</p>
                )}
              </div>
              {teacherError && <p className="text-sm px-3 py-2 rounded-lg" style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)' }}>{teacherError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={teacherLoading}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #C9952A, #DDAD50)', color: '#fff' }}>
                  {teacherLoading ? 'جاري الحفظ...' : 'حفظ'}
                </button>
                <button type="button" onClick={() => setTeacherTarget(null)}
                  className="flex-1 py-2 rounded-xl text-sm"
                  style={{ background: '#F9FAFB', color: DK.dimTxt, border: '1px solid #EDE3CE' }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
