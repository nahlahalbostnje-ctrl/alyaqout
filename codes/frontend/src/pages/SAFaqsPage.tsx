import { useCallback, useEffect, useState } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { useToast } from '../components/Toast';
import api from '../services/axios';
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

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string | null;
}

const emptyForm = { question: '', answer: '', sort_order: '0', is_active: true };

export default function SAFaqsPage() {
  const toast = useToast();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [meta, setMeta] = useState({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErr, setFormErr] = useState('');
  const [saving, setSaving] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<{ id: number; label: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/super-admin/faqs');
      setFaqs(data.data ?? []);
      setMeta({
        total: data.meta?.total ?? (data.data?.length ?? 0),
        active: data.meta?.active ?? 0,
      });
    } catch (e: unknown) {
      setError(getApiError(e, 'فشل جلب الأسئلة الشائعة'));
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = faqs.filter((f) => {
    const q = search.trim();
    if (!q) return true;
    return f.question.includes(q) || f.answer.includes(q);
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, sort_order: String(faqs.length) });
    setFormErr('');
    setShowModal(true);
  };

  const openEdit = (faq: FaqItem) => {
    setEditing(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      sort_order: String(faq.sort_order),
      is_active: faq.is_active,
    });
    setFormErr('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      setFormErr('السؤال والإجابة مطلوبان');
      return;
    }
    setSaving(true);
    setFormErr('');
    try {
      const payload = {
        question: form.question.trim(),
        answer: form.answer.trim(),
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      };
      if (editing) {
        await api.put(`/super-admin/faqs/${editing.id}`, payload);
        toast.success('تم تحديث السؤال');
      } else {
        await api.post('/super-admin/faqs', payload);
        toast.success('تمت إضافة السؤال');
      }
      setShowModal(false);
      await load();
    } catch (e: unknown) {
      const msg = getApiError(e, 'تعذّر الحفظ');
      setFormErr(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (faq: FaqItem) => {
    setToggling(faq.id);
    try {
      await api.patch(`/super-admin/faqs/${faq.id}/toggle`);
      await load();
    } catch (e: unknown) {
      toast.error(getApiError(e, 'تعذّر تغيير الحالة'));
    } finally {
      setToggling(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleteBusy(true);
    setDeleteErr(null);
    try {
      await api.delete(`/super-admin/faqs/${pendingDelete.id}`);
      setPendingDelete(null);
      toast.success('تم حذف السؤال');
      await load();
    } catch (e: unknown) {
      setDeleteErr(getApiError(e, 'تعذّر الحذف'));
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <SuperAdminShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ color: C.text, fontWeight: 900, fontSize: 20, margin: 0 }}>الأسئلة الشائعة</h1>
          <p style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>
            إدارة أسئلة الصفحة الرئيسية للمنصة — تظهر للزوار مباشرة
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 12,
            background: C.goldGrad, color: '#1B2038', fontWeight: 800, fontSize: 13, border: 'none',
            cursor: 'pointer', fontFamily: "'Cairo',sans-serif",
            boxShadow: '0 4px 14px rgba(201,149,42,0.3)',
          }}
        >
          + إضافة سؤال
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'إجمالي الأسئلة', value: String(meta.total), color: C.purple },
          { label: 'ظاهرة للزوار', value: String(meta.active), color: C.green },
          { label: 'مخفية', value: String(Math.max(0, meta.total - meta.active)), color: C.orange },
        ].map((s) => (
          <div key={s.label} style={card({ padding: '14px 16px' })}>
            <p style={{ color: C.sub, fontSize: 11, fontWeight: 700, margin: 0 }}>{s.label}</p>
            <p style={{ color: s.color, fontWeight: 900, fontSize: 22, margin: '6px 0 0' }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 14 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث في السؤال أو الإجابة..."
          style={{ ...inp(), maxWidth: 420 }}
        />
      </div>

      {error && (
        <p style={{ color: C.red, fontSize: 13, fontWeight: 700, marginBottom: 12 }}>{error}</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={card({ padding: 40, textAlign: 'center', color: C.sub })}>جارٍ التحميل...</div>
        ) : filtered.length === 0 ? (
          <div style={card({ padding: 40, textAlign: 'center' })}>
            <p style={{ color: C.sub, fontSize: 14, margin: 0 }}>
              {faqs.length === 0 ? 'لا توجد أسئلة بعد. أضف أول سؤال للصفحة الرئيسية.' : 'لا نتائج للبحث.'}
            </p>
          </div>
        ) : filtered.map((faq) => (
          <div key={faq.id} style={card({ padding: 0, overflow: 'hidden' })}>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', cursor: 'pointer',
              }}
              onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
            >
              <span style={{ color: C.gold, fontWeight: 900, fontSize: 14 }}>
                {expanded === faq.id ? '▲' : '▼'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: C.text, fontWeight: 800, fontSize: 13.5, margin: 0 }}>{faq.question}</p>
                <p style={{ color: C.dim, fontSize: 11, margin: '4px 0 0' }}>ترتيب: {faq.sort_order}</p>
              </div>
              <span style={{
                padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0,
                background: faq.is_active ? 'rgba(22,163,74,0.12)' : 'rgba(107,114,128,0.12)',
                color: faq.is_active ? C.green : C.sub,
              }}>
                {faq.is_active ? 'ظاهر' : 'مخفي'}
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); openEdit(faq); }}
                title="تعديل"
                style={{
                  width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`,
                  background: 'transparent', cursor: 'pointer', fontSize: 13,
                }}
              >
                ✏️
              </button>
              <button
                type="button"
                disabled={toggling === faq.id}
                onClick={(e) => { e.stopPropagation(); void handleToggle(faq); }}
                title={faq.is_active ? 'إخفاء' : 'إظهار'}
                style={{
                  width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`,
                  background: 'transparent', cursor: 'pointer', fontSize: 13,
                }}
              >
                {toggling === faq.id ? '…' : '🔒'}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteErr(null);
                  setPendingDelete({ id: faq.id, label: faq.question });
                }}
                title="حذف"
                style={{
                  width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`,
                  background: 'transparent', cursor: 'pointer', fontSize: 13,
                }}
              >
                🗑️
              </button>
            </div>
            {expanded === faq.id && (
              <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${C.border}` }}>
                <p style={{ color: C.sub, fontSize: 13.5, lineHeight: 1.8, margin: '12px 0 0', whiteSpace: 'pre-wrap' }}>
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => { if (!saving) setShowModal(false); }}
        >
          <div
            style={{ background: C.card, borderRadius: 20, padding: 28, width: 520, maxWidth: '92vw', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: C.text, fontWeight: 900, fontSize: 17, margin: 0 }}>
                {editing ? 'تعديل السؤال' : 'إضافة سؤال شائع'}
              </h2>
              <button type="button" onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: C.sub }}>×</button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ color: C.sub, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>السؤال</label>
              <input
                value={form.question}
                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                placeholder="مثال: كيف أسجّل في المنصة؟"
                style={inp()}
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: C.sub, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>الإجابة</label>
              <textarea
                value={form.answer}
                onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                rows={5}
                placeholder="اكتب الإجابة التفصيلية..."
                style={{ ...inp(), resize: 'vertical', lineHeight: 1.7 }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ color: C.sub, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>الترتيب</label>
                <input
                  type="number"
                  min={0}
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                  style={inp()}
                />
              </div>
              <div>
                <label style={{ color: C.sub, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>الحالة</label>
                <select
                  value={form.is_active ? '1' : '0'}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value === '1' }))}
                  style={{ ...inp(), cursor: 'pointer' }}
                >
                  <option value="1">ظاهر للزوار</option>
                  <option value="0">مخفي</option>
                </select>
              </div>
            </div>

            {formErr && (
              <p style={{
                color: C.red, fontSize: 12, fontWeight: 700, marginBottom: 14,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 10, padding: '10px 12px',
              }}>
                {formErr}
              </p>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSave()}
                style={{
                  flex: 1, padding: 11, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: C.goldGrad, color: '#1B2038', fontWeight: 800, fontSize: 13,
                  opacity: saving ? 0.7 : 1, fontFamily: "'Cairo',sans-serif",
                }}
              >
                {saving ? 'جارٍ الحفظ...' : (editing ? 'حفظ التعديلات' : 'إضافة السؤال')}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
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
        open={!!pendingDelete}
        itemLabel={pendingDelete?.label}
        busy={deleteBusy}
        error={deleteErr}
        onConfirm={() => void confirmDelete()}
        onCancel={() => { if (!deleteBusy) { setPendingDelete(null); setDeleteErr(null); } }}
      />
    </SuperAdminShell>
  );
}
