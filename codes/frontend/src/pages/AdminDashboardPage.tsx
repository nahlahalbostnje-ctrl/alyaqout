import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchAdminStats } from '../features/admin/adminSlice';
import AdminLayout from '../components/AdminLayout';

const statCards = (s: {
  teachers: number; students: number; parents: number;
  grades: number; courses: number; live_scheduled: number; live_active: number;
}) => [
  { label: 'المعلمون',        value: s.teachers,       color: 'text-teal-700',   bg: 'bg-teal-50' },
  { label: 'الطلاب',          value: s.students,        color: 'text-blue-700',   bg: 'bg-blue-50' },
  { label: 'أولياء الأمور',  value: s.parents,         color: 'text-purple-700', bg: 'bg-purple-50' },
  { label: 'الصفوف النشطة',  value: s.grades,          color: 'text-indigo-700', bg: 'bg-indigo-50' },
  { label: 'الدورات النشطة', value: s.courses,         color: 'text-pink-700',   bg: 'bg-pink-50' },
  { label: 'حصص مجدولة',    value: s.live_scheduled,  color: 'text-orange-700', bg: 'bg-orange-50' },
  { label: 'حصص جارية الآن', value: s.live_active,    color: 'text-green-700',  bg: 'bg-green-50' },
];

export default function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const { dashboard, loading, error } = useAppSelector((s) => s.admin);

  useEffect(() => { dispatch(fetchAdminStats()); }, [dispatch]);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">لوحة التحكم</h2>
          {dashboard && (
            <p className="text-sm text-gray-500 mt-1">
              {dashboard.country.name}
              <span className="mx-2 text-gray-300">·</span>
              <span className="font-mono text-gray-400">{dashboard.country.code}</span>
            </p>
          )}
        </div>

        {loading && <p className="text-gray-400">جاري التحميل...</p>}
        {error   && <p className="text-red-500 bg-red-50 px-4 py-3 rounded-xl text-sm">{error}</p>}

        {dashboard && !loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {statCards(dashboard.stats).map((stat) => (
              <div key={stat.label} className={`${stat.bg} rounded-xl p-5 text-center`}>
                <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-gray-600 text-sm mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
