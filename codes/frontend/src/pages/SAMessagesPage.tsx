import { useEffect, useState } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchCountries } from '../features/countries/countriesSlice';
import api from '../services/axios';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

interface ConvRow {
  id: number; country: string; parent: string; teacher: string; student: string;
  messages_count: number; last_message_at: string | null;
}
interface ThreadMsg { id: number; body: string; sender: string; created_at: string; }

export default function SAMessagesPage() {
  const dispatch = useAppDispatch();
  const { list: countries } = useAppSelector((s) => s.countries);

  const [rows, setRows] = useState<ConvRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryId, setCountryId] = useState('');

  const [selected, setSelected] = useState<ConvRow | null>(null);
  const [thread, setThread] = useState<ThreadMsg[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);

  useEffect(() => { if (countries.length === 0) dispatch(fetchCountries()); }, [dispatch, countries.length]);

  useEffect(() => {
    setLoading(true);
    api.get('/super-admin/messages', { params: countryId ? { country_id: countryId } : {} })
      .then(({ data }) => setRows(data.data?.data ?? []))
      .finally(() => setLoading(false));
  }, [countryId]);

  const openThread = (row: ConvRow) => {
    setSelected(row);
    setThreadLoading(true);
    api.get(`/super-admin/messages/${row.id}`)
      .then(({ data }) => setThread(data.data?.messages ?? []))
      .finally(() => setThreadLoading(false));
  };

  return (
    <SuperAdminShell>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div>
          <h1 style={{ color:C.text, fontWeight:900, fontSize:20 }}>الرسائل 💬</h1>
          <p style={{ color:C.sub, fontSize:12, marginTop:2 }}>رؤية كاملة (قراءة فقط) لكل محادثات أولياء الأمور مع المعلمين، في كل دولة</p>
        </div>
      </div>

      {/* Filter */}
      <div style={card({ marginBottom:14, padding:'12px 16px', display:'flex', alignItems:'center', gap:12 })}>
        <select value={countryId} onChange={e => setCountryId(e.target.value)} style={{ padding:'8px 14px', borderRadius:10, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:12, outline:'none', cursor:'pointer' }}>
          <option value="">كل الدول</option>
          {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <p style={{ color:C.sub, fontSize:12 }}>{rows.length} محادثة</p>
      </div>

      <div style={{ display:'flex', gap:14 }}>
        {/* Conversations table */}
        <div style={{ ...card({ padding:0, overflowX:'auto', flex: selected ? '0 0 58%' : 1 }) }}>
          {loading ? (
            <p style={{ color:C.dim, fontSize:13, textAlign:'center', padding:'30px 0' }}>جارٍ التحميل...</p>
          ) : rows.length === 0 ? (
            <p style={{ color:C.dim, fontSize:13, textAlign:'center', padding:'30px 0' }}>لا توجد محادثات بعد</p>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12, minWidth:520 }}>
              <thead>
                <tr style={{ background:'rgba(0,0,0,0.04)' }}>
                  {['الدولة','ولي الأمر','المعلم','الطالب','عدد الرسائل','آخر رسالة'].map(h => (
                    <th key={h} style={{ padding:'10px 12px', textAlign:'right', color:C.sub, fontSize:11, fontWeight:700, borderBottom:`1px solid ${C.border}`, whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} onClick={() => openThread(r)}
                    style={{ borderBottom:`1px solid ${C.border}`, background: selected?.id === r.id ? C.goldBg : (i%2===0?'#FAFAFA':'#FFFFFF'), cursor:'pointer' }}>
                    <td style={{ padding:'9px 12px', color:C.sub }}>{r.country}</td>
                    <td style={{ padding:'9px 12px', color:C.text, fontWeight:700, whiteSpace:'nowrap' }}>{r.parent}</td>
                    <td style={{ padding:'9px 12px', color:C.text, whiteSpace:'nowrap' }}>{r.teacher}</td>
                    <td style={{ padding:'9px 12px', color:C.sub, whiteSpace:'nowrap' }}>{r.student}</td>
                    <td style={{ padding:'9px 12px', color:C.gold, fontWeight:700 }}>{r.messages_count}</td>
                    <td style={{ padding:'9px 12px', color:C.dim, fontFamily:'monospace', fontSize:10.5, whiteSpace:'nowrap' }}>{r.last_message_at ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Thread viewer */}
        {selected && (
          <div style={{ ...card({ flex:'0 0 40%', display:'flex', flexDirection:'column', padding:0, overflow:'hidden' }) }}>
            <div style={{ padding:'12px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <p style={{ color:C.text, fontWeight:700, fontSize:13 }}>{selected.parent} ↔ {selected.teacher}</p>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', color:C.dim, fontSize:14 }}>✕</button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'14px 16px', display:'flex', flexDirection:'column', gap:10, maxHeight:480 }}>
              {threadLoading ? (
                <p style={{ color:C.dim, fontSize:13, textAlign:'center' }}>جارٍ التحميل...</p>
              ) : thread.map(m => (
                <div key={m.id} style={{ background:C.bg, borderRadius:12, padding:'8px 12px' }}>
                  <p style={{ color:C.gold, fontWeight:700, fontSize:11, marginBottom:2 }}>{m.sender}</p>
                  <p style={{ color:C.text, fontSize:12.5, lineHeight:1.6 }}>{m.body}</p>
                  <p style={{ color:C.dim, fontSize:10, marginTop:3 }}>{m.created_at}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SuperAdminShell>
  );
}
