import { useState, useEffect, useCallback, useMemo } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';
import api from '../services/axios';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { useToast } from '../components/Toast';
import { getApiError } from '../utils/apiError';

const card = (e = {}) => ({
  background: C.card,
  borderRadius: 18,
  padding: '16px',
  boxShadow: C.shadow,
  border: `1px solid ${C.border}`,
  ...e,
} as React.CSSProperties);

interface StudentUser {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  country_id: number | null;
  country: string | null;
  is_active: boolean;
  parent_id: number | null;
  parent_name?: string | null;
  parent_phone?: string | null;
  created_at: string | null;
}

interface CountryOpt {
  id: number;
  name: string;
}

interface ParentOpt {
  id: number;
  name: string;
  phone: string;
  country_id: number | null;
}

interface MetaCounts {
  students: number;
  parents: number;
  active_students: number;
}

type TabKey = 'students' | 'parents';

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  password: '',
  country_id: '',
  role: 'student' as 'student' | 'parent',
  parent_id: '',
};

function exportCsv(rows: StudentUser[]) {
  const header = ['id', 'name', 'phone', 'email', 'role', 'country', 'parent', 'is_active', 'created_at'];
  const lines = [
    header.join(','),
    ...rows.map((r) => [
      r.id,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      r.phone,
      `"${(r.email || '').replace(/"/g, '""')}"`,
      r.role,
      `"${(r.country || '').replace(/"/g, '""')}"`,
      `"${(r.parent_name || '').replace(/"/g, '""')}"`,
      r.is_active ? '1' : '0',
      r.created_at ?? '',
    ].join(',')),
  ];
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SAStudentsPage() {
  const toast = useToast();
  const [tab, setTab] = useState<TabKey>('students');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [users, setUsers] = useState<StudentUser[]>([]);
  const [parentsList, setParentsList] = useState<ParentOpt[]>([]);
  const [meta, setMeta] = useState<MetaCounts>({ students: 0, parents: 0, active_students: 0 });
  const [countries, setCountries] = useState<CountryOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: number; label: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [childrenParent, setChildrenParent] = useState<StudentUser | null>(null);
  const [children, setChildren] = useState<StudentUser[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(false);
  const [childrenError, setChildrenError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/super-admin/users', {
        params: {
          role: tab === 'students' ? 'student' : 'parent',
          q: search || undefined,
        },
      });
      setUsers(data.data ?? []);
      if (data.meta) {
        setMeta({
          students: data.meta.students ?? 0,
          parents: data.meta.parents ?? 0,
          active_students: data.meta.active_students ?? 0,
        });
      }
    } catch {
      setError(tab === 'students' ? 'فشل جلب قائمة الطلاب' : 'فشل جلب قائمة أولياء الأمور');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [tab, search]);

  const loadParentsOptions = useCallback(async () => {
    try {
      const { data } = await api.get('/super-admin/users', { params: { role: 'parent' } });
      const list = (data.data ?? []) as StudentUser[];
      setParentsList(list.map((p) => ({
        id: p.id,
        name: p.name,
        phone: p.phone,
        country_id: p.country_id,
      })));
    } catch {
      setParentsList([]);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { void loadUsers(); }, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [loadUsers, search]);

  useEffect(() => {
    void loadParentsOptions();
    api.get('/super-admin/countries')
      .then(({ data }) => {
        const list = (data.data ?? data.countries ?? data ?? []) as CountryOpt[];
        setCountries(Array.isArray(list) ? list.map((c) => ({ id: c.id, name: c.name })) : []);
      })
      .catch(() => setCountries([]));
  }, [loadParentsOptions]);

  const filtered = users.filter((u) => {
    if (statusFilter === 'نشط') return u.is_active;
    if (statusFilter === 'موقوف') return !u.is_active;
    return true;
  });

  const parentsForCountry = useMemo(() => {
    if (!form.country_id) return parentsList;
    const cid = Number(form.country_id);
    return parentsList.filter((p) => p.country_id === cid);
  }, [parentsList, form.country_id]);

  const openAdd = () => {
    setEditingId(null);
    setFormError(null);
    setForm({
      ...emptyForm,
      role: tab === 'students' ? 'student' : 'parent',
      country_id: countries[0] ? String(countries[0].id) : '',
      parent_id: '',
    });
    setShowModal(true);
  };

  const openEdit = (u: StudentUser) => {
    setEditingId(u.id);
    setFormError(null);
    setForm({
      name: u.name,
      phone: u.phone,
      email: u.email ?? '',
      password: '',
      country_id: u.country_id ? String(u.country_id) : '',
      role: u.role === 'parent' ? 'parent' : 'student',
      parent_id: u.parent_id ? String(u.parent_id) : '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditingId(null);
    setFormError(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.country_id) {
      const msg = 'يرجى تعبئة الاسم والجوال والدولة';
      setFormError(msg);
      toast.error(msg);
      return;
    }
    if (!form.email.trim()) {
      const msg = 'البريد الإلكتروني مطلوب لتسجيل الدخول';
      setFormError(msg);
      toast.error(msg);
      return;
    }
    if (!editingId && !form.password.trim()) {
      const msg = 'كلمة المرور مطلوبة عند إنشاء الحساب (6 أحرف على الأقل)';
      setFormError(msg);
      toast.error(msg);
      return;
    }
    if (form.password.trim() && form.password.trim().length < 6) {
      const msg = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      setFormError(msg);
      toast.error(msg);
      return;
    }
    setSaving(true);
    setFormError(null);
    const creating = !editingId;
    const createdRole = form.role;
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        country_id: Number(form.country_id),
        role: form.role,
      };
      if (form.role === 'student') {
        payload.parent_id = form.parent_id ? Number(form.parent_id) : null;
      }
      if (form.password.trim()) {
        payload.password = form.password.trim();
      }

      if (editingId) {
        await api.put(`/super-admin/users/${editingId}`, payload);
        toast.success('تم تحديث الحساب بنجاح');
      } else {
        await api.post('/super-admin/users', payload);
        toast.success(form.role === 'parent' ? 'تم إنشاء ولي الأمر بنجاح' : 'تم إنشاء الطالب بنجاح');
      }
      setShowModal(false);
      setEditingId(null);
      if (creating && createdRole === 'parent') {
        setTab('parents');
      } else if (creating && createdRole === 'student') {
        setTab('students');
      }
      await Promise.all([loadUsers(), loadParentsOptions()]);
    } catch (err: unknown) {
      const msg = getApiError(err, editingId ? 'تعذّر تحديث الحساب' : 'تعذّر إنشاء الحساب');
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const toggleUser = async (u: StudentUser) => {
    try {
      await api.patch(`/super-admin/users/${u.id}/toggle`);
      await loadUsers();
    } catch (err: unknown) {
      toast.error(getApiError(err, 'تعذّر تغيير حالة الحساب'));
    }
  };

  const askDelete = (u: StudentUser) => {
    setDeleteError(null);
    setPendingDelete({ id: u.id, label: u.name });
  };

  const openChildren = async (parent: StudentUser) => {
    setChildrenParent(parent);
    setChildren([]);
    setChildrenError(null);
    setChildrenLoading(true);
    try {
      const { data } = await api.get('/super-admin/users', {
        params: { role: 'student', parent_id: parent.id },
      });
      setChildren(data.data ?? []);
    } catch (err: unknown) {
      setChildrenError(getApiError(err, 'تعذّر جلب طلاب ولي الأمر'));
    } finally {
      setChildrenLoading(false);
    }
  };

  const closeChildren = () => {
    setChildrenParent(null);
    setChildren([]);
    setChildrenError(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await api.delete(`/super-admin/users/${pendingDelete.id}`);
      setPendingDelete(null);
      await Promise.all([loadUsers(), loadParentsOptions()]);
    } catch {
      setDeleteError('تعذّر حذف الحساب');
    } finally {
      setDeleteBusy(false);
    }
  };

  const isEdit = editingId !== null;
  const showParentColumn = tab === 'students';
  const colCount = showParentColumn ? 8 : 7;

  return (
    <SuperAdminShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ color: C.text, fontWeight: 900, fontSize: 20, margin: 0 }}>الطلاب وأولياء الأمور</h1>
          <p style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>إدارة حسابات الطلاب وربطهم بأولياء الأمور</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => exportCsv(filtered)}
            disabled={filtered.length === 0}
            title={filtered.length === 0 ? 'لا توجد بيانات للتصدير' : 'تصدير CSV'}
            style={{
              padding: '9px 16px', borderRadius: 12, background: C.bg, color: C.text,
              fontWeight: 700, fontSize: 12, border: `1px solid ${C.border}`,
              cursor: filtered.length === 0 ? 'not-allowed' : 'pointer',
              opacity: filtered.length === 0 ? 0.5 : 1,
            }}
          >
            📤 تصدير
          </button>
          <button
            type="button"
            onClick={openAdd}
            style={{
              padding: '9px 18px', borderRadius: 12, background: C.goldGrad, color: '#1B2038',
              fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer',
            }}
          >
            {tab === 'students' ? '+ إضافة طالب' : '+ إضافة ولي أمر'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ ...card(), marginBottom: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: C.red, fontSize: 13, fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, marginBottom: 14 }}>
        {[
          { label: 'إجمالي الطلاب', value: String(meta.students), icon: '🎓', color: C.purple, sub: 'مسجّلون في المنصة' },
          { label: 'الطلاب النشطون', value: String(meta.active_students), icon: '⚡', color: C.green, sub: 'حسابات مفعّلة' },
          { label: 'موقوفون', value: String(Math.max(0, meta.students - meta.active_students)), icon: '⏸️', color: C.orange, sub: 'طلاب غير نشطين' },
          { label: 'أولياء الأمور', value: String(meta.parents), icon: '👨‍👩‍👦', color: C.teal, sub: 'حسابات أولياء' },
        ].map((s, i) => (
          <div key={i} style={card({ padding: '14px' })}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ color: C.sub, fontSize: 11 }}>{s.label}</p>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
            </div>
            <p style={{ color: C.text, fontWeight: 900, fontSize: 21 }}>{loading ? '…' : s.value}</p>
            <p style={{ color: s.color, fontSize: 11, fontWeight: 600, marginTop: 4 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div style={card({ marginBottom: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' })}>
        <div style={{ display: 'flex', borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}`, flexShrink: 0 }}>
          {([
            { key: 'students' as const, label: 'الطلاب' },
            { key: 'parents' as const, label: 'أولياء الأمور' },
          ]).map((t, i) => (
            <button
              key={t.key}
              type="button"
              onClick={() => { setTab(t.key); setStatusFilter('الكل'); }}
              style={{
                padding: '8px 18px', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
                background: tab === t.key ? C.goldGrad : 'transparent',
                color: tab === t.key ? '#1B2038' : C.sub,
                borderLeft: i === 0 ? 'none' : `1px solid ${C.border}`,
                fontFamily: "'Cairo',sans-serif",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, position: 'relative', minWidth: 160 }}>
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === 'students' ? 'بحث باسم الطالب أو الهاتف...' : 'بحث باسم ولي الأمر أو الهاتف...'}
            style={{
              width: '100%', padding: '8px 38px 8px 12px', borderRadius: 10,
              border: `1px solid ${C.border}`, background: C.bg, color: C.text,
              fontSize: 12, outline: 'none', boxSizing: 'border-box',
              fontFamily: "'Cairo',sans-serif",
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 14px', borderRadius: 10, border: `1px solid ${C.border}`,
            background: C.bg, color: C.text, fontSize: 12, outline: 'none', cursor: 'pointer',
            fontFamily: "'Cairo',sans-serif",
          }}
        >
          {['الكل', 'نشط', 'موقوف'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div style={card({ padding: 0, overflowX: 'auto' })}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 580 }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.03)' }}>
              {(showParentColumn
                ? ['الاسم', 'الهاتف', 'البريد', 'الدولة', 'ولي الأمر', 'الحالة', 'إجراءات']
                : ['الاسم', 'الهاتف', 'البريد', 'الدولة', 'الحالة', 'إجراءات']
              ).map((h) => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'right', color: C.sub, fontSize: 11, fontWeight: 700, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={colCount}><p style={{ textAlign: 'center', color: '#6B7280', padding: 40 }}>جارٍ التحميل...</p></td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={colCount}>
                  <p style={{ textAlign: 'center', color: '#6B7280', padding: 40 }}>
                    {tab === 'students' ? 'لا يوجد طلاب' : 'لا يوجد أولياء أمور'}
                  </p>
                </td>
              </tr>
            ) : filtered.map((u) => (
              <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: '12px 14px', color: C.text, fontWeight: 700, fontSize: 13 }}>{u.name}</td>
                <td style={{ padding: '12px 14px', color: C.text, fontSize: 12, direction: 'ltr', textAlign: 'right' }}>{u.phone}</td>
                <td style={{ padding: '12px 14px', color: C.sub, fontSize: 12, direction: 'ltr', textAlign: 'right' }}>{u.email || '—'}</td>
                <td style={{ padding: '12px 14px', color: C.sub, fontSize: 12 }}>{u.country || '—'}</td>
                {showParentColumn && (
                  <td style={{ padding: '12px 14px', color: C.sub, fontSize: 12 }}>
                    {u.parent_name
                      ? (
                        <span>
                          {u.parent_name}
                          {u.parent_phone ? <span style={{ color: C.dim, marginRight: 6, direction: 'ltr' }}>({u.parent_phone})</span> : null}
                        </span>
                      )
                      : '—'}
                  </td>
                )}
                <td style={{ padding: '12px 14px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: u.is_active ? 'rgba(22,163,74,0.12)' : 'rgba(217,119,6,0.12)',
                    color: u.is_active ? C.green : C.orange,
                  }}>
                    {u.is_active ? 'نشط' : 'موقوف'}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {tab === 'parents' && (
                      <button
                        type="button"
                        onClick={() => void openChildren(u)}
                        title="عرض الطلاب"
                        style={{
                          height: 30, padding: '0 10px', borderRadius: 8,
                          border: `1px solid ${C.border}`, background: C.goldBg,
                          color: C.gold, cursor: 'pointer', fontSize: 11, fontWeight: 800,
                          fontFamily: "'Cairo',sans-serif", whiteSpace: 'nowrap',
                        }}
                      >
                        👥 الطلاب
                      </button>
                    )}
                    <button type="button" onClick={() => openEdit(u)} title="تعديل" style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', fontSize: 13 }}>✏️</button>
                    <button type="button" onClick={() => void toggleUser(u)} title={u.is_active ? 'إيقاف' : 'تفعيل'} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', fontSize: 13 }}>🔒</button>
                    <button type="button" onClick={() => askDelete(u)} title="حذف" style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', fontSize: 13 }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={closeModal}>
          <div style={{ background: C.card, borderRadius: 20, padding: 28, width: 460, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: C.text, fontWeight: 900, fontSize: 17, margin: 0 }}>
                {isEdit
                  ? 'تعديل بيانات الحساب'
                  : (form.role === 'parent' ? 'إضافة ولي أمر' : 'إضافة طالب')}
              </h2>
              <button type="button" onClick={closeModal} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: C.sub }}>×</button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ color: C.sub, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>النوع</label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({
                  ...f,
                  role: e.target.value as 'student' | 'parent',
                  parent_id: e.target.value === 'parent' ? '' : f.parent_id,
                }))}
                style={{
                  width: '100%', padding: '9px 14px', borderRadius: 11, border: `1px solid ${C.border}`,
                  background: C.bg, color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box', cursor: 'pointer',
                  fontFamily: "'Cairo',sans-serif",
                }}
              >
                <option value="student">طالب</option>
                <option value="parent">ولي أمر</option>
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ color: C.sub, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>الاسم</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="الاسم الكامل"
                style={{
                  width: '100%', padding: '9px 14px', borderRadius: 11, border: `1px solid ${C.border}`,
                  background: C.bg, color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box',
                  fontFamily: "'Cairo',sans-serif",
                }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ color: C.sub, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>رقم الجوال</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="05xxxxxxxx أو +970..."
                style={{
                  width: '100%', padding: '9px 14px', borderRadius: 11, border: `1px solid ${C.border}`,
                  background: C.bg, color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box',
                  direction: 'ltr', textAlign: 'right', fontFamily: "'Cairo',sans-serif",
                }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ color: C.sub, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>البريد الإلكتروني (لتسجيل الدخول)</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="student@example.com"
                dir="ltr"
                style={{
                  width: '100%', padding: '9px 14px', borderRadius: 11, border: `1px solid ${C.border}`,
                  background: C.bg, color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box',
                  textAlign: 'right', fontFamily: "'Cairo',sans-serif",
                }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ color: C.sub, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>
                كلمة المرور {isEdit ? '(اتركها فارغة للإبقاء على الحالية)' : ''}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder={isEdit ? '••••••••' : '6 أحرف على الأقل'}
                dir="ltr"
                style={{
                  width: '100%', padding: '9px 14px', borderRadius: 11, border: `1px solid ${C.border}`,
                  background: C.bg, color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box',
                  textAlign: 'right', fontFamily: "'Cairo',sans-serif",
                }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ color: C.sub, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>الدولة</label>
              <select
                value={form.country_id}
                onChange={(e) => setForm((f) => ({ ...f, country_id: e.target.value, parent_id: '' }))}
                style={{
                  width: '100%', padding: '9px 14px', borderRadius: 11, border: `1px solid ${C.border}`,
                  background: C.bg, color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box', cursor: 'pointer',
                  fontFamily: "'Cairo',sans-serif",
                }}
              >
                <option value="">اختر الدولة</option>
                {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {form.role === 'student' && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ color: C.sub, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>ولي الأمر (اختياري)</label>
                <select
                  value={form.parent_id}
                  onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}
                  style={{
                    width: '100%', padding: '9px 14px', borderRadius: 11, border: `1px solid ${C.border}`,
                    background: C.bg, color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box', cursor: 'pointer',
                    fontFamily: "'Cairo',sans-serif",
                  }}
                >
                  <option value="">بدون ربط</option>
                  {parentsForCountry.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {p.phone}</option>
                  ))}
                </select>
                {form.country_id && parentsForCountry.length === 0 && (
                  <p style={{ color: C.dim, fontSize: 11, marginTop: 6 }}>لا يوجد أولياء أمور في هذه الدولة بعد. أضِف ولي أمر من تبويب أولياء الأمور.</p>
                )}
              </div>
            )}

            {formError && (
              <p style={{ color: C.red, fontSize: 12, fontWeight: 700, marginBottom: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 12px' }}>
                {formError}
              </p>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSubmit()}
                style={{
                  flex: 1, padding: '11px', borderRadius: 12, background: C.goldGrad, color: '#1B2038',
                  fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1,
                  fontFamily: "'Cairo',sans-serif",
                }}
              >
                {saving ? 'جارٍ الحفظ...' : (isEdit ? 'حفظ التعديلات' : 'إنشاء الحساب')}
              </button>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  flex: 1, padding: '11px', borderRadius: 12, background: C.bg, color: C.sub,
                  fontWeight: 600, fontSize: 13, border: `1px solid ${C.border}`, cursor: 'pointer',
                  fontFamily: "'Cairo',sans-serif",
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {childrenParent && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 210, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={closeChildren}
        >
          <div
            style={{ background: C.card, borderRadius: 20, padding: 24, width: 520, maxWidth: '92vw', maxHeight: '85vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h2 style={{ color: C.text, fontWeight: 900, fontSize: 17, margin: 0 }}>طلاب ولي الأمر</h2>
                <p style={{ color: C.sub, fontSize: 12, marginTop: 4 }}>
                  {childrenParent.name}
                  <span style={{ direction: 'ltr', marginRight: 8 }}>{childrenParent.phone}</span>
                </p>
              </div>
              <button type="button" onClick={closeChildren} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: C.sub }}>×</button>
            </div>

            {childrenError && (
              <p style={{ color: C.red, fontSize: 12, fontWeight: 700, marginBottom: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 12px' }}>
                {childrenError}
              </p>
            )}

            {childrenLoading ? (
              <p style={{ textAlign: 'center', color: C.sub, padding: 28 }}>جارٍ التحميل...</p>
            ) : children.length === 0 ? (
              <p style={{ textAlign: 'center', color: C.sub, padding: 28 }}>لا يوجد طلاب مرتبطون بهذا الولي بعد.</p>
            ) : (
              <div style={{ border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.03)' }}>
                      {['الاسم', 'الهاتف', 'الدولة', 'الحالة'].map((h) => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'right', color: C.sub, fontWeight: 700 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {children.map((s) => (
                      <tr key={s.id} style={{ borderTop: `1px solid ${C.border}` }}>
                        <td style={{ padding: '10px 12px', color: C.text, fontWeight: 700 }}>{s.name}</td>
                        <td style={{ padding: '10px 12px', color: C.text, direction: 'ltr', textAlign: 'right' }}>{s.phone}</td>
                        <td style={{ padding: '10px 12px', color: C.sub }}>{s.country || '—'}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            padding: '3px 8px', borderRadius: 16, fontSize: 11, fontWeight: 700,
                            background: s.is_active ? 'rgba(22,163,74,0.12)' : 'rgba(217,119,6,0.12)',
                            color: s.is_active ? C.green : C.orange,
                          }}>
                            {s.is_active ? 'نشط' : 'موقوف'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button
              type="button"
              onClick={closeChildren}
              style={{
                marginTop: 16, width: '100%', padding: '11px', borderRadius: 12,
                border: `1px solid ${C.border}`, background: C.bg, color: C.sub,
                fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
              }}
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        open={!!pendingDelete}
        itemLabel={pendingDelete?.label}
        busy={deleteBusy}
        error={deleteError}
        onConfirm={() => void confirmDelete()}
        onCancel={() => { if (!deleteBusy) { setPendingDelete(null); setDeleteError(null); } }}
      />
    </SuperAdminShell>
  );
}
