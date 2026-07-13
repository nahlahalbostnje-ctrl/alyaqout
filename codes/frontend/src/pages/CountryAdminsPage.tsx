import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import type { CountryAdmin } from '../features/countries/countriesSlice';
import {
  fetchCountries,
  createCountryAdmin,
  updateCountryAdmin,
  toggleCountryAdmin,
  deleteCountryAdmin,
} from '../features/countries/countriesSlice';
import { impersonate } from '../features/auth/authSlice';
import api from '../services/axios';
import SuperAdminShell, { C } from '../components/SuperAdminShell';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { useToast } from '../components/Toast';
import { getApiError } from '../utils/apiError';

const card = (e: React.CSSProperties = {}): React.CSSProperties => ({
  background: C.card,
  borderRadius: 18,
  padding: 16,
  boxShadow: C.shadow,
  border: `1px solid ${C.border}`,
  ...e,
});

const inp = (): React.CSSProperties => ({
  width: '100%',
  padding: '9px 14px',
  borderRadius: 11,
  border: `1px solid ${C.border}`,
  background: C.bg,
  color: C.text,
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: "'Cairo',sans-serif",
});

const btnIcon = (): React.CSSProperties => ({
  height: 30,
  padding: '0 10px',
  borderRadius: 8,
  border: `1px solid ${C.border}`,
  background: 'transparent',
  cursor: 'pointer',
  fontSize: 11,
  fontWeight: 800,
  fontFamily: "'Cairo',sans-serif",
  whiteSpace: 'nowrap',
});

export default function CountryAdminsPage() {
  const { countryId } = useParams<{ countryId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { list, loading } = useAppSelector((s) => s.countries);

  const country = list.find((c) => c.id === Number(countryId));

  const [form, setForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<CountryAdmin | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);
  const [editAdmin, setEditAdmin] = useState<CountryAdmin | null>(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editErr, setEditErr] = useState('');
  const [toggling, setToggling] = useState<number | null>(null);
  const [enteringId, setEnteringId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (list.length === 0) void dispatch(fetchCountries());
  }, [dispatch, list.length]);

  const admins = country?.admins ?? [];
  const activeCount = useMemo(() => admins.filter((a) => a.is_active).length, [admins]);
  const filtered = useMemo(() => {
    const q = search.trim();
    if (!q) return admins;
    return admins.filter((a) => a.name.includes(q) || a.phone.includes(q));
  }, [admins, search]);

  async function handleAdd() {
    if (!form.name.trim() || !form.phone.trim()) {
      setFormErr('الاسم ورقم الهاتف مطلوبان');
      return;
    }
    setSaving(true);
    setFormErr('');
    try {
      await dispatch(createCountryAdmin({
        countryId: Number(countryId),
        name: form.name.trim(),
        phone: form.phone.trim(),
      })).unwrap();
      setForm({ name: '', phone: '' });
      setShowAdd(false);
      toast.success('تم إضافة المسؤول بنجاح');
      await dispatch(fetchCountries());
    } catch (e: unknown) {
      const msg = typeof e === 'string' ? e : getApiError(e, 'تعذّر إضافة المسؤول');
      setFormErr(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(adminId: number) {
    setToggling(adminId);
    try {
      await dispatch(toggleCountryAdmin({ countryId: Number(countryId), adminId }));
      await dispatch(fetchCountries());
    } catch (e: unknown) {
      toast.error(getApiError(e, 'تعذّر تغيير حالة المسؤول'));
    } finally {
      setToggling(null);
    }
  }

  async function handleEnterAsAdmin(adminId: number) {
    setEnteringId(adminId);
    try {
      const { data } = await api.post(`/super-admin/impersonate/${adminId}`);
      dispatch(impersonate({ token: data.token, user: data.user }));
      navigate('/admin/dashboard');
    } catch (e: unknown) {
      toast.error(getApiError(e, 'تعذّر الدخول كهذا المسؤول'));
    } finally {
      setEnteringId(null);
    }
  }

  function openEdit(admin: CountryAdmin) {
    setEditAdmin(admin);
    setEditForm({ name: admin.name, phone: admin.phone });
    setEditErr('');
  }

  async function handleUpdate() {
    if (!editAdmin) return;
    if (!editForm.name.trim() || !editForm.phone.trim()) {
      setEditErr('الاسم ورقم الهاتف مطلوبان');
      return;
    }
    setEditSaving(true);
    setEditErr('');
    try {
      await dispatch(updateCountryAdmin({
        countryId: Number(countryId),
        adminId: editAdmin.id,
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
      })).unwrap();
      setEditAdmin(null);
      toast.success('تم تحديث بيانات المسؤول');
      await dispatch(fetchCountries());
    } catch (e: unknown) {
      const msg = typeof e === 'string' ? e : getApiError(e, 'تعذّر تحديث المسؤول');
      setEditErr(msg);
      toast.error(msg);
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    setDeleteErr(null);
    try {
      await dispatch(deleteCountryAdmin({
        countryId: Number(countryId),
        adminId: confirmDelete.id,
      })).unwrap();
      setConfirmDelete(null);
      toast.success('تم حذف المسؤول');
      await dispatch(fetchCountries());
    } catch (e: unknown) {
      setDeleteErr(getApiError(e, 'تعذّر حذف المسؤول'));
    } finally {
      setDeleting(false);
    }
  }

  if (loading && !country) {
    return (
      <SuperAdminShell>
        <p style={{ textAlign: 'center', color: C.sub, padding: 60 }}>جارٍ التحميل...</p>
      </SuperAdminShell>
    );
  }

  if (!country) {
    return (
      <SuperAdminShell>
        <div style={card({ textAlign: 'center', padding: 40 })}>
          <p style={{ color: C.sub, fontSize: 14, marginBottom: 14 }}>الدولة غير موجودة</p>
          <button
            type="button"
            onClick={() => navigate('/dashboard/countries')}
            style={{
              padding: '9px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: C.goldGrad, color: '#1B2038', fontWeight: 800, fontSize: 13,
              fontFamily: "'Cairo',sans-serif",
            }}
          >
            العودة لإدارة الدول
          </button>
        </div>
      </SuperAdminShell>
    );
  }

  return (
    <SuperAdminShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={() => navigate('/dashboard/countries')}
            title="العودة"
            style={{
              width: 38, height: 38, borderRadius: 12, border: `1px solid ${C.border}`,
              background: C.bg, color: C.sub, cursor: 'pointer', fontSize: 16, fontWeight: 700,
            }}
          >
            →
          </button>
          <div>
            <h1 style={{ color: C.text, fontWeight: 900, fontSize: 20, margin: 0 }}>
              مسؤولو {country.name}
            </h1>
            <p style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>
              {country.code} · عملة {country.currency} · إدارة حسابات أدمن الدولة
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { setShowAdd(true); setFormErr(''); setForm({ name: '', phone: '' }); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 12,
            background: C.goldGrad, color: '#1B2038', fontWeight: 800, fontSize: 13, border: 'none',
            cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
            boxShadow: '0 4px 14px rgba(201,149,42,0.3)',
          }}
        >
          + إضافة مسؤول
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, marginBottom: 14 }}>
        {[
          { label: 'إجمالي المسؤولين', value: String(admins.length), icon: '👤', color: C.gold },
          { label: 'النشطون', value: String(activeCount), icon: '✅', color: C.green },
          { label: 'الموقوفون', value: String(Math.max(0, admins.length - activeCount)), icon: '⏸️', color: C.orange },
          { label: 'الدولة', value: country.name, icon: '🗺️', color: C.blue },
        ].map((s) => (
          <div key={s.label} style={card({ padding: 14, display: 'flex', alignItems: 'center', gap: 12 })}>
            <div style={{
              width: 42, height: 42, borderRadius: 13, background: `${s.color}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
            }}>
              {s.icon}
            </div>
            <div>
              <p style={{ color: C.text, fontWeight: 900, fontSize: s.label === 'الدولة' ? 15 : 20, margin: 0 }}>{s.value}</p>
              <p style={{ color: C.sub, fontSize: 11, margin: 0 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={card({ marginBottom: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 })}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو الهاتف..."
            style={{
              width: '100%', padding: '8px 38px 8px 12px', borderRadius: 10,
              border: `1px solid ${C.border}`, background: C.bg, color: C.text,
              fontSize: 12, outline: 'none', boxSizing: 'border-box', fontFamily: "'Cairo',sans-serif",
            }}
          />
        </div>
        <p style={{ color: C.sub, fontSize: 12, margin: 0, flexShrink: 0 }}>
          {filtered.length} مسؤول
        </p>
      </div>

      <div style={card({ padding: 0, overflowX: 'auto' })}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.03)' }}>
              {['المسؤول', 'الهاتف', 'الحالة', 'إجراءات'].map((h) => (
                <th key={h} style={{
                  padding: '12px 14px', textAlign: 'right', color: C.sub, fontSize: 11,
                  fontWeight: 700, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <p style={{ textAlign: 'center', color: C.sub, padding: 40 }}>
                    {admins.length === 0 ? 'لا يوجد مسؤولون لهذه الدولة بعد.' : 'لا نتائج للبحث.'}
                  </p>
                </td>
              </tr>
            ) : filtered.map((admin) => (
              <tr key={admin.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 12, background: C.goldGrad,
                      color: '#1B2038', fontWeight: 900, fontSize: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {admin.name.charAt(0)}
                    </div>
                    <p style={{ color: C.text, fontWeight: 700, fontSize: 13, margin: 0 }}>{admin.name}</p>
                  </div>
                </td>
                <td style={{ padding: '12px 14px', color: C.text, fontSize: 12, direction: 'ltr', textAlign: 'right' }}>
                  {admin.phone}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: admin.is_active ? 'rgba(22,163,74,0.12)' : 'rgba(217,119,6,0.12)',
                    color: admin.is_active ? C.green : C.orange,
                  }}>
                    {admin.is_active ? 'نشط' : 'موقوف'}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => void handleEnterAsAdmin(admin.id)}
                      disabled={enteringId === admin.id}
                      title="دخول كلوحة أدمن الدولة"
                      style={{ ...btnIcon(), background: C.goldBg, color: C.gold, border: `1px solid ${C.goldBdr}` }}
                    >
                      {enteringId === admin.id ? '...' : '🔑 دخول'}
                    </button>
                    <button type="button" onClick={() => openEdit(admin)} title="تعديل" style={{ ...btnIcon(), width: 30, padding: 0, fontSize: 13 }}>
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleToggle(admin.id)}
                      disabled={toggling === admin.id}
                      title={admin.is_active ? 'إيقاف' : 'تفعيل'}
                      style={{ ...btnIcon(), width: 30, padding: 0, fontSize: 13 }}
                    >
                      {toggling === admin.id ? '…' : '🔒'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDeleteErr(null); setConfirmDelete(admin); }}
                      title="حذف"
                      style={{ ...btnIcon(), width: 30, padding: 0, fontSize: 13 }}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => { if (!saving) setShowAdd(false); }}
        >
          <div
            style={{ background: C.card, borderRadius: 20, padding: 28, width: 440, maxWidth: '90vw' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: C.text, fontWeight: 900, fontSize: 17, margin: 0 }}>إضافة مسؤول — {country.name}</h2>
              <button type="button" onClick={() => setShowAdd(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: C.sub }}>×</button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: C.sub, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>الاسم الكامل</label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="مثال: محمد أحمد" style={inp()} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: C.sub, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>رقم الهاتف</label>
              <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="05xxxxxxxx" dir="ltr" style={{ ...inp(), textAlign: 'right' }} />
            </div>
            {formErr && (
              <p style={{ color: C.red, fontSize: 12, fontWeight: 700, marginBottom: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 12px' }}>
                {formErr}
              </p>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleAdd()}
                style={{
                  flex: 1, padding: 11, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: C.goldGrad, color: '#1B2038', fontWeight: 800, fontSize: 13,
                  opacity: saving ? 0.7 : 1, fontFamily: "'Cairo',sans-serif",
                }}
              >
                {saving ? 'جارٍ الإضافة...' : 'إضافة المسؤول'}
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                style={{
                  flex: 1, padding: 11, borderRadius: 12, border: `1px solid ${C.border}`,
                  background: C.bg, color: C.sub, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  fontFamily: "'Cairo',sans-serif",
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {editAdmin && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => { if (!editSaving) setEditAdmin(null); }}
        >
          <div
            style={{ background: C.card, borderRadius: 20, padding: 28, width: 440, maxWidth: '90vw' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: C.text, fontWeight: 900, fontSize: 17, margin: 0 }}>تعديل المسؤول</h2>
              <button type="button" onClick={() => setEditAdmin(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: C.sub }}>×</button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: C.sub, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>الاسم الكامل</label>
              <input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} style={inp()} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: C.sub, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>رقم الهاتف</label>
              <input value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} dir="ltr" style={{ ...inp(), textAlign: 'right' }} />
            </div>
            {editErr && (
              <p style={{ color: C.red, fontSize: 12, fontWeight: 700, marginBottom: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 12px' }}>
                {editErr}
              </p>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                disabled={editSaving}
                onClick={() => void handleUpdate()}
                style={{
                  flex: 1, padding: 11, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: C.goldGrad, color: '#1B2038', fontWeight: 800, fontSize: 13,
                  opacity: editSaving ? 0.7 : 1, fontFamily: "'Cairo',sans-serif",
                }}
              >
                {editSaving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
              </button>
              <button
                type="button"
                onClick={() => setEditAdmin(null)}
                style={{
                  flex: 1, padding: 11, borderRadius: 12, border: `1px solid ${C.border}`,
                  background: C.bg, color: C.sub, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  fontFamily: "'Cairo',sans-serif",
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        open={!!confirmDelete}
        itemLabel={confirmDelete?.name}
        busy={deleting}
        error={deleteErr}
        onConfirm={() => void handleDelete()}
        onCancel={() => { if (!deleting) { setConfirmDelete(null); setDeleteErr(null); } }}
      />
    </SuperAdminShell>
  );
}
