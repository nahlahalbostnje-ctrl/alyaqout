import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchStudentHomework, submitHomework } from '../features/student/examSlice';
import StudentLayout from '../components/StudentLayout';
import { useEncouragement } from '../components/EncouragementToast';

const C = {
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1535', navy2:'#1B2038',
  gold:'#C9952A', goldL:'#DDAD50', goldGrad:'linear-gradient(135deg,#C9952A,#DDAD50)',
  goldBg:'rgba(201,149,42,0.09)', goldBdr:'rgba(201,149,42,0.25)',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'rgba(0,0,0,0.07)',
  shadow:'0 2px 14px rgba(0,0,0,0.07)', red:'#EF4444',
};

const TABS = ['الجديدة', 'المنتهية'] as const;
type Tab = typeof TABS[number];

const MOCK_HW = [
  { id:1, subject:'الرياضيات',         desc:'حل تمارين الوحدة 3',                  due:'25/05/2026', status:'new' },
  { id:2, subject:'اللغة الإنجليزية',  desc:'كتابة فقرة عن هواياتك',               due:'26/05/2026', status:'new' },
  { id:3, subject:'العلوم',             desc:'مشروع دورة حياة النبات',             due:'27/05/2026', status:'new' },
];

const HW_COLORS: Record<string, { bg:string; color:string }> = {
  'الرياضيات':         { bg:'#EEF2FF', color:'#4F46E5' },
  'اللغة الإنجليزية': { bg:'#DBEAFE', color:'#2563EB' },
  'العلوم':            { bg:'#D1FAE5', color:'#059669' },
  'اللغة العربية':     { bg:'#FEF3C7', color:'#D97706' },
  'التربية الإسلامية':{ bg:'#FEE2E2', color:'#DC2626' },
};

export default function StudentHomeworkPage() {
  const dispatch  = useAppDispatch();
  const { homeworks, loading, submitting } = useAppSelector(s => s.studentExam);
  const [tab, setTab]     = useState<Tab>('الجديدة');
  const [active, setActive] = useState<number|null>(null);
  const [form, setForm]   = useState({ file_url:'', notes:'' });
  const [flash, setFlash] = useState<number|null>(null);
  const { show: celebrate, element: toastEl } = useEncouragement();

  useEffect(() => { dispatch(fetchStudentHomework()); }, [dispatch]);

  const handleSubmit = async (hwId: number) => {
    if (!form.file_url.trim()) return;
    await dispatch(submitHomework({ homeworkId: hwId, file_url: form.file_url, notes: form.notes }));
    setForm({ file_url:'', notes:'' }); setActive(null);
    setFlash(hwId); setTimeout(()=>setFlash(null), 2500);
    celebrate('homework_done');
  };

  const newHw   = homeworks.filter(h => !h.submitted);
  const doneHw  = homeworks.filter(h => h.submitted);
  const display = tab === 'الجديدة' ? (newHw.length  > 0 ? newHw  : MOCK_HW) : (doneHw.length > 0 ? doneHw : []);

  return (
    <StudentLayout>
    <div dir="rtl" style={{ fontFamily:"'Cairo',sans-serif" }}>

      {/* Page Header */}
      <div style={{ padding:'20px 16px 4px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
          <h1 style={{ color:C.text, fontWeight:900, fontSize:20, margin:0 }}>الواجبات 📚</h1>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:C.card, padding:'0 16px', borderBottom:`1px solid ${C.border}`, display:'flex', gap:4 }}>
        {TABS.map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{ padding:'12px 16px', border:'none', background:'none', cursor:'pointer', fontFamily:"'Cairo',sans-serif", fontSize:13, fontWeight:tab===t?700:500, color:tab===t?C.gold:C.sub, borderBottom:tab===t?`2.5px solid ${C.gold}`:'2.5px solid transparent', transition:'all 0.2s', display:'flex', alignItems:'center', gap:6 }}>
            {t}
            {t==='الجديدة' && (
              <span style={{ width:20, height:20, borderRadius:'50%', background:C.goldGrad, color:'#1B2038', fontSize:9, fontWeight:800, display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
                {newHw.length || 5}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div style={{ padding:'14px 16px' }}>
        {loading && <p style={{ color:C.dim, textAlign:'center', padding:'40px 0', fontSize:14 }}>جاري التحميل...</p>}
        {!loading && display.length === 0 && <p style={{ color:C.dim, textAlign:'center', padding:'40px 0', fontSize:14 }}>لا توجد واجبات</p>}
        {display.map((hw: any, i: number) => {
          const subj   = hw.subject ?? hw.subject_name ?? hw.title ?? 'واجب';
          const style  = HW_COLORS[Object.keys(HW_COLORS).find(k=>subj.includes(k.split(' ')[0]))??''] ?? { bg:'#EEF2FF', color:'#4F46E5' };
          const isOpen = active === (hw.id ?? i);
          const done   = flash === (hw.id ?? i);
          return (
            <div key={i} style={{ background:C.card, borderRadius:18, padding:'16px 18px', marginBottom:12, boxShadow:done?`0 4px 20px rgba(22,163,74,0.3)`:C.shadow, border:`1px solid ${done?'#16A34A':C.border}`, transition:'all 0.3s' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                <div style={{ width:50, height:50, borderRadius:14, background:style.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>📚</div>
                <div style={{ flex:1 }}>
                  <p style={{ color:C.navy2, fontWeight:800, fontSize:15, marginBottom:3 }}>{subj}</p>
                  <p style={{ color:C.sub, fontSize:12.5, marginBottom:3, lineHeight:1.4 }}>{hw.description ?? hw.desc}</p>
                  <p style={{ color:C.dim, fontSize:11.5 }}>آخر موعد: {hw.due_date ?? hw.due}</p>
                </div>
              </div>
              {isOpen && (
                <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${C.border}` }}>
                  {/* رفع صورة */}
                  <p style={{ color:C.sub, fontSize:12, fontWeight:600, marginBottom:8 }}>📎 إرفاق الإجابة</p>
                  <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                    <label style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px', borderRadius:12, border:`2px dashed ${C.gold}`, background:C.goldBg, cursor:'pointer', fontSize:13, color:C.gold, fontWeight:700, fontFamily:"'Cairo',sans-serif" }}>
                      📷 رفع صورة
                      <input type="file" accept="image/*" style={{ display:'none' }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = ev => setForm(p => ({ ...p, file_url: ev.target?.result as string }));
                          reader.readAsDataURL(file);
                        }} />
                    </label>
                    <span style={{ display:'flex', alignItems:'center', color:C.sub, fontSize:12 }}>أو</span>
                    <input
                      value={form.file_url.startsWith('data:') ? '' : form.file_url}
                      onChange={e=>setForm(p=>({...p,file_url:e.target.value}))}
                      placeholder="رابط الملف (URL)"
                      style={{ flex:2, border:`1.5px solid ${C.border}`, borderRadius:10, padding:'9px 12px', fontSize:13, color:C.text, background:C.bg, outline:'none', fontFamily:"'Cairo',sans-serif" }} />
                  </div>
                  {form.file_url.startsWith('data:image') && (
                    <div style={{ marginBottom:10, position:'relative' }}>
                      <img src={form.file_url} alt="preview" style={{ width:'100%', maxHeight:160, objectFit:'cover', borderRadius:10, border:`1px solid ${C.border}` }} />
                      <button onClick={() => setForm(p=>({...p,file_url:''}))}
                        style={{ position:'absolute', top:6, left:6, background:'rgba(0,0,0,0.5)', color:'#fff', border:'none', borderRadius:'50%', width:24, height:24, cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                    </div>
                  )}
                  <textarea
                    value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
                    rows={2} placeholder="ملاحظات للمعلم (اختياري)"
                    style={{ width:'100%', border:`1.5px solid ${C.border}`, borderRadius:10, padding:'9px 12px', fontSize:13, color:C.text, background:C.bg, outline:'none', fontFamily:"'Cairo',sans-serif", resize:'none', boxSizing:'border-box', marginBottom:10 }} />
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={()=>handleSubmit(hw.id??i)} disabled={submitting||!form.file_url.trim()} style={{ flex:1, padding:'10px', borderRadius:12, background:C.goldGrad, color:'#1B2038', fontWeight:700, fontSize:13, border:'none', cursor:'pointer', opacity:submitting||!form.file_url.trim()?0.6:1 }}>
                      {submitting?'جاري الإرسال...':'تسليم الواجب'}
                    </button>
                    <button onClick={()=>setActive(null)} style={{ padding:'10px 16px', borderRadius:12, background:C.bg, border:`1px solid ${C.border}`, color:C.sub, fontSize:13, cursor:'pointer' }}>إلغاء</button>
                  </div>
                </div>
              )}
              {!isOpen && (
                <button onClick={()=>setActive(hw.id??i)} style={{ width:'100%', marginTop:13, padding:'11px', borderRadius:13, background:C.goldGrad, color:'#1B2038', fontWeight:800, fontSize:13.5, border:'none', cursor:'pointer', boxShadow:'0 3px 12px rgba(201,149,42,0.35)' }}>
                  عرض الواجب
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Button */}
      <div style={{ padding:'0 16px 16px' }}>
        <button onClick={()=>setTab('المنتهية')} style={{ width:'100%', padding:'13px', borderRadius:14, background:C.card, border:`1.5px solid ${C.goldBdr}`, color:C.gold, fontWeight:700, fontSize:14, cursor:'pointer' }}>
          عرض كل الواجبات
        </button>
      </div>

      {toastEl}
    </div>
    </StudentLayout>
  );
}
