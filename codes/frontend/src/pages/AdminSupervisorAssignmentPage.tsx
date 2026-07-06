import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../services/axios';

const DK = {
  gold: '#C59341', goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
  bg: '#F5EDD8', card: '#FFFFFF', navy: '#0D1E3A',
  text: '#1B2038', sub: '#6B7280', dim: '#9CA3AF', border: '#EDE3CE',
  shadow: '0 2px 16px rgba(0,0,0,0.06)',
  green: '#10B981', red: '#EF4444', blue: '#3B82F6', orange: '#F59E0B', purple: '#8B5CF6',
};
const card = (e: React.CSSProperties = {}): React.CSSProperties => ({
  background: '#FFFFFF', borderRadius: 16, padding: 20,
  boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #EDE3CE', ...e,
});
const btn = (v: 'gold' | 'outline' | 'danger' = 'gold'): React.CSSProperties => ({
  padding: '9px 20px', borderRadius: 12, border: v === 'outline' ? '1px solid #EDE3CE' : 'none',
  background: v === 'gold' ? '#C59341' : v === 'danger' ? '#EF4444' : '#FFFFFF',
  color: v === 'outline' ? '#1B2038' : '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
  fontFamily: "'Cairo',sans-serif",
});
const inp = (focused = false): React.CSSProperties => ({
  background: '#FFFFFF', border: `1.5px solid ${focused ? '#C59341' : '#EDE3CE'}`,
  color: '#1B2038', borderRadius: 12, padding: '10px 14px', fontSize: 13,
  width: '100%', outline: 'none', fontFamily: "'Cairo',sans-serif",
});

interface Supervisor {
  id: number;
  name: string;
  phone: string;
  student_count: number;
}

interface Student {
  id: number;
  name: string;
  phone: string;
  grade_id: number | null;
  grade?: { id: number; name: string } | null;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: 500, maxWidth: '95vw' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ color: '#1B2038', fontWeight: 900, fontSize: 17, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #EDE3CE', background: 'transparent', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AdminSupervisorAssignmentPage() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [selected, setSelected] = useState<Supervisor | null>(null);
  const [assigned, setAssigned] = useState<Student[]>([]);
  const [unassigned, setUnassigned] = useState<Student[]>([]);
  const [loadingSupervisors, setLoadingSupervisors] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [assigning, setAssigning] = useState<number | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const [searchAssigned, setSearchAssigned] = useState('');
  const [searchFree, setSearchFree] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [freeFocus, setFreeFocus] = useState(false);

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

  const filteredAssigned = assigned.filter((s) =>
    s.name.includes(searchAssigned) || s.phone.includes(searchAssigned)
  );
  const filteredUnassigned = unassigned.filter((s) =>
    s.name.includes(searchFree) || s.phone.includes(searchFree)
  );

  const TH: React.CSSProperties = {
    padding: '11px 16px', textAlign: 'right', color: '#6B7280', fontSize: 12,
    fontWeight: 700, background: '#F8F5EE', borderBottom: '1px solid #EDE3CE',
  };
  const TD: React.CSSProperties = {
    padding: '12px 16px', borderBottom: '1px solid #F3EDE0', fontSize: 13, color: '#1B2038',
  };

  return (
    <AdminLayout>
      <div dir="rtl" style={{ fontFamily: "'Cairo',sans-serif", background: DK.bg, minHeight: '100vh', padding: 24 }}>

        {/* Page Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 4, height: 24, borderRadius: 4, background: DK.goldGrad }} />
            <h1 style={{ fontSize: 22, fontWeight: 900, color: DK.text, margin: 0 }}>المشرفون الأكاديميون</h1>
          </div>
          <p style={{ color: DK.sub, fontSize: 13, marginRight: 14 }}>تعيين الطلاب للمشرفين — كل مشرف يتابع 100–150 طالباً</p>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

          {/* LEFT SIDEBAR — Supervisors list */}
          <div style={{ width: 240, flexShrink: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: DK.sub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>المشرفون ({supervisors.length})</p>

            {loadingSupervisors && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid rgba(197,147,65,0.15)`, borderTopColor: DK.gold, animation: 'spin 0.8s linear infinite' }} />
              </div>
            )}
            {!loadingSupervisors && supervisors.length === 0 && (
              <div style={card({ padding: 20, textAlign: 'center' })}>
                <p style={{ color: DK.sub, fontSize: 13 }}>لا يوجد مشرفون</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {supervisors.map((sup) => {
                const isSelected = selected?.id === sup.id;
                return (
                  <button key={sup.id} onClick={() => selectSupervisor(sup)}
                    style={{
                      width: '100%', textAlign: 'right', padding: '12px 14px', borderRadius: 14,
                      border: isSelected ? `1.5px solid ${DK.gold}` : '1.5px solid #EDE3CE',
                      background: isSelected ? 'rgba(197,147,65,0.06)' : '#FFFFFF',
                      cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 10,
                      boxShadow: isSelected ? '0 2px 12px rgba(197,147,65,0.15)' : '0 1px 4px rgba(0,0,0,0.04)',
                    }}>
                    {/* Avatar */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: isSelected ? DK.goldGrad : '#F5EDD8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 800, color: isSelected ? '#fff' : DK.gold,
                    }}>
                      {sup.name[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: isSelected ? DK.gold : DK.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sup.name}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 20,
                          background: sup.student_count >= 150 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                          color: sup.student_count >= 150 ? DK.red : DK.green,
                        }}>
                          {sup.student_count} طالب
                        </span>
                        {sup.student_count >= 150 && (
                          <span style={{ fontSize: 10, color: DK.red, fontWeight: 700 }}>ممتلئ</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT MAIN */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {!selected ? (
              <div style={{
                ...card({ padding: 60, textAlign: 'center', border: '2px dashed #EDE3CE', background: '#FAFAF8' }),
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: '#F5EDD8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👨‍🏫</div>
                <p style={{ color: DK.sub, fontSize: 14, fontWeight: 600 }}>اختر مشرفاً من القائمة لعرض طلابه</p>
              </div>
            ) : (
              <div>
                {/* Supervisor Header Card */}
                <div style={card({ padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' })}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14, background: DK.goldGrad,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, fontWeight: 800, color: '#fff',
                    }}>
                      {selected.name[0]}
                    </div>
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 900, color: DK.text, margin: 0 }}>{selected.name}</p>
                      <p style={{ fontSize: 12, color: DK.sub, margin: '3px 0 0' }}>{selected.phone}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'center', padding: '8px 16px', borderRadius: 12, background: 'rgba(197,147,65,0.08)', border: '1px solid rgba(197,147,65,0.2)' }}>
                      <p style={{ fontSize: 20, fontWeight: 900, color: DK.gold, margin: 0 }}>{assigned.length}</p>
                      <p style={{ fontSize: 11, color: DK.sub, margin: 0 }}>طالب مسجّل</p>
                    </div>
                    <button
                      onClick={() => setShowAddModal(true)}
                      style={{ ...btn('gold'), display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> إضافة طالب
                    </button>
                  </div>
                </div>

                {/* Assigned Students Table */}
                <div style={card({ padding: 0, overflow: 'hidden' })}>
                  {/* Search bar */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #EDE3CE', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 15, color: DK.sub }}>🔍</span>
                    <input
                      value={searchAssigned}
                      onChange={(e) => setSearchAssigned(e.target.value)}
                      onFocus={() => setSearchFocus(true)}
                      onBlur={() => setSearchFocus(false)}
                      placeholder="بحث في الطلاب المعيّنين..."
                      style={{ ...inp(searchFocus), border: 'none', boxShadow: 'none', padding: '4px 0', fontSize: 13 }}
                    />
                  </div>

                  {loadingStudents ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid rgba(197,147,65,0.15)`, borderTopColor: DK.gold, animation: 'spin 0.8s linear infinite' }} />
                    </div>
                  ) : filteredAssigned.length === 0 ? (
                    <div style={{ padding: '40px 0', textAlign: 'center' }}>
                      <p style={{ fontSize: 14, color: DK.sub }}>لا يوجد طلاب معيّنون لهذا المشرف</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
                      <thead>
                        <tr>
                          <th style={TH}>اسم الطالب</th>
                          <th style={TH}>الصف</th>
                          <th style={TH}>رقم الهاتف</th>
                          <th style={{ ...TH, textAlign: 'center' }}>إجراء</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAssigned.map((student) => (
                          <tr key={student.id}>
                            <td style={TD}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                  width: 30, height: 30, borderRadius: 8, background: '#F5EDD8',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 12, fontWeight: 800, color: DK.gold, flexShrink: 0,
                                }}>
                                  {student.name[0]}
                                </div>
                                <span style={{ fontWeight: 600 }}>{student.name}</span>
                              </div>
                            </td>
                            <td style={{ ...TD, color: DK.sub }}>{student.grade?.name ?? '—'}</td>
                            <td style={{ ...TD, color: DK.sub, direction: 'ltr', textAlign: 'right' }}>{student.phone}</td>
                            <td style={{ ...TD, textAlign: 'center' }}>
                              <button
                                onClick={() => handleRemove(student)}
                                disabled={removing === student.id}
                                style={{
                                  padding: '5px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                  background: 'rgba(239,68,68,0.08)', color: DK.red,
                                  fontSize: 12, fontWeight: 700, fontFamily: "'Cairo',sans-serif",
                                  opacity: removing === student.id ? 0.5 : 1,
                                }}>
                                {removing === student.id ? '...' : 'إزالة'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  )}
                </div>

                {selected && assigned.length >= 150 && (
                  <div style={{ marginTop: 10, padding: '8px 16px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', textAlign: 'center' }}>
                    <span style={{ fontSize: 12, color: DK.orange, fontWeight: 700 }}>وصل المشرف للحد الأقصى (150 طالب)</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && selected && (
        <Modal title="إضافة طالب للمشرف" onClose={() => { setShowAddModal(false); setSearchFree(''); }}>
          <div>
            <p style={{ fontSize: 12, color: DK.sub, marginBottom: 12 }}>
              اختر طالباً من القائمة لتعيينه للمشرف <strong style={{ color: DK.gold }}>{selected.name}</strong>
            </p>
            <input
              value={searchFree}
              onChange={(e) => setSearchFree(e.target.value)}
              onFocus={() => setFreeFocus(true)}
              onBlur={() => setFreeFocus(false)}
              placeholder="بحث في الطلاب غير المعيّنين..."
              style={{ ...inp(freeFocus), marginBottom: 12 }}
            />
            <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #EDE3CE', borderRadius: 12 }}>
              {loadingStudents ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', border: `3px solid rgba(197,147,65,0.15)`, borderTopColor: DK.gold, animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : filteredUnassigned.length === 0 ? (
                <p style={{ textAlign: 'center', color: DK.sub, padding: '20px 0', fontSize: 13 }}>
                  لا يوجد طلاب بلا مشرف
                </p>
              ) : (
                filteredUnassigned.map((student) => (
                  <div key={student.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderBottom: '1px solid #F3EDE0',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, background: '#F5EDD8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 800, color: DK.gold,
                      }}>
                        {student.name[0]}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: DK.text }}>{student.name}</p>
                        <p style={{ fontSize: 11, color: DK.sub, margin: 0 }}>{student.grade?.name ?? '—'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { handleAssign(student); }}
                      disabled={assigning === student.id || assigned.length >= 150}
                      style={{
                        padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: DK.goldGrad, color: '#fff',
                        fontSize: 12, fontWeight: 700, fontFamily: "'Cairo',sans-serif",
                        opacity: (assigning === student.id || assigned.length >= 150) ? 0.5 : 1,
                      }}>
                      {assigning === student.id ? '...' : 'تعيين'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Modal>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  );
}
