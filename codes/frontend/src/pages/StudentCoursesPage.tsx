import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchStudentCourses } from '../features/student/studentSlice';
import StudentLayout from '../components/StudentLayout';

const DK = {
  card:   { background: '#FFFFFF', border: '1px solid #EDE3CE', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  gold:   '#C9952A',
  dimTxt: '#9CA3AF',
};

export default function StudentCoursesPage() {
  const dispatch = useAppDispatch();
  const { courses, loading, error } = useAppSelector((s) => s.student);

  useEffect(() => { dispatch(fetchStudentCourses()); }, [dispatch]);

  return (
    <StudentLayout>
      <div className="p-6" style={{ fontFamily: "'Cairo', sans-serif", background: '#F5EDD8', minHeight: '100%' }}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #C9952A, #DDAD50)' }} />
            <h2 className="text-xl font-bold" style={{ color: '#1B2038' }}>الدورات المتاحة</h2>
          </div>
          <p className="text-xs mr-4" style={{ color: DK.dimTxt }}>جميع الدورات في بلدك</p>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid rgba(201,149,42,0.15)', borderTopColor: '#C9952A' }} />
          </div>
        )}
        {error && <p className="text-sm px-4 py-3 rounded-xl mb-4" style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</p>}

        {!loading && courses.length === 0 && (
          <p className="text-center py-12" style={{ color: DK.dimTxt }}>لا توجد دورات متاحة حالياً</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="rounded-xl overflow-hidden" style={DK.card}>
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 flex items-center justify-center text-5xl"
                  style={{ background: 'rgba(201,149,42,0.05)' }}>🎬</div>
              )}
              <div className="p-4">
                <p className="font-semibold" style={{ color: '#1B2038' }}>{course.title}</p>
                {course.description && (
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: DK.dimTxt }}>{course.description}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-1 text-xs">
                  <span className="px-2 py-0.5 rounded" style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #EDE3CE' }}>
                    {course.category?.grade?.name}
                  </span>
                  <span className="px-2 py-0.5 rounded" style={{ background: '#F9FAFB', color: '#6B7280', border: '1px solid #EDE3CE' }}>
                    {course.category?.name}
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: DK.dimTxt }}>{course.teacher?.name ?? '—'}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-base font-bold" style={{ color: DK.gold }}>
                    {course.is_free ? 'مجاني' : `${course.price}`}
                  </p>
                  <Link to={`/student/courses/${course.id}/content`}
                    className="text-xs font-medium px-3 py-1 rounded-lg transition"
                    style={{ color: DK.gold, background: 'rgba(201,149,42,0.08)', border: '1px solid rgba(201,149,42,0.2)' }}>
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
