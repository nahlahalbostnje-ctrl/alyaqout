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

const emptyForm: CoursePayload = {
  category_id: 0,
  title: '',
  description: '',
  price: 0,
  is_free: false,
  sort_order: 0,
};

export default function CoursesPage() {
  const dispatch = useAppDispatch();
  const { list: categories }           = useAppSelector((s) => s.categories);
  const { list: courses, loading }     = useAppSelector((s) => s.courses);
  const { list: allUsers }             = useAppSelector((s) => s.adminUsers);

  const teachers = allUsers.filter((u) => u.role === 'teacher');

  const [filterCat, setFilterCat]       = useState<number | null>(null);
  const [showModal, setShowModal]       = useState(false);
  const [form, setForm]                 = useState<CoursePayload>(emptyForm);
  const [addError, setAddError]         = useState<string | null>(null);
  const [addLoading, setAddLoading]     = useState(false);
  const [toggling, setToggling]         = useState<number | null>(null);
  const [deleting, setDeleting]         = useState<number | null>(null);

  // Assign teacher modal
  const [teacherTarget, setTeacherTarget]   = useState<Course | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<number | ''>('');
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherError, setTeacherError]     = useState<string | null>(null);

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
    if (addCourse.fulfilled.match(result)) {
      setShowModal(false);
    } else {
      setAddError(result.payload as string);
    }
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
    if (assignTeacher.fulfilled.match(result)) {
      setTeacherTarget(null);
    } else {
      setTeacherError(result.payload as string);
    }
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

  const displayed = filterCat
    ? courses.filter((c) => c.category_id === filterCat)
    : courses;

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">الدورات التعليمية</h2>
          <button
            onClick={openModal}
            className="bg-teal-700 hover:bg-teal-800 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            + إضافة دورة
          </button>
        </div>

        {/* Filter by category */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFilterCat(null)}
            className={`text-sm px-4 py-1.5 rounded-full transition ${
              filterCat === null ? 'bg-teal-700 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            الكل
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCat(cat.id)}
              className={`text-sm px-4 py-1.5 rounded-full transition ${
                filterCat === cat.id ? 'bg-teal-700 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <p className="text-center py-12 text-gray-400">جاري التحميل...</p>
          ) : displayed.length === 0 ? (
            <p className="text-center py-12 text-gray-400">
              {categories.length === 0 ? 'أضف مواد دراسية أولاً.' : 'لا توجد دورات بعد. أضف أول دورة!'}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-right font-medium">الدورة</th>
                  <th className="px-4 py-3 text-right font-medium">المادة / الصف</th>
                  <th className="px-4 py-3 text-right font-medium">المعلم</th>
                  <th className="px-4 py-3 text-right font-medium">السعر</th>
                  <th className="px-4 py-3 text-right font-medium">الحالة</th>
                  <th className="px-4 py-3 text-right font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayed.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-800">{course.title}</p>
                      {course.description && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{course.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-gray-700">{course.category?.name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{course.category?.grade?.name ?? ''}</p>
                    </td>
                    <td className="px-4 py-4">
                      {course.teacher ? (
                        <button
                          onClick={() => openTeacherModal(course)}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          {course.teacher.name}
                        </button>
                      ) : (
                        <button
                          onClick={() => openTeacherModal(course)}
                          className="text-xs bg-yellow-50 text-yellow-700 hover:bg-yellow-100 px-2 py-1 rounded-lg transition"
                        >
                          + تعيين معلم
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {course.is_free
                        ? <span className="text-green-600 font-medium text-xs">مجاني</span>
                        : <span className="text-gray-700" dir="ltr">{Number(course.price).toFixed(2)}</span>
                      }
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        course.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {course.is_active ? 'نشط' : 'معطّل'}
                      </span>
                    </td>
                    <td className="px-4 py-4 flex gap-2 flex-wrap">
                      <Link
                        to={`/admin/courses/${course.id}/content`}
                        className="text-xs px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition font-medium"
                      >
                        المحتوى
                      </Link>
                      <button
                        onClick={() => handleToggle(course.id)}
                        disabled={toggling === course.id}
                        className={`text-xs px-3 py-1.5 rounded-lg transition font-medium disabled:opacity-50 ${
                          course.is_active
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {toggling === course.id ? '...' : course.is_active ? 'تعطيل' : 'تفعيل'}
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        disabled={deleting === course.id}
                        className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50"
                      >
                        {deleting === course.id ? '...' : 'حذف'}
                      </button>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">إضافة دورة تعليمية</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">المادة الدراسية</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value={0} disabled>اختر المادة</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">عنوان الدورة</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="مثال: دورة الرياضيات الشاملة"
                  required autoFocus
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">الوصف (اختياري)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="وصف مختصر..."
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_free}
                    onChange={(e) => setForm({ ...form, is_free: e.target.checked, price: 0 })}
                    className="w-4 h-4 accent-teal-600"
                  />
                  <span className="text-sm text-gray-700">دورة مجانية</span>
                </label>
              </div>
              {!form.is_free && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">السعر</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    min={0} step={0.01} dir="ltr"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              )}
              {addError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{addError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={addLoading}
                  className="flex-1 bg-teal-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-800 disabled:opacity-50">
                  {addLoading ? 'جاري الإضافة...' : 'إضافة'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-200">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {teacherTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-1 text-gray-800">تعيين معلم</h3>
            <p className="text-sm text-gray-500 mb-4">
              دورة: <span className="font-medium text-teal-700">{teacherTarget.title}</span>
            </p>
            <form onSubmit={handleAssignTeacher} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">اختر المعلم</label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="">— بدون معلم —</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {teachers.length === 0 && (
                  <p className="text-xs text-yellow-600 mt-1">لا يوجد معلمون. أضف معلمين أولاً من صفحة المستخدمين.</p>
                )}
              </div>
              {teacherError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{teacherError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={teacherLoading}
                  className="flex-1 bg-teal-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-800 disabled:opacity-50">
                  {teacherLoading ? 'جاري الحفظ...' : 'حفظ'}
                </button>
                <button type="button" onClick={() => setTeacherTarget(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-200">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
