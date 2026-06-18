import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

const DK = {
  card:    { background: '#070e22', border: '1px solid rgba(245,166,35,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  gold:    '#f5a623',
  navy:    '#040a18',
  dimTxt:  'rgba(255,255,255,0.4)',
  inputStyle: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(245,166,35,0.15)',
    color: '#fff',
    borderRadius: '12px',
    padding: '8px 12px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
  }
};

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
    } finally { setLoadingSupervisors(false); }
  };

  const loadStudents = async (supervisor: Supervisor) => {
    setLoadingStudents(true); setAssigned([]); setUnassigned([]);
    try {
      const [assignedRes, freeRes] = await Promise.all([
        api.get(`/admin/supervisors/${supervisor.id}/students`),
        api.get('/admin/supervisors/unassigned-students'),
      ]);
      setAssigned(assignedRes.data.students);
      setUnassigned(freeRes.data.students);
    } finally { setLoadingStudents(false); }
  };

  useEffect(() => { loadSupervisors(); }, []);

  const selectSupervisor = (sup: Supervisor) => {
    setSelected(sup); setSearchAssigned(''); setSearchFree('');
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
    } finally { setAssigning(null); }
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
    } finally { setRemoving(null); }
  };

  const filteredAssigned  = assigned.filter((s) =>
    s.name.includes(searchAssigned) || s.phone.includes(searchAssigned)
  );
  const filteredUnassigned = unassigned.filter((s) =>
    s.name.includes(searchFree) || s.phone.includes(searchFree)
  );

  return (
    <AdminLayout>
      <div className="p-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f5a623, #ffd166)' }} />
            <h2 className="text-xl font-bold text-white">تعيين الطلاب للمشرفين</h2>
          </div>
          <p className="text-xs mr-4" style={{ color: DK.dimTxt }}>كل مشرف يتابع 100–150 طالباً</p>
        </div>

        <div className="grid grid-cols-4 gap-6 min-h-[calc(100vh-200px)]">

          {/* Supervisors Column */}
          <div className="col-span-1 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: DK.dimTxt }}>المشرفون</p>
            {loadingSupervisors && (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 rounded-full animate-spin" style={{ border: '2px solid rgba(245,166,35,0.2)', borderTopColor: '#f5a623' }} />
              </div>
            )}
            {!loadingSupervisors && supervisors.length === 0 && (
              <p className="text-sm text-center py-8" style={{ color: DK.dimTxt }}>لا يوجد مشرفون</p>
            )}
            {supervisors.map((sup) => (
              <button key={sup.id} onClick={() => selectSupervisor(sup)}
                className="w-full text-right px-4 py-3 rounded-xl text-sm transition flex items-start gap-3"
                style={selected?.id === sup.id
                  ? { background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(245,166,35,0.15)', color: DK.gold }}>
                  {sup.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate" style={{ color: selected?.id === sup.id ? DK.gold : 'rgba(255,255,255,0.8)' }}>
                    {sup.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>
                    {sup.student_count} طالب
                    {sup.student_count >= 150 && (
                      <span className="mr-1 font-semibold" style={{ color: '#fbbf24' }}>• ممتلئ</span>
                    )}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Assigned Students Column */}
          <div className="col-span-2">
            {!selected ? (
              <div className="h-full flex items-center justify-center rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(245,166,35,0.2)' }}>
                <div className="text-center">
                  <p className="text-sm" style={{ color: DK.dimTxt }}>اختر مشرفاً لعرض طلابه</p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden h-full flex flex-col" style={DK.card}>
                <div className="p-4" style={{ borderBottom: '1px solid rgba(245,166,35,0.08)' }}>
                  <p className="font-bold text-white">{selected.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: DK.dimTxt }}>الطلاب المعيّنون ({assigned.length})</p>
                  <input value={searchAssigned} onChange={(e) => setSearchAssigned(e.target.value)}
                    placeholder="بحث..." className="mt-2"
                    style={DK.inputStyle} />
                </div>
                <div className="overflow-y-auto flex-1">
                  {loadingStudents && (
                    <div className="flex justify-center py-8">
                      <div className="w-6 h-6 rounded-full animate-spin" style={{ border: '2px solid rgba(245,166,35,0.2)', borderTopColor: '#f5a623' }} />
                    </div>
                  )}
                  {!loadingStudents && filteredAssigned.length === 0 && (
                    <p className="text-sm text-center py-8" style={{ color: DK.dimTxt }}>لا يوجد طلاب معيّنون</p>
                  )}
                  {filteredAssigned.map((student) => (
                    <div key={student.id} className="flex items-center justify-between px-4 py-2.5"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div>
                        <p className="text-sm font-medium text-white">{student.name}</p>
                        <p className="text-xs" style={{ color: DK.dimTxt }}>{student.grade?.name ?? '—'} • {student.phone}</p>
                      </div>
                      <button onClick={() => handleRemove(student)} disabled={removing === student.id}
                        className="text-xs px-2 py-1 rounded-lg transition disabled:opacity-40"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
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
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: DK.dimTxt }}>طلاب بلا مشرف</p>
            <div className="rounded-2xl overflow-hidden" style={DK.card}>
              <div className="p-3" style={{ borderBottom: '1px solid rgba(245,166,35,0.08)' }}>
                <input value={searchFree} onChange={(e) => setSearchFree(e.target.value)}
                  placeholder="بحث..." style={DK.inputStyle} />
              </div>
              <div className="overflow-y-auto max-h-[calc(100vh-320px)]">
                {!selected && (
                  <p className="text-xs text-center py-6" style={{ color: DK.dimTxt }}>اختر مشرفاً أولاً</p>
                )}
                {selected && loadingStudents && (
                  <div className="flex justify-center py-6">
                    <div className="w-5 h-5 rounded-full animate-spin" style={{ border: '2px solid rgba(245,166,35,0.2)', borderTopColor: '#f5a623' }} />
                  </div>
                )}
                {selected && !loadingStudents && filteredUnassigned.length === 0 && (
                  <p className="text-xs text-center py-6" style={{ color: DK.dimTxt }}>لا يوجد طلاب بلا مشرف</p>
                )}
                {selected && !loadingStudents && filteredUnassigned.map((student) => (
                  <div key={student.id} className="flex items-center justify-between px-3 py-2"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white truncate">{student.name}</p>
                      <p className="text-xs" style={{ color: DK.dimTxt }}>{student.grade?.name ?? '—'}</p>
                    </div>
                    <button onClick={() => handleAssign(student)}
                      disabled={assigning === student.id || assigned.length >= 150}
                      className="text-xs px-2 py-1 rounded-lg transition disabled:opacity-40 flex-shrink-0 mr-1"
                      style={{ background: 'rgba(245,166,35,0.1)', color: DK.gold }}>
                      {assigning === student.id ? '...' : 'تعيين'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {selected && assigned.length >= 150 && (
              <p className="text-xs mt-2 text-center font-semibold" style={{ color: '#fbbf24' }}>
                وصل المشرف للحد الأقصى (150 طالب)
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
