import { useEffect, useState } from 'react';
import ParentLayout from '../components/ParentLayout';
import api from '../services/axios';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const C = {
  gold:'#C59341', goldG:'linear-gradient(135deg,#C59341,#D4A65A)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
  green:'#10B981', red:'#EF4444', blue:'#3B82F6',
  orange:'#F59E0B', purple:'#8B5CF6',
};
const card = (e:React.CSSProperties={}):React.CSSProperties=>({background:C.card,borderRadius:16,padding:20,boxShadow:C.shadow,border:`1px solid ${C.border}`,...e});
const inp = ():React.CSSProperties=>({background:C.bg,border:`1.5px solid ${C.border}`,color:C.text,borderRadius:12,padding:'9px 14px',fontSize:13,width:'100%',outline:'none',fontFamily:"'Cairo',sans-serif",boxSizing:'border-box'});

const PRIORITY_COLOR:Record<string,string> = { high:C.red, medium:C.orange, low:C.green };
const PRIORITY_LABEL:Record<string,string> = { high:'عالي', medium:'متوسط', low:'منخفض' };
const STATUS_LABEL:Record<string,string>   = { pending:'قيد الانتظار', in_progress:'جارٍ', done:'مكتمل' };
const STATUS_COLOR:Record<string,string>   = { pending:C.orange, in_progress:C.blue, done:C.green };
const TYPE_OPTS = ['تذكير أبني','موعد مدرسي','ملاحظة معلم','متابعة واجب','نشاط عائلي','أخرى'];

interface Item { id:number; title:string; description?:string; type?:string; priority:string; status:string; due_date?:string; }
const EMPTY:Omit<Item,'id'> = { title:'', description:'', type:'تذكير أبني', priority:'medium', status:'pending', due_date:'' };

export default function ParentPersonalItemsPage() {
  const [items,   setItems]   = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState<Item|null>(null);
  const [form,    setForm]    = useState<Omit<Item,'id'>>(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [filter,  setFilter]  = useState('الكل');

  const load = () => { setLoading(true); api.get('/parent/my-items').then(r=>setItems(r.data.items||[])).finally(()=>setLoading(false)); };
  useEffect(load,[]);

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (it:Item) => { setEditing(it); setForm({title:it.title,description:it.description||'',type:it.type||TYPE_OPTS[0],priority:it.priority,status:it.status,due_date:it.due_date||''}); setModal(true); };

  const save = async () => {
    if(!form.title.trim()) return;
    setSaving(true);
    try {
      if(editing) await api.put(`/parent/my-items/${editing.id}`, form);
      else        await api.post('/parent/my-items', form);
      setModal(false); load();
    } finally { setSaving(false); }
  };

  const [pendingDelete, setPendingDelete] = useState<{ id: number; label: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const askDelete = (id: number, label: string) => {
    setDeleteError(null);
    setPendingDelete({ id, label });
  };

  const confirmPendingDelete = async () => {
    if (!pendingDelete) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await api.delete(`/parent/my-items/${pendingDelete.id}`);
      setPendingDelete(null);
      load();
    } catch {
      setDeleteError('فشل الحذف');
    } finally {
      setDeleteBusy(false);
    }
  };

  const visible = filter==='الكل' ? items : items.filter(i=>STATUS_LABEL[i.status]===filter||PRIORITY_LABEL[i.priority]===filter);
  const done  = items.filter(i=>i.status==='done').length;
  const pend  = items.filter(i=>i.status==='pending').length;
  const prog  = items.filter(i=>i.status==='in_progress').length;

  return (
    <ParentLayout>
      <div style={{padding:'28px 32px',fontFamily:"'Cairo',sans-serif",direction:'rtl'}}>

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
          <div>
            <h1 style={{color:C.text,fontWeight:900,fontSize:22,margin:0}}>ملاحظاتي ومتابعاتي</h1>
            <p style={{color:C.sub,fontSize:13,marginTop:4}}>قائمتك الشخصية لمتابعة أبنائك</p>
          </div>
          <button onClick={openAdd} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 22px',borderRadius:14,background:C.goldG,color:'#fff',fontWeight:800,fontSize:14,border:'none',cursor:'pointer',boxShadow:`0 4px 14px ${C.gold}40`}}>
            <span style={{fontSize:18}}>+</span> إضافة
          </button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:24}}>
          {[{l:'الكل',v:items.length,i:'📋',c:C.blue},{l:'انتظار',v:pend,i:'⏳',c:C.orange},{l:'جارية',v:prog,i:'🔄',c:C.purple},{l:'مكتملة',v:done,i:'✅',c:C.green}].map((s,i)=>(
            <div key={i} style={card({padding:'14px',display:'flex',alignItems:'center',gap:12})}>
              <div style={{width:40,height:40,borderRadius:12,background:`${s.c}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{s.i}</div>
              <div><p style={{color:C.text,fontWeight:900,fontSize:20,margin:0}}>{s.v}</p><p style={{color:C.sub,fontSize:11,margin:0}}>{s.l}</p></div>
            </div>
          ))}
        </div>

        <div style={card({marginBottom:18,padding:'10px 14px',display:'flex',gap:8,flexWrap:'wrap'})}>
          {['الكل','قيد الانتظار','جارٍ','مكتمل','عالي','متوسط','منخفض'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'5px 13px',borderRadius:20,fontSize:12,fontWeight:600,cursor:'pointer',background:filter===f?C.goldG:'transparent',color:filter===f?'#fff':C.sub,border:filter===f?'none':`1px solid ${C.border}`}}>{f}</button>
          ))}
        </div>

        {loading ? <div style={{textAlign:'center',padding:50,color:C.sub}}>⏳ جاري التحميل...</div>
        : visible.length===0 ? (
          <div style={card({textAlign:'center',padding:60})}>
            <div style={{fontSize:48,marginBottom:12}}>🏠</div>
            <p style={{color:C.sub,fontSize:15}}>لا توجد ملاحظات بعد — أضف أول تذكير!</p>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:14}}>
            {visible.map(it=>(
              <div key={it.id} style={card({padding:'18px',borderRight:`4px solid ${PRIORITY_COLOR[it.priority]||C.border}`})}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',gap:6,marginBottom:4}}>
                      <span style={{fontSize:11,color:C.sub}}>{it.type}</span>
                      <span style={{padding:'1px 8px',borderRadius:20,fontSize:11,fontWeight:700,background:`${PRIORITY_COLOR[it.priority]}18`,color:PRIORITY_COLOR[it.priority]}}>{PRIORITY_LABEL[it.priority]}</span>
                    </div>
                    <h3 style={{color:C.text,fontWeight:800,fontSize:14,margin:0}}>{it.title}</h3>
                  </div>
                  <div style={{display:'flex',gap:5,flexShrink:0,marginRight:8}}>
                    <button onClick={()=>openEdit(it)} style={{width:28,height:28,borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',cursor:'pointer',fontSize:12}}>✏️</button>
                    <button onClick={()=>askDelete(it.id, it.title)}   style={{width:28,height:28,borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',cursor:'pointer',fontSize:12}}>🗑️</button>
                  </div>
                </div>
                {it.description&&<p style={{color:C.sub,fontSize:12,marginBottom:10,lineHeight:1.5}}>{it.description}</p>}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:`${STATUS_COLOR[it.status]}15`,color:STATUS_COLOR[it.status]}}>{STATUS_LABEL[it.status]}</span>
                  {it.due_date&&<span style={{color:C.sub,fontSize:11}}>📅 {new Date(it.due_date).toLocaleDateString('ar-EG')}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setModal(false)}>
          <div style={card({width:480,maxWidth:'90vw',padding:28})} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:C.text,fontWeight:900,fontSize:18,margin:0}}>{editing?'تعديل':'إضافة جديدة'}</h2>
              <button onClick={()=>setModal(false)} style={{border:'none',background:'none',cursor:'pointer',fontSize:22,color:C.sub}}>×</button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div>
                <label style={{color:C.sub,fontSize:12,fontWeight:700,display:'block',marginBottom:6}}>العنوان *</label>
                <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="عنوان الملاحظة..." style={inp()} />
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12}}>
                <div>
                  <label style={{color:C.sub,fontSize:12,fontWeight:700,display:'block',marginBottom:6}}>النوع</label>
                  <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={inp()}>
                    {TYPE_OPTS.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{color:C.sub,fontSize:12,fontWeight:700,display:'block',marginBottom:6}}>الأولوية</label>
                  <select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))} style={inp()}>
                    <option value="high">عالي</option><option value="medium">متوسط</option><option value="low">منخفض</option>
                  </select>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12}}>
                <div>
                  <label style={{color:C.sub,fontSize:12,fontWeight:700,display:'block',marginBottom:6}}>الحالة</label>
                  <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} style={inp()}>
                    <option value="pending">قيد الانتظار</option><option value="in_progress">جارٍ</option><option value="done">مكتمل</option>
                  </select>
                </div>
                <div>
                  <label style={{color:C.sub,fontSize:12,fontWeight:700,display:'block',marginBottom:6}}>تاريخ الاستحقاق</label>
                  <input type="date" value={form.due_date} onChange={e=>setForm(f=>({...f,due_date:e.target.value}))} style={inp()} />
                </div>
              </div>
              <div>
                <label style={{color:C.sub,fontSize:12,fontWeight:700,display:'block',marginBottom:6}}>الوصف</label>
                <textarea rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="تفاصيل..." style={{...inp(),resize:'none'}} />
              </div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={save} disabled={saving} style={{flex:1,padding:'11px',borderRadius:12,background:C.goldG,color:'#fff',fontWeight:800,fontSize:14,border:'none',cursor:'pointer',opacity:saving?0.7:1}}>
                {saving?'جاري الحفظ...':editing?'حفظ':'إضافة'}
              </button>
              <button onClick={()=>setModal(false)} style={{flex:1,padding:'11px',borderRadius:12,background:C.bg,color:C.sub,fontWeight:600,fontSize:14,border:`1px solid ${C.border}`,cursor:'pointer'}}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDeleteModal
        open={!!pendingDelete}
        itemLabel={pendingDelete?.label}
        busy={deleteBusy}
        error={deleteError}
        onConfirm={() => void confirmPendingDelete()}
        onCancel={() => { if (!deleteBusy) { setPendingDelete(null); setDeleteError(null); } }}
      />
    </ParentLayout>
  );
}
