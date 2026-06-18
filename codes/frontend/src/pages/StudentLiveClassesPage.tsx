import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchStudentLiveClasses } from '../features/student/studentSlice';
import StudentLayout from '../components/StudentLayout';
import type { StudentLiveClass } from '../features/student/studentSlice';

function statusBadge(status: StudentLiveClass['status']) {
  if (status === 'live')      return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">جارية الآن</span>;
  if (status === 'scheduled') return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">مجدولة</span>;
  return null;
}

export default function StudentLiveClassesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { liveClasses, loading, error } = useAppSelector((s) => s.student);

  useEffect(() => { dispatch(fetchStudentLiveClasses()); }, [dispatch]);

  const handleJoin = (cls: StudentLiveClass) => {
    if (!cls.agora_channel) return;
    navigate(`/live/${cls.agora_channel}?classId=${cls.id}`);
  };

  return (
    <StudentLayout>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">الحصص المباشرة</h2>
          <p className="text-sm text-gray-400 mt-1">الحصص المجدولة والجارية في بلدك</p>
        </div>

        {loading && <p className="text-gray-400">جاري التحميل...</p>}
        {error   && <p className="text-red-500 bg-red-50 px-4 py-3 rounded-xl text-sm">{error}</p>}

        {!loading && liveClasses.length === 0 && (
          <p className="text-gray-400 text-center py-12">لا توجد حصص متاحة حالياً</p>
        )}

        <div className="space-y-3">
          {liveClasses.map((cls) => (
            <div key={cls.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {statusBadge(cls.status)}
                    <p className="font-semibold text-gray-800">{cls.title}</p>
                  </div>
                  {cls.description && (
                    <p className="text-xs text-gray-500 mb-2">{cls.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    <span>📚 {cls.course.title}</span>
                    <span>👤 {cls.teacher.name}</span>
                    <span>🕐 {new Date(cls.scheduled_at).toLocaleString('ar-EG')}</span>
                    <span>⏱ {cls.duration_minutes} دقيقة</span>
                  </div>
                </div>

                {cls.status === 'live' && cls.agora_channel && (
                  <button
                    onClick={() => handleJoin(cls)}
                    className="mr-4 flex items-center gap-2 text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition whitespace-nowrap"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                    </svg>
                    انضم الآن
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
}
