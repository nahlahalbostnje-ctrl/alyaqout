import { useEffect, useState, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchPackages,
  addPackage,
  updatePackage,
  togglePackage,
  deletePackage,
  type Package,
} from '../features/admin/packagesSlice';
import { fetchSubjects } from '../features/admin/subjectsSlice';
import { fetchCourses } from '../features/admin/coursesSlice';
import AdminLayout from '../components/AdminLayout';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { useCurrency } from '../hooks/useCurrency';

const DK = {
  gold:'#C59341', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', red:'#EF4444', blue:'#3B82F6', orange:'#F59E0B', purple:'#8B5CF6',
};
const card = (e: React.CSSProperties = {}): React.CSSProperties => ({
  background:'#FFFFFF', borderRadius:16, padding:20,
  boxShadow:'0 2px 16px rgba(0,0,0,0.06)', border:'1px solid #EDE3CE', ...e,
});
const btn = (v:'gold'|'outline'|'danger'='gold'): React.CSSProperties => ({
  padding:'9px 20px', borderRadius:12, border: v==='outline'?'1px solid #EDE3CE':'none',
  background: v==='gold'?'#C59341': v==='danger'?'#EF4444':'#FFFFFF',
  color: v==='outline'?'#1B2038':'#fff', fontWeight:700, fontSize:13, cursor:'pointer',
  fontFamily:"'Cairo',sans-serif",
});
const inp = (focused=false): React.CSSProperties => ({
  background:'#FFFFFF', border:`1.5px solid ${focused?'#C59341':'#EDE3CE'}`,
  color:'#1B2038', borderRadius:12, padding:'10px 14px', fontSize:13,
  width:'100%', outline:'none', fontFamily:"'Cairo',sans-serif",
});

function Modal({ title, onClose, children }: { title:string; onClose:()=>void; children:ReactNode }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>
      <div style={{background:'#fff',borderRadius:20,padding:28,width:560,maxWidth:'95vw',maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <h2 style={{color:'#1B2038',fontWeight:900,fontSize:17,margin:0}}>{title}</h2>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:8,border:'1px solid #EDE3CE',background:'transparent',cursor:'pointer',fontSize:16,color:'#6B7280'}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Toggle({ on, onToggle, loading=false }: { on:boolean; onToggle:()=>void; loading?:boolean }) {
  return (
    <div onClick={!loading?onToggle:undefined} style={{width:42,height:24,borderRadius:12,background:on?'#10B981':'rgba(0,0,0,0.15)',position:'relative',cursor:loading?'wait':'pointer',transition:'background 0.2s',flexShrink:0}}>
      <div style={{width:18,height:18,borderRadius:'50%',background:'#fff',position:'absolute',top:3,right:on?20:4,transition:'right 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.2)'}}/>
    </div>
  );
}

function toggleId(list: number[], id: number): number[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

const emptyForm = {
  name: '', description: '', price: 0, duration_days: 30, sort_order: 0,
  subject_ids: [] as number[], course_ids: [] as number[],
};

export default function PackagesPage() {
  const dispatch = useAppDispatch();
  const { currency, withLabel } = useCurrency();
  const { list: packages, loading } = useAppSelector((s) => s.packages);
  const subjects = useAppSelector((s) => s.subjects.list);
  const courses = useAppSelector((s) => s.courses.list);

  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState<Package | null>(null);
  const [form, setForm]             = useState(emptyForm);
  const [addError, setAddError]     = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [toggling, setToggling]     = useState<number | null>(null);
  const [deleting, setDeleting]     = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: number; label: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [focused, setFocused]       = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchPackages());
    dispatch(fetchSubjects());
    dispatch(fetchCourses(null));
  }, [dispatch]);

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setAddError(null);
    setShowModal(true);
  };

  const openEdit = (pkg: Package) => {
    setEditTarget(pkg);
    setForm({
      name: pkg.name,
      description: pkg.description ?? '',
      price: Number(pkg.price),
      duration_days: pkg.duration_days,
      sort_order: pkg.sort_order,
      subject_ids: pkg.subject_ids ?? pkg.subjects?.map((s) => s.id) ?? [],
      course_ids: pkg.course_ids ?? pkg.courses?.map((c) => c.id) ?? [],
    });
    setAddError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setForm(emptyForm);
    setAddError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    const payload = {
      name: form.name,
      description: form.description,
      price: form.price,
      duration_days: form.duration_days,
      sort_order: form.sort_order,
      subject_ids: form.subject_ids,
      course_ids: form.course_ids,
    };
    const result = editTarget
      ? await dispatch(updatePackage({ id: editTarget.id, ...payload }))
      : await dispatch(addPackage(payload));
    setAddLoading(false);
    if (
      (editTarget && updatePackage.fulfilled.match(result)) ||
      (!editTarget && addPackage.fulfilled.match(result))
    ) {
      closeModal();
    } else {
      setAddError(result.payload as string);
    }
  };

  const handleToggle = async (id: number) => {
    setToggling(id);
    await dispatch(togglePackage(id));
    setToggling(null);
  };

  const askDelete = (id: number, label: string) => {
    setDeleteError(null);
    setPendingDelete({ id, label });
  };

  const confirmPendingDelete = async () => {
    if (!pendingDelete) return;
    setDeleteBusy(true);
    setDeleteError(null);
    setDeleting(pendingDelete.id);
    try {
      await dispatch(deletePackage(pendingDelete.id));
      setPendingDelete(null);
    } catch {
      setDeleteError('تعذّر حذف الباقة');
    } finally {
      setDeleting(null);
      setDeleteBusy(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ fontFamily:"'Cairo',sans-serif", background: DK.bg, minHeight:'100vh', padding:24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:4, height:28, borderRadius:4, background: DK.goldGrad }} />
            <div>
              <h1 style={{ margin:0, fontSize:22, fontWeight:900, color: DK.text }}>الباقات</h1>
              <p style={{ margin:0, fontSize:12, color: DK.sub }}>حزمة بسعر واحد = مواد و/أو دورات محددة</p>
            </div>
          </div>
          <button onClick={openAdd} style={{ ...btn('gold'), display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:16, fontWeight:400 }}>+</span> إضافة باقة
          </button>
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:80 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', border:`3px solid rgba(197,147,65,0.15)`, borderTopColor: DK.gold, animation:'spin 0.8s linear infinite' }} />
          </div>
        ) : packages.length === 0 ? (
          <p style={{ textAlign:'center', padding:60, color: DK.sub, fontSize:14 }}>لا توجد باقات بعد.</p>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:20 }}>
            {packages.map((pkg) => {
              const active = !!pkg.is_active;
              const subjectCount = pkg.subjects?.length ?? pkg.subject_ids?.length ?? 0;
              const courseCount = pkg.courses?.length ?? pkg.course_ids?.length ?? 0;
              return (
                <div key={pkg.id} style={{
                  ...card({ padding:24 }),
                  border: active ? '2px solid #C59341' : '1px solid #EDE3CE',
                  boxShadow: active ? '0 0 0 4px rgba(197,147,65,0.1), 0 2px 16px rgba(0,0,0,0.06)' : DK.shadow,
                  opacity: active ? 1 : 0.65,
                }}>
                  <div style={{ textAlign:'center', marginBottom:16 }}>
                    <div style={{ display:'inline-block', background: DK.goldGrad, borderRadius:16, padding:'12px 24px', marginBottom:8 }}>
                      <span style={{ fontSize:32, fontWeight:900, color:'#fff', lineHeight:1 }} dir="ltr">
                        {Number(pkg.price).toFixed(2)}
                      </span>
                      <span style={{ fontSize:13, color:'rgba(255,255,255,0.85)', marginRight:4, fontWeight:600 }}>{currency ? `${currency}` : ''}</span>
                    </div>
                  </div>
                  <h3 style={{ margin:'0 0 8px', fontSize:18, fontWeight:900, color: DK.text, textAlign:'center' }}>{pkg.name}</h3>
                  {pkg.description && (
                    <p style={{ margin:'0 0 12px', fontSize:13, color: DK.sub, textAlign:'center', lineHeight:1.6 }}>{pkg.description}</p>
                  )}
                  <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:14, flexWrap:'wrap' }}>
                    <span style={{ background:'rgba(197,147,65,0.1)', color: DK.gold, borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:700 }}>
                      {pkg.duration_days} يوم
                    </span>
                    <span style={{ background:'rgba(59,130,246,0.1)', color: DK.blue, borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:700 }}>
                      {subjectCount} مادة
                    </span>
                    <span style={{ background:'rgba(139,92,246,0.1)', color: DK.purple, borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:700 }}>
                      {courseCount} دورة
                    </span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <Toggle on={active} onToggle={() => handleToggle(pkg.id)} loading={toggling === pkg.id} />
                      <span style={{ fontSize:12, color: active ? DK.green : DK.dim, fontWeight:700 }}>
                        {active ? 'نشط' : 'معطّل'}
                      </span>
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => openEdit(pkg)} style={{ padding:'6px 12px', borderRadius:10, border:'1px solid #EDE3CE', background:'#fff', color: DK.gold, fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                        تعديل
                      </button>
                      <button onClick={() => askDelete(pkg.id, pkg.name)} disabled={deleting === pkg.id}
                        style={{ padding:'6px 14px', borderRadius:10, border:'none', background: 'rgba(239,68,68,0.1)', color:'#EF4444', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:"'Cairo',sans-serif", opacity: deleting === pkg.id ? 0.5 : 1 }}>
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showModal && (
          <Modal title={editTarget ? `تعديل ${editTarget.name}` : 'إضافة باقة اشتراك'} onClose={closeModal}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>اسم الباقة</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="مثال: باقة الصف السادس الشاملة" required autoFocus
                  style={inp(focused==='name')}
                  onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} />
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>الوصف (اختياري)</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="ما تشمله الباقة..." rows={2}
                  style={{ ...inp(focused==='desc'), resize:'none' }}
                  onFocus={() => setFocused('desc')} onBlur={() => setFocused(null)} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:12, marginBottom:14 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>{withLabel('السعر')}</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})}
                    min={0} step={0.01} required dir="ltr" style={inp()} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>المدة (أيام)</label>
                  <input type="number" value={form.duration_days} onChange={e => setForm({...form, duration_days: Number(e.target.value)})}
                    min={1} required dir="ltr" style={inp()} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:6 }}>الترتيب</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: Number(e.target.value)})}
                    min={0} dir="ltr" style={inp()} />
                </div>
              </div>

              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:8 }}>المواد المشمولة</label>
                <div style={{ maxHeight:140, overflowY:'auto', border:`1px solid ${DK.border}`, borderRadius:12, padding:10, display:'flex', flexDirection:'column', gap:6 }}>
                  {subjects.length === 0 ? (
                    <p style={{ color: DK.dim, fontSize:12, margin:0 }}>لا توجد مواد — أضف مواد أولاً.</p>
                  ) : subjects.map((s) => (
                    <label key={s.id} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color: DK.text }}>
                      <input type="checkbox" checked={form.subject_ids.includes(s.id)}
                        onChange={() => setForm({ ...form, subject_ids: toggleId(form.subject_ids, s.id) })} />
                      {s.name}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:20 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:700, color: DK.sub, marginBottom:8 }}>دورات محددة (اختياري)</label>
                <div style={{ maxHeight:140, overflowY:'auto', border:`1px solid ${DK.border}`, borderRadius:12, padding:10, display:'flex', flexDirection:'column', gap:6 }}>
                  {courses.length === 0 ? (
                    <p style={{ color: DK.dim, fontSize:12, margin:0 }}>لا توجد دورات بعد.</p>
                  ) : courses.map((c) => (
                    <label key={c.id} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color: DK.text }}>
                      <input type="checkbox" checked={form.course_ids.includes(c.id)}
                        onChange={() => setForm({ ...form, course_ids: toggleId(form.course_ids, c.id) })} />
                      {c.title}
                    </label>
                  ))}
                </div>
              </div>

              {addError && (
                <p style={{ background:'rgba(239,68,68,0.08)', color:'#EF4444', borderRadius:10, padding:'10px 14px', fontSize:13, marginBottom:14 }}>{addError}</p>
              )}
              <div style={{ display:'flex', gap:10 }}>
                <button type="submit" disabled={addLoading} style={{ ...btn('gold'), flex:1, opacity: addLoading ? 0.7 : 1 }}>
                  {addLoading ? 'جارٍ الحفظ...' : (editTarget ? 'حفظ التعديلات' : 'إضافة')}
                </button>
                <button type="button" onClick={closeModal} style={{ ...btn('outline'), flex:1 }}>إلغاء</button>
              </div>
            </form>
          </Modal>
        )}

        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <ConfirmDeleteModal
          open={!!pendingDelete}
          itemLabel={pendingDelete?.label}
          busy={deleteBusy}
          error={deleteError}
          onConfirm={() => void confirmPendingDelete()}
          onCancel={() => { if (!deleteBusy) { setPendingDelete(null); setDeleteError(null); } }}
        />
      </div>
    </AdminLayout>
  );
}
