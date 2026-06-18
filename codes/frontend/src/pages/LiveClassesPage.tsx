import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchCourses } from '../features/admin/coursesSlice';
import { fetchUsers }   from '../features/admin/usersSlice';
import {
  fetchLiveClasses,
  addLiveClass,
  updateClassStatus,
  deleteLiveClass,
  type ClassStatus,
  type LiveClassPayload,
} from '../features/admin/liveClassesSlice';
import AdminLayout from '../components/AdminLayout';

const STATUS_LABELS: Record<ClassStatus, string> = {
  scheduled: 'مجدولة',
  live:      'جارية الآن',
  ended:     'انتهت',
};

const STATUS_COLORS: Record<ClassStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  live:      'bg-green-100 text-green-700',
  ended:     'bg-gray-100 text-gray-500',
};

const TABS: { value: ClassStatus | null; label: string }[] = [
  { value: null,        label: 'الكل' },
  { value: 'scheduled', label: 'مجدولة' },
  { value: 'live',      label: 'جارية' },
  { value: 'ended',     label: 'منتهية' },
];

function toLocalInput(dateStr: string): string {
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const emptyForm: LiveClassPayload = {
  course_id: 0, teacher_id: 0, title: '',
  description: '', scheduled_at: '', duration_minutes: 60, meeting_link: '',
};

export default function LiveClassesPage() {
  const dispatch = useAppDispatch();
  const { list: courses }       = useAppSelector((s) => s.courses);
  const { list: allUsers }      = useAppSelector((s) => s.adminUsers);
  const { list: classes, loading } = useAppSelector((s) => s.liveClasses);

  const teachers = allUsers.filter((u) => u.role === 'teacher');

  const [activeTab, setActiveTab]   = useState<ClassStatus | null>(null);
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState<LiveClassPayload>(emptyForm);
  const [addError, setAddError]     = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [deleting, setDeleting]     = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchCourses(null));
    dispatch(fetchUsers(null));
    dispatch(fetchLiveClasses(null));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchLiveClasses(activeTab));
  }, [dispatch, activeTab]);

  const openModal = () => {
    setForm({
      ...emptyForm,
      course_id:  courses[0]?.id  ?? 0,
      teacher_id: teachers[0]?.id ?? 0,
    });
    setAddError(null);
    setShowModal(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.course_id)  { setAddError('اختر الدورة'); return; }
    if (!form.teacher_id) { setAddError('اختر المعلم'); return; }
    if (!form.scheduled_at) { setAddError('حدد موعد الحصة'); return; }
    setAddLoading(true);
    setAddError(null);
    const result = await dispatch(addLiveClass(form));
    setAddLoading(false);
    if (addLiveClass.fulfilled.match(result)) {
      setShowModal(false);
    } else {
      setAddError(result.payload as string);
    }
  };

  const handleStatusChange = async (id: number, status: ClassStatus) => {
    setUpdatingStatus(id);
    await dispatch(updateClassStatus({ id, status }));
    setUpdatingStatus(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الحصة؟')) return;
    setDeleting(id);
    await dispatch(deleteLiveClass(id));
    setDeleting(null);
  };

  const nextStatus: Record<ClassStatus, { label: string; value: ClassStatus } | null> = {
    scheduled: { label: 'بدء الحصة', value: 'live' },
    live:      { label: 'إنهاء الحصة', value: 'ended' },
    ended:     null,
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">الحصص المباشرة</h2>
          <button
            onClick={openModal}
            className="bg-teal-700 hover:bg-teal-800 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            + جدولة حصة
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {TABS.map((tab) => {
            const count = tab.value
              ? classes.filter((c) => c.status === tab.value).length
              : classes.length;
            return (
              <button
                key={String(tab.value)}
                onClick={() => setActiveTab(tab.value)}
                className={`text-sm px-4 py-1.5 rounded-full transition flex items-center gap-1.5 ${
                  activeTab === tab.value
                    ? 'bg-teal-700 text-white'
                    : 'bg-white text-gray-600 border hover:bg-gray-50'
                }`}
              >
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.value ? 'bg-teal-600' : 'bg-gray-200 text-gray-500'
                }`}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <p className="text-center py-12 text-gray-400">جاري التحميل...</p>
          ) : classes.length === 0 ? (
            <p className="text-center py-12 text-gray-400">لا توجد حصص بعد.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-right font-medium">الحصة</th>
                  <th className="px-4 py-3 text-right font-medium">الدورة</th>
                  <th className="px-4 py-3 text-right font-medium">المعلم</th>
                  <th className="px-4 py-3 text-right font-medium">الموعد</th>
                  <th className="px-4 py-3 text-right font-medium">المدة</th>
                  <th className="px-4 py-3 text-right font-medium">الحالة</th>
                  <th className="px-4 py-3 text-right font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {classes.map((cls) => {
                  const next = nextStatus[cls.status];
                  return (
                    <tr key={cls.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-800">{cls.title}</p>
                        {cls.meeting_link && (
                          <a href={cls.meeting_link} target="_blank" rel="noreferrer"
                            className="text-xs text-blue-500 hover:underline">
                            رابط الحصة
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-4 text-gray-600">{cls.course?.title ?? '—'}</td>
                      <td className="px-4 py-4 text-gray-600">{cls.teacher?.name ?? '—'}</td>
                      <td className="px-4 py-4 text-gray-600 text-xs" dir="ltr">
                        {new Date(cls.scheduled_at).toLocaleString('ar-EG')}
                      </td>
                      <td className="px-4 py-4 text-gray-500">{cls.duration_minutes} د</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[cls.status]}`}>
                          {STATUS_LABELS[cls.status]}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {next && (
                            <button
                              onClick={() => handleStatusChange(cls.id, next.value)}
                              disabled={updatingStatus === cls.id}
                              className="text-xs px-2.5 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition disabled:opacity-50 font-medium"
                            >
                              {updatingStatus === cls.id ? '...' : next.label}
                            </button>
                          )}
                          {cls.status === 'scheduled' && (
                            <button
                              onClick={() => handleDelete(cls.id)}
                              disabled={deleting === cls.id}
                              className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50"
                            >
                              {deleting === cls.id ? '...' : 'حذف'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">جدولة حصة مباشرة</h3>
            <form onSubmit={handleAdd} className="space-y-3">

              <div>
                <label className="block text-sm text-gray-600 mb-1">الدورة</label>
                <select value={form.course_id}
                  onChange={(e) => setForm({ ...form, course_id: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
                  <option value={0} disabled>اختر الدورة</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">المعلم</label>
                <select value={form.teacher_id}
                  onChange={(e) => setForm({ ...form, teacher_id: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
                  <option value={0} disabled>اختر المعلم</option>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                {teachers.length === 0 && (
                  <p className="text-xs text-yellow-600 mt-1">أضف معلمين أولاً من صفحة المستخدمين.</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">عنوان الحصة</label>
                <input type="text" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="مثال: الدرس الأول — المقدمة"
                  required autoFocus
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">موعد الحصة</label>
                  <input type="datetime-local" required
                    value={form.scheduled_at ? toLocalInput(form.scheduled_at) : ''}
                    onChange={(e) => setForm({ ...form, scheduled_at: new Date(e.target.value).toISOString() })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">المدة (دقيقة)</label>
                  <input type="number" min={15} max={480}
                    value={form.duration_minutes}
                    onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">رابط الحصة (Zoom / Meet)</label>
                <input type="url" value={form.meeting_link}
                  onChange={(e) => setForm({ ...form, meeting_link: e.target.value })}
                  placeholder="https://zoom.us/j/..."
                  dir="ltr"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              {addError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{addError}</p>}

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={addLoading}
                  className="flex-1 bg-teal-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-800 disabled:opacity-50">
                  {addLoading ? 'جاري الجدولة...' : 'جدولة'}
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
    </AdminLayout>
  );
}
