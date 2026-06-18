import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchTeacherCourses } from '../features/teacher/teacherSlice';
import TeacherLayout from '../components/TeacherLayout';

const DK = {
  card:   { background: '#070e22', border: '1px solid rgba(245,166,35,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  gold:   '#f5a623',
  dimTxt: 'rgba(255,255,255,0.4)',
};

export default function TeacherCoursesPage() {
  const dispatch = useAppDispatch();
  const { courses, loading, error } = useAppSelector((s) => s.teacher);

  useEffect(() => { dispatch(fetchTeacherCourses()); }, [dispatch]);

  return (
    <TeacherLayout>
      <div className="p-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f5a623, #ffd166)' }} />
            <h2 className="text-xl font-bold text-white">دوراتي</h2>
          </div>
          <p className="text-xs mr-4" style={{ color: DK.dimTxt }}>الدورات المسندة إليك</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(245,166,35,0.2)', borderTopColor: '#f5a623' }} />
          </div>
        )}
        {error && <p className="text-sm px-4 py-3 rounded-xl mb-4" style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)' }}>{error}</p>}

        {!loading && courses.length === 0 && (
          <p className="text-center py-12" style={{ color: DK.dimTxt }}>لا توجد دورات مسندة إليك حالياً</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="rounded-xl overflow-hidden" style={DK.card}>
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 flex items-center justify-center text-5xl"
                  style={{ background: 'rgba(245,166,35,0.05)' }}>🎬</div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-white">{course.title}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={course.is_active
                      ? { background: 'rgba(52,211,153,0.12)', color: '#34d399' }
                      : { background: 'rgba(255,255,255,0.05)', color: DK.dimTxt }}>
                    {course.is_active ? 'نشطة' : 'معطّلة'}
                  </span>
                </div>
                {course.description && (
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: DK.dimTxt }}>{course.description}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-1 text-xs">
                  <span className="px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: DK.dimTxt }}>
                    {course.category?.grade?.name}
                  </span>
                  <span className="px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: DK.dimTxt }}>
                    {course.category?.name}
                  </span>
                </div>
                <p className="text-base font-bold mt-2" style={{ color: DK.gold }}>
                  {course.is_free ? 'مجاني' : `${course.price}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </TeacherLayout>
  );
}
