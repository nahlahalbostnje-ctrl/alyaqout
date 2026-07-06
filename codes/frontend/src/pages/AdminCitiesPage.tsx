import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAppSelector } from '../app/hooks';

const C = {
  gold:'#C59341', goldL:'#D4A65A', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.22)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', greenBg:'rgba(16,185,129,0.08)',
  red:'#EF4444', redBg:'rgba(239,68,68,0.08)',
};

interface City { id: number; name: string; is_active: boolean; created_at: string; }

const API = 'http://localhost:8000/api/admin/cities';

function authHeaders(token: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export default function AdminCitiesPage() {
  const token = useAppSelector(s => s.auth.token) ?? '';
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editCity, setEditCity] = useState<City | null>(null);
  const [formName, setFormName] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState('');

  const filtered = cities.filter(c => c.name.includes(search));

  async function fetchCities() {
    setLoading(true);
    try {
      const r = await fetch(API, { headers: authHeaders(token) });
      const j = await r.json();
      setCities(j.data ?? []);
    } catch {
      setError('فشل في تحميل المدن');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchCities(); }, []);

  function openAdd() { setEditCity(null); setFormName(''); setShowModal(true); }
  function openEdit(c: City) { setEditCity(c); setFormName(c.name); setShowModal(true); }

  async function handleSave() {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      const url = editCity ? `${API}/${editCity.id}` : API;
      const method = editCity ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: authHeaders(token), body: JSON.stringify({ name: formName.trim() }) });
      if (!r.ok) throw new Error();
      setShowModal(false);
      fetchCities();
    } catch {
      setError('فشل في حفظ المدينة');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(c: City) {
    try {
      await fetch(`${API}/${c.id}`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify({ is_active: !c.is_active }),
      });
      fetchCities();
    } catch {
      setError('فشل في تحديث الحالة');
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fetch(`${API}/${deleteId}`, { method: 'DELETE', headers: authHeaders(token) });
      setDeleteId(null);
      fetchCities();
    } catch {
      setError('فشل في حذف المدينة');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AdminLayout>
      <div style={{ padding:24, fontFamily:"'Cairo',sans-serif", direction:'rtl' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
              <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>إدارة المدن 🏙️</h1>
            </div>
            <p style={{ color:C.sub, fontSize:13, margin:0 }}>أضف وعدّل المدن الخاصة بدولتك — يستخدمها الطلاب عند التسجيل</p>
          </div>
          <button onClick={openAdd}
            style={{ padding:'10px 20px', borderRadius:12, background:C.goldGrad, color:'#fff', fontSize:14, fontWeight:700, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", boxShadow:'0 4px 14px rgba(197,147,65,0.35)' }}>
            + إضافة مدينة
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:20 }}>
          {[
            { label:'إجمالي المدن', value:cities.length, icon:'🏙️', color:C.gold, bg:C.goldBg },
            { label:'مدن مفعّلة', value:cities.filter(c=>c.is_active).length, icon:'✅', color:C.green, bg:C.greenBg },
            { label:'مدن معطّلة', value:cities.filter(c=>!c.is_active).length, icon:'⛔', color:C.red, bg:C.redBg },
          ].map((s,i) => (
            <div key={i} style={{ background:C.card, borderRadius:14, padding:'14px 18px', border:`1px solid ${C.border}`, boxShadow:C.shadow, display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:46, height:46, borderRadius:12, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{s.icon}</div>
              <div>
                <p style={{ color:s.color, fontWeight:900, fontSize:26, lineHeight:1 }}>{s.value}</p>
                <p style={{ color:C.sub, fontSize:11.5, marginTop:2 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom:16 }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 ابحث عن مدينة..."
            style={{ padding:'10px 16px', borderRadius:12, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"'Cairo',sans-serif", width:'100%', outline:'none', background:C.card, color:C.text, boxSizing:'border-box' }}
          />
        </div>

        {error && (
          <div style={{ background:C.redBg, border:`1px solid ${C.red}30`, borderRadius:10, padding:'10px 16px', color:C.red, fontSize:13, marginBottom:14 }}>
            {error}
          </div>
        )}

        {/* Table */}
        <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, boxShadow:C.shadow, overflowX:'auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 100px 120px 120px', minWidth:520, padding:'12px 20px', background:C.goldBg, borderBottom:`1px solid ${C.border}` }}>
            {['اسم المدينة','الحالة','تاريخ الإضافة','الإجراءات'].map((h,i) => (
              <span key={i} style={{ color:C.gold, fontSize:11, fontWeight:800, letterSpacing:0.5 }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign:'center', padding:40, color:C.dim, fontSize:14 }}>جارٍ التحميل...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:40, color:C.dim, fontSize:14 }}>
              <p style={{ fontSize:36, marginBottom:8 }}>🏙️</p>
              <p>{search ? 'لا توجد نتائج' : 'لا توجد مدن بعد — أضف أول مدينة!'}</p>
            </div>
          ) : filtered.map((city, idx) => (
            <div key={city.id} style={{ display:'grid', gridTemplateColumns:'1fr 100px 120px 120px', minWidth:520, padding:'14px 20px', borderBottom: idx < filtered.length-1 ? `1px solid ${C.border}` : 'none', alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:C.goldBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>🏙️</div>
                <span style={{ color:C.text, fontWeight:700, fontSize:14 }}>{city.name}</span>
              </div>
              <div>
                <button onClick={() => handleToggle(city)} style={{
                  padding:'4px 12px', borderRadius:8,
                  background: city.is_active ? C.greenBg : C.redBg,
                  border: `1px solid ${city.is_active ? C.green : C.red}30`,
                  color: city.is_active ? C.green : C.red,
                  fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif"
                }}>
                  {city.is_active ? 'مفعّل' : 'معطّل'}
                </button>
              </div>
              <span style={{ color:C.sub, fontSize:12 }}>{new Date(city.created_at).toLocaleDateString('ar-EG')}</span>
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={() => openEdit(city)} style={{ padding:'6px 12px', borderRadius:8, background:C.goldBg, border:`1px solid ${C.goldBdr}`, color:C.gold, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>تعديل</button>
                <button onClick={() => setDeleteId(city.id)} style={{ padding:'6px 12px', borderRadius:8, background:C.redBg, border:`1px solid ${C.red}30`, color:C.red, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>حذف</button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
            <div style={{ background:'#fff', borderRadius:20, padding:28, width:420, maxWidth:'92vw', fontFamily:"'Cairo',sans-serif", direction:'rtl', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
              <h3 style={{ color:C.text, fontWeight:800, fontSize:18, marginBottom:20 }}>
                {editCity ? '✏️ تعديل المدينة' : '🏙️ إضافة مدينة جديدة'}
              </h3>
              <label style={{ display:'block', color:C.sub, fontSize:12, fontWeight:600, marginBottom:6 }}>اسم المدينة</label>
              <input
                value={formName} onChange={e => setFormName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                placeholder="مثال: رام الله، نابلس، الخليل..."
                autoFocus
                style={{ width:'100%', padding:'11px 14px', borderRadius:12, border:`1px solid ${C.border}`, fontSize:14, fontFamily:"'Cairo',sans-serif", outline:'none', marginBottom:20, boxSizing:'border-box', color:C.text }}
              />
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={handleSave} disabled={saving || !formName.trim()} style={{ flex:1, padding:'11px', borderRadius:12, background:C.goldGrad, color:'#fff', fontSize:14, fontWeight:700, border:'none', cursor: saving || !formName.trim() ? 'not-allowed' : 'pointer', fontFamily:"'Cairo',sans-serif", opacity: saving || !formName.trim() ? 0.6 : 1 }}>
                  {saving ? 'جارٍ الحفظ...' : 'حفظ'}
                </button>
                <button onClick={() => setShowModal(false)} style={{ padding:'11px 20px', borderRadius:12, background:'#F3F4F6', color:C.sub, fontSize:14, fontWeight:700, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>إلغاء</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteId && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
            <div style={{ background:'#fff', borderRadius:20, padding:28, width:380, fontFamily:"'Cairo',sans-serif", direction:'rtl', textAlign:'center' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🗑️</div>
              <h3 style={{ color:C.text, fontWeight:800, fontSize:16, marginBottom:8 }}>تأكيد الحذف</h3>
              <p style={{ color:C.sub, fontSize:13, marginBottom:20 }}>هل أنت متأكد من حذف هذه المدينة؟ سيتأثر الطلاب المرتبطون بها.</p>
              <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
                <button onClick={handleDelete} disabled={deleting} style={{ padding:'10px 24px', borderRadius:12, background:C.red, color:'#fff', fontSize:13, fontWeight:700, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
                  {deleting ? 'جارٍ الحذف...' : 'حذف'}
                </button>
                <button onClick={() => setDeleteId(null)} style={{ padding:'10px 20px', borderRadius:12, background:'#F3F4F6', color:C.sub, fontSize:13, fontWeight:700, border:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>إلغاء</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
