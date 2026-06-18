import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchTeacherDashboard, updateTeacherClassStatus } from '../features/teacher/teacherSlice';
import TeacherLayout from '../components/TeacherLayout';
import type { TeacherLiveClass } from '../features/teacher/teacherSlice';

function statusBadge(status: TeacherLiveClass['status']) {
  if (status === 'live')      return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">جارية الآن</span>;
  if (status === 'scheduled') return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">مجدولة</span>;
  return null;
}

export default function TeacherDashboardPage() {
  const dispatch = useAppDispatch();
  const { teacher, courses, upcoming, loading, error } = useAppSelector((s) => s.teacher);

  useEffect(() => { dispatch(fetchTeacherDashboard()); }, [dispatch]);

  return (
    <TeacherLayout>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {teacher ? `مرحباً، ${teacher.name}` : 'لوحة المعلم'}
          </h2>
          <p className="text-sm text-gray-400 mt-1">نظرة عامة على دوراتك وحصصك</p>
        </div>

        {loading && <p className="text-gray-400">جاري التحميل...</p>}
        {error   && <p className="text-red-500 bg-red-50 px-4 py-3 rounded-xl text-sm">{error}</p>}

        {!loading && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-teal-50 rounded-xl p-5 text-center">
                <p className="text-4xl font-bold text-teal-700">{courses.length}</p>
                <p className="text-gray-600 text-sm mt-2">دوراتي</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-5 text-center">
                <p className="text-4xl font-bold text-blue-700">{upcoming.length}</p>
                <p className="text-gray-600 text-sm mt-2">حصص قادمة</p>
              </div>
            </div>

            {upcoming.length > 0 && (
              <div className="mb-8">
                <h3 className="text-base font-semibold text-gray-700 mb-3">حصصي القادمة</h3>
                <div className="space-y-3">
                  {upcoming.map((cls) => (
                    <div key={cls.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {statusBadge(cls.status)}
                            <p className="font-medium text-gray-800">{cls.title}</p>
                          </div>
                          <p className="text-xs text-gray-400">{cls.course.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(cls.scheduled_at).toLocaleString('ar-EG')}
                            {' · '}{cls.duration_minutes} دقيقة
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 mr-2">
                          {cls.status === 'scheduled' && (
                            <button
                              onClick={() => dispatch(updateTeacherClassStatus(cls.id))}
                              className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition"
                            >
                              بدء الحصة
                            </button>
                          )}
                          {cls.status === 'live' && (
                            <button
                              onClick={() => dispatch(updateTeacherClassStatus(cls.id))}
                              className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition"
                            >
                              إنهاء الحصة
                            </button>
                          )}
                          {cls.meeting_link && cls.status === 'live' && (
                            <a
                              href={cls.meeting_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-teal-600 hover:underline"
                            >
                              فتح الرابط
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {courses.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-gray-700 mb-3">دوراتي</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <div key={course.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-36 object-cover" />
                      ) : (
                        <div className="w-full h-36 bg-teal-50 flex items-center justify-center text-4xl">🎬</div>
                      )}
                      <div className="p-4">
                        <p className="font-semibold text-gray-800 text-sm">{course.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{course.category?.grade?.name} · {course.category?.name}</p>
                        <p className="text-sm font-bold text-teal-700 mt-2">
                          {course.is_free ? 'مجاني' : `${course.price}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {courses.length === 0 && upcoming.length === 0 && !loading && (
              <p className="text-gray-400 text-center py-12">لا توجد دورات أو حصص مسندة إليك حالياً</p>
            )}
          </>
        )}
      </div>
    </TeacherLayout>
  );
}
