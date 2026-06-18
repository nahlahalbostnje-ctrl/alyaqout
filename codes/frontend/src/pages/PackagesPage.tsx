import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchPackages,
  addPackage,
  togglePackage,
  deletePackage,
} from '../features/admin/packagesSlice';
import AdminLayout from '../components/AdminLayout';

const DK = {
  card:    { background: '#070e22', border: '1px solid rgba(245,166,35,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  gold:    '#f5a623',
  goldL:   '#ffd166',
  navy:    '#040a18',
  dimTxt:  'rgba(255,255,255,0.4)',
  inputStyle: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(245,166,35,0.15)',
    color: '#fff',
    borderRadius: '12px',
    padding: '10px 14px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
  }
};

const emptyForm = { name: '', description: '', price: 0, duration_days: 30, sort_order: 0 };

export default function PackagesPage() {
  const dispatch = useAppDispatch();
  const { list: packages, loading } = useAppSelector((s) => s.packages);

  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [addError, setAddError]     = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [toggling, setToggling]     = useState<number | null>(null);
  const [deleting, setDeleting]     = useState<number | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchPackages()); }, [dispatch]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    const result = await dispatch(addPackage(form));
    setAddLoading(false);
    if (addPackage.fulfilled.match(result)) {
      setShowModal(false);
      setForm(emptyForm);
    } else {
      setAddError(result.payload as string);
    }
  };

  const handleToggle = async (id: number) => {
    setToggling(id);
    await dispatch(togglePackage(id));
    setToggling(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الباقة؟')) return;
    setDeleting(id);
    await dispatch(deletePackage(id));
    setDeleting(null);
  };

  const inputStyle = (field: string) => ({
    ...DK.inputStyle,
    border: focusedInput === field ? '1px solid #f5a623' : '1px solid rgba(245,166,35,0.15)',
  });

  return (
    <AdminLayout>
      <div className="p-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f5a623, #ffd166)' }} />
            <h2 className="text-xl font-bold text-white">الباقات والاشتراكات</h2>
          </div>
          <button
            onClick={() => { setShowModal(true); setAddError(null); setForm(emptyForm); }}
            className="text-sm px-4 py-2 rounded-xl font-semibold transition"
            style={{ background: 'linear-gradient(135deg, #f5a623, #ffd166)', color: '#040a18' }}
          >
            + إضافة باقة
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(245,166,35,0.2)', borderTopColor: '#f5a623' }} />
          </div>
        ) : packages.length === 0 ? (
          <p className="text-center py-16" style={{ color: DK.dimTxt }}>لا توجد باقات بعد.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <div key={pkg.id} style={{
                ...DK.card,
                borderRadius: '16px',
                padding: '20px',
                opacity: pkg.is_active ? 1 : 0.6,
              }}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-white text-base">{pkg.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={pkg.is_active
                      ? { background: 'rgba(52,211,153,0.12)', color: '#34d399' }
                      : { background: 'rgba(255,255,255,0.05)', color: DK.dimTxt }}>
                    {pkg.is_active ? 'نشط' : 'معطّل'}
                  </span>
                </div>

                {pkg.description && (
                  <p className="text-sm mb-3 line-clamp-2" style={{ color: DK.dimTxt }}>{pkg.description}</p>
                )}

                <div className="flex items-center gap-6 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold" style={{ color: DK.gold }} dir="ltr">
                      {Number(pkg.price).toFixed(2)}
                    </p>
                    <p className="text-xs" style={{ color: DK.dimTxt }}>السعر</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold" style={{ color: '#60a5fa' }}>{pkg.duration_days}</p>
                    <p className="text-xs" style={{ color: DK.dimTxt }}>يوم</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleToggle(pkg.id)} disabled={toggling === pkg.id}
                    className="flex-1 text-xs py-1.5 rounded-lg transition font-medium disabled:opacity-50"
                    style={pkg.is_active
                      ? { background: 'rgba(239,68,68,0.1)', color: '#f87171' }
                      : { background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>
                    {toggling === pkg.id ? '...' : pkg.is_active ? 'تعطيل' : 'تفعيل'}
                  </button>
                  <button onClick={() => handleDelete(pkg.id)} disabled={deleting === pkg.id}
                    className="flex-1 text-xs py-1.5 rounded-lg transition disabled:opacity-50"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                    {deleting === pkg.id ? '...' : 'حذف'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Package Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(4,10,24,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md p-6 rounded-2xl" style={{ background: '#070e22', border: '1px solid rgba(245,166,35,0.15)' }}>
            <h3 className="text-lg font-semibold mb-4 text-white">إضافة باقة اشتراك</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-sm mb-1" style={{ color: DK.dimTxt }}>اسم الباقة</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="مثال: الباقة الشهرية" required autoFocus
                  onFocus={() => setFocusedInput('name')} onBlur={() => setFocusedInput(null)}
                  style={inputStyle('name')} />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: DK.dimTxt }}>الوصف (اختياري)</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="ما تشمله الباقة..." rows={2}
                  onFocus={() => setFocusedInput('desc')} onBlur={() => setFocusedInput(null)}
                  style={{ ...inputStyle('desc'), resize: 'none' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1" style={{ color: DK.dimTxt }}>السعر</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    min={0} step={0.01} required dir="ltr"
                    onFocus={() => setFocusedInput('price')} onBlur={() => setFocusedInput(null)}
                    style={inputStyle('price')} />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: DK.dimTxt }}>المدة (أيام)</label>
                  <input type="number" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: Number(e.target.value) })}
                    min={1} required dir="ltr"
                    onFocus={() => setFocusedInput('days')} onBlur={() => setFocusedInput(null)}
                    style={inputStyle('days')} />
                </div>
              </div>
              {addError && <p className="text-sm px-3 py-2 rounded-lg" style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)' }}>{addError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={addLoading}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #f5a623, #ffd166)', color: '#040a18' }}>
                  {addLoading ? 'جاري الإضافة...' : 'إضافة'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-xl text-sm"
                  style={{ background: 'rgba(255,255,255,0.05)', color: DK.dimTxt }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
