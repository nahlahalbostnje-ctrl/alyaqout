import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

interface Supervisor {
  id:            number;
  name:          string;
  phone:         string;
  student_count: number;
}

interface Student {
  id:       number;
  name:     string;
  phone:    string;
  grade_id: number | null;
  grade?:   { id: number; name: string } | null;
}

export default function AdminSupervisorAssignmentPage() {
  const [supervisors, setSupervisors]       = useState<Supervisor[]>([]);
  const [selected, setSelected]             = useState<Supervisor | null>(null);
  const [assigned, setAssigned]             = useState<Student[]>([]);
  const [unassigned, setUnassigned]         = useState<Student[]>([]);
  const [loadingSupervisors, setLoadingSupervisors] = useState(true);
  const [loadingStudents, setLoadingStudents]       = useState(false);
  const [assigning, setAssigning]           = useState<number | null>(null);
  const [removing, setRemoving]             = useState<number | null>(null);
  const [searchAssigned, setSearchAssigned] = useState('');
  const [searchFree, setSearchFree]         = useState('');

  const loadSupervisors = async () => {
    setLoadingSupervisors(true);
    try {
      const { data } = await api.get('/admin/supervisors');
      setSupervisors(data.supervisors);
    } finally {
      setLoadingSupervisors(false);
    }
  };

  const loadStudents = async (supervisor: Supervisor) => {
    setLoadingStudents(true);
    setAssigned([]);
    setUnassigned([]);
    try {
      const [assignedRes, freeRes] = await Promise.all([
        api.get(`/admin/supervisors/${supervisor.id}/students`),
        api.get('/admin/supervisors/unassigned-students'),
      ]);
      setAssigned(assignedRes.data.students);
      setUnassigned(freeRes.data.students);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => { loadSupervisors(); }, []);

  const selectSupervisor = (sup: Supervisor) => {
    setSelected(sup);
    setSearchAssigned('');
    setSearchFree('');
    loadStudents(sup);
  };

  const handleAssign = async (student: Student) => {
    if (!selected) return;
    setAssigning(student.id);
    try {
      await api.post(`/admin/supervisors/${selected.id}/students`, { student_id: student.id });
      setAssigned((prev) => [...prev, student]);
      setUnassigned((prev) => prev.filter((s) => s.id !== student.id));
      setSupervisors((prev) => prev.map((s) =>
        s.id === selected.id ? { ...s, student_count: s.student_count + 1 } : s
      ));
    } finally {
      setAssigning(null);
    }
  };

  const handleRemove = async (student: Student) => {
    if (!selected) return;
    setRemoving(student.id);
    try {
      await api.delete(`/admin/supervisors/${selected.id}/students/${student.id}`);
      setUnassigned((prev) => [...prev, student]);
      setAssigned((prev) => prev.filter((s) => s.id !== student.id));
      setSupervisors((prev) => prev.map((s) =>
        s.id === selected.id ? { ...s, student_count: s.student_count - 1 } : s
      ));
    } finally {
      setRemoving(null);
    }
  };

  const filteredAssigned  = assigned.filter((s) =>
    s.name.includes(searchAssigned) || s.phone.includes(searchAssigned)
  );
  const filteredUnassigned = unassigned.filter((s) =>
    s.name.includes(searchFree) || s.phone.includes(searchFree)
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">تعيين الطلاب للمشرفين</h2>
          <p className="text-sm text-gray-400 mt-1">كل مشرف يتابع 100–150 طالباً</p>
        </div>

        <div className="grid grid-cols-4 gap-6 min-h-[calc(100vh-200px)]">

          {/* Supervisors Column */}
          <div className="col-span-1 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">المشرفون</p>
            {loadingSupervisors && <p className="text-gray-400 text-sm">جاري التحميل...</p>}
            {!loadingSupervisors && supervisors.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">لا يوجد مشرفون</p>
            )}
            {supervisors.map((sup) => (
              <button
                key={sup.id}
                onClick={() => selectSupervisor(sup)}
                className={`w-full text-right px-4 py-3 rounded-xl text-sm transition flex items-start gap-3 ${selected?.id === sup.id ? 'bg-purple-50 border border-purple-200' : 'bg-white border border-gray-100 hover:bg-gray-50'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs flex-shrink-0 mt-0.5">
                  {sup.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${selected?.id === sup.id ? 'text-purple-700' : 'text-gray-800'}`}>
                    {sup.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {sup.student_count} طالب
                    {sup.student_count >= 150 && (
                      <span className="mr-1 text-orange-500 font-semibold">• ممتلئ</span>
                    )}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Assigned Students Column */}
          <div className="col-span-1.5 col-span-2" style={{ gridColumn: 'span 2' }}>
            {!selected ? (
              <div className="h-full flex items-center justify-center bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="text-center">
                  <p className="text-3xl mb-2">👈</p>
                  <p className="text-gray-400 text-sm">اختر مشرفاً لعرض طلابه</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <p className="font-bold text-gray-800">{selected.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">الطلاب المعيّنون ({assigned.length})</p>
                  <input
                    value={searchAssigned}
                    onChange={(e) => setSearchAssigned(e.target.value)}
                    placeholder="بحث..."
                    className="mt-2 w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>
                <div className="overflow-y-auto max-h-[calc(100vh-360px)]">
                  {loadingStudents && (
                    <p className="text-gray-400 text-sm text-center py-6">جاري التحميل...</p>
                  )}
                  {!loadingStudents && filteredAssigned.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-6">لا يوجد طلاب معيّنون</p>
                  )}
                  {filteredAssigned.map((student) => (
                    <div key={student.id} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{student.name}</p>
                        <p className="text-xs text-gray-400">{student.grade?.name ?? '—'} • {student.phone}</p>
                      </div>
                      <button
                        onClick={() => handleRemove(student)}
                        disabled={removing === student.id}
                        className="text-xs text-red-400 hover:text-red-600 transition disabled:opacity-40 px-2 py-1"
                      >
                        {removing === student.id ? '...' : 'إزالة'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Unassigned Students Column */}
          <div className="col-span-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">طلاب بلا مشرف</p>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-3 border-b border-gray-100">
                <input
                  value={searchFree}
                  onChange={(e) => setSearchFree(e.target.value)}
                  placeholder="بحث..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
              <div className="overflow-y-auto max-h-[calc(100vh-320px)]">
                {!selected && (
                  <p className="text-gray-400 text-xs text-center py-6">اختر مشرفاً أولاً</p>
                )}
                {selected && loadingStudents && (
                  <p className="text-gray-400 text-xs text-center py-6">جاري التحميل...</p>
                )}
                {selected && !loadingStudents && filteredUnassigned.length === 0 && (
                  <p className="text-gray-400 text-xs text-center py-6">لا يوجد طلاب بلا مشرف</p>
                )}
                {selected && !loadingStudents && filteredUnassigned.map((student) => (
                  <div key={student.id} className="flex items-center justify-between px-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-800 truncate">{student.name}</p>
                      <p className="text-xs text-gray-400">{student.grade?.name ?? '—'}</p>
                    </div>
                    <button
                      onClick={() => handleAssign(student)}
                      disabled={assigning === student.id || assigned.length >= 150}
                      className="text-xs text-purple-600 hover:text-purple-800 transition disabled:opacity-40 px-1.5 py-1 flex-shrink-0 mr-1"
                    >
                      {assigning === student.id ? '...' : 'تعيين'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {selected && assigned.length >= 150 && (
              <p className="text-xs text-orange-500 mt-2 text-center font-semibold">
                وصل المشرف للحد الأقصى (150 طالب)
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
