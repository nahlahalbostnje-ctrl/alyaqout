import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchStudentCourses } from '../features/student/studentSlice';
import StudentLayout from '../components/StudentLayout';

export default function StudentCoursesPage() {
  const dispatch = useAppDispatch();
  const { courses, loading, error } = useAppSelector((s) => s.student);

  useEffect(() => { dispatch(fetchStudentCourses()); }, [dispatch]);

  return (
    <StudentLayout>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">الدورات المتاحة</h2>
          <p className="text-sm text-gray-400 mt-1">جميع الدورات في بلدك</p>
        </div>

        {loading && <p className="text-gray-400">جاري التحميل...</p>}
        {error   && <p className="text-red-500 bg-red-50 px-4 py-3 rounded-xl text-sm">{error}</p>}

        {!loading && courses.length === 0 && (
          <p className="text-gray-400 text-center py-12">لا توجد دورات متاحة حالياً</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-purple-50 flex items-center justify-center text-5xl">🎬</div>
              )}
              <div className="p-4">
                <p className="font-semibold text-gray-800">{course.title}</p>
                {course.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-1 text-xs text-gray-400">
                  <span className="bg-gray-50 px-2 py-0.5 rounded">{course.category?.grade?.name}</span>
                  <span className="bg-gray-50 px-2 py-0.5 rounded">{course.category?.name}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{course.teacher?.name ?? '—'}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-base font-bold text-purple-700">
                    {course.is_free ? 'مجاني' : `${course.price}`}
                  </p>
                  <Link to={`/student/courses/${course.id}/content`}
                    className="text-xs text-purple-600 hover:text-purple-800 font-medium px-3 py-1 rounded-lg hover:bg-purple-50 transition">
                    ابدأ التعلم ←
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
}
