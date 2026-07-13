import { useState } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

const ENDPOINTS = [
  {method:'GET',  path:'/api/v1/branches',      desc:'جلب قائمة الأفرع'},
  {method:'POST', path:'/api/v1/branches',      desc:'إنشاء فرع جديد'},
  {method:'GET',  path:'/api/v1/users',         desc:'جلب المستخدمين مع فلترة'},
  {method:'GET',  path:'/api/v1/analytics',     desc:'بيانات التحليلات'},
  {method:'POST', path:'/api/v1/content/approve',desc:'اعتماد قطعة محتوى'},
  {method:'GET',  path:'/api/v1/reports/{type}',desc:'توليد وجلب التقارير'},
];

const METHOD_COLOR = {GET:C.green,POST:C.blue,PUT:C.orange,DELETE:C.red};

function CodeBlock({code,lang='json'}:{code:string;lang?:string}) {
  const [copied,setCopied]=useState(false);
  const copy=()=>{navigator.clipboard.writeText(code).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2000);};
  return (
    <div style={{position:'relative',borderRadius:12,overflow:'hidden',fontFamily:'monospace'}}>
      <div style={{background:'#1E1E2E',padding:'10px 14px 6px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{color:'#89B4FA',fontSize:11}}>{lang}</span>
        <button onClick={copy} style={{padding:'4px 12px',borderRadius:7,border:'none',background:copied?'rgba(22,163,74,0.3)':'rgba(255,255,255,0.1)',color:copied?'#86EFAC':'#CDD6F4',fontSize:11,cursor:'pointer',fontFamily:'Cairo,sans-serif'}}>
          {copied?'✓ تم النسخ':'📋 نسخ'}
        </button>
      </div>
      <pre style={{background:'#11111B',color:'#CDD6F4',padding:'14px',margin:0,fontSize:12,overflowX:'auto',lineHeight:1.6,whiteSpace:'pre-wrap'}}>{code}</pre>
    </div>
  );
}

export default function SADevCenterPage() {
  const [tab, setTab] = useState<'keys'|'webhooks'|'docs'|'sdk'>('keys');

  return (
    <SuperAdminShell>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div>
          <h1 style={{color:C.text,fontWeight:900,fontSize:20}}>مركز التطوير والمطورين</h1>
          <p style={{color:C.sub,fontSize:12,marginTop:2}}>إدارة مفاتيح API والـ Webhooks وتوثيق المطورين</p>
        </div>
        <div style={{display:'flex',gap:8,padding:'3px',borderRadius:12,background:C.bg,border:`1px solid ${C.border}`}}>
          {(['keys','webhooks','docs','sdk'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:'8px 18px',borderRadius:10,border:'none',cursor:'pointer',fontSize:12.5,fontWeight:700,background:tab===t?C.goldGrad:'transparent',color:tab===t?'#1B2038':C.sub,transition:'all 0.15s'}}>
              {t==='keys'?'🔑 مفاتيح API':t==='webhooks'?'🔗 Webhooks':t==='docs'?'📖 التوثيق':'📦 SDK'}
            </button>
          ))}
        </div>
      </div>

      {/* API Keys Tab */}
      {tab==='keys'&&(
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:10}}>
            {[
              {label:'إجمالي الطلبات اليوم',value:'—',  icon:'📡',color:C.blue},
              {label:'معدل النجاح',           value:'—', icon:'✅',color:C.green},
              {label:'متوسط وقت الاستجابة',  value:'—',icon:'⚡',color:C.orange},
              {label:'طلبات فاشلة',           value:'—',    icon:'❌',color:C.red},
            ].map((s,i)=>(
              <div key={i} style={card({padding:'14px',display:'flex',alignItems:'center',gap:10})}>
                <div style={{width:40,height:40,borderRadius:12,background:`${s.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{s.icon}</div>
                <div><p style={{color:C.text,fontWeight:900,fontSize:18}}>{s.value}</p><p style={{color:C.sub,fontSize:11}}>{s.label}</p></div>
              </div>
            ))}
          </div>
          <div style={card()}>
            <p style={{ textAlign:'center', color:'#6B7280', padding:40 }}>لا توجد مفاتيح API حالياً.</p>
          </div>
        </div>
      )}

      {/* Webhooks Tab */}
      {tab==='webhooks'&&(
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'flex',justifyContent:'flex-end'}}>
            <button disabled title="غير متاح بعد" style={{padding:'9px 18px',borderRadius:12,background:C.goldGrad,color:'#1B2038',fontWeight:800,fontSize:13,border:'none',cursor:'not-allowed',opacity:0.55}}>+ إضافة Webhook</button>
          </div>
          <div style={card()}>
            <p style={{ textAlign:'center', color:'#6B7280', padding:40 }}>لا توجد Webhooks حالياً.</p>
          </div>
        </div>
      )}

      {/* Docs Tab */}
      {tab==='docs'&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:14}}>
          <div style={card({padding:'12px 8px'})}>
            <p style={{color:C.text,fontWeight:700,fontSize:13,padding:'6px 10px',marginBottom:8}}>نقاط النهاية (Endpoints)</p>
            {ENDPOINTS.map((ep,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:10,cursor:'pointer',marginBottom:3}}>
                <span style={{padding:'2px 7px',borderRadius:6,fontSize:10,fontWeight:800,background:`${(METHOD_COLOR as Record<string,string>)[ep.method]}18`,color:(METHOD_COLOR as Record<string,string>)[ep.method],fontFamily:'monospace',flexShrink:0}}>{ep.method}</span>
                <span style={{color:C.sub,fontSize:11,fontFamily:'monospace',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ep.path}</span>
              </div>
            ))}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div style={card()}>
              <p style={{color:C.text,fontWeight:800,fontSize:14,marginBottom:12}}>مثال: جلب قائمة الأفرع</p>
              <CodeBlock lang="HTTP Request" code={`GET /api/v1/branches HTTP/1.1
Host: api.yaqoot.sa
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json`}/>
              <div style={{marginTop:14}}>
                <p style={{color:C.sub,fontSize:12,marginBottom:8}}>نموذج الاستجابة (200 OK)</p>
                <CodeBlock lang="JSON Response" code={`{
  "success": true,
  "data": {
    "branches": [],
    "pagination": {
      "total": 0,
      "per_page": 15,
      "current_page": 1
    }
  }
}`}/>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SDK Tab */}
      {tab==='sdk'&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:14}}>
          {[
            {lang:'JavaScript / Node.js', icon:'🟨', install:'npm install @yaqoot/sdk',usage:`import { YaqootClient } from '@yaqoot/sdk';

const client = new YaqootClient({
  apiKey: process.env.YAQOOT_API_KEY
});

const branches = await client.branches.list({
  status: 'active'
});`},
            {lang:'Python', icon:'🐍', install:'pip install yaqoot-sdk',usage:`from yaqoot import YaqootClient

client = YaqootClient(
    api_key=os.environ['YAQOOT_API_KEY']
)

branches = client.branches.list(
    status='active'
)`},
          ].map((sdk,i)=>(
            <div key={i} style={card()}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
                <span style={{fontSize:28}}>{sdk.icon}</span>
                <p style={{color:C.text,fontWeight:800,fontSize:15}}>{sdk.lang}</p>
              </div>
              <p style={{color:C.sub,fontSize:12,marginBottom:8}}>التثبيت</p>
              <CodeBlock lang="Terminal" code={sdk.install}/>
              <p style={{color:C.sub,fontSize:12,margin:'12px 0 8px'}}>مثال الاستخدام</p>
              <CodeBlock lang={sdk.lang} code={sdk.usage}/>
            </div>
          ))}
        </div>
      )}
    </SuperAdminShell>
  );
}
