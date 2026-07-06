import { useState } from 'react';
import SuperAdminShell, { C } from '../components/SuperAdminShell';

const card = (e={}) => ({ background:C.card, borderRadius:18, padding:'16px', boxShadow:C.shadow, border:`1px solid ${C.border}`, ...e } as React.CSSProperties);

const API_KEYS = [
  {name:'مفتاح الإنتاج',    key:'ya_live_sk_xK9mP2nQrTs4vW8zA1bD6eGjHuLo3cFiMpNyRk',env:'production',active:true,  created:'2026-01-15',requests:'1,284,500'},
  {name:'مفتاح الاختبار',   key:'ya_test_sk_aT7hB3mCpXnYq5vR8wE2jKoUiLsGfDz1MeNb4Q',env:'sandbox',    active:true,  created:'2026-01-15',requests:'48,200'},
  {name:'مفتاح الإدارة',    key:'ya_admin_sk_zW4kN8rPqD2tXoL6mY9vB1cHuAiFjGsReVbMn7T',env:'admin',      active:false, created:'2025-12-01',requests:'0'},
];

const WEBHOOKS = [
  {name:'إشعار الاشتراك الجديد',    url:'https://api.partner.sa/webhook/subscription', events:['subscription.created','subscription.renewed'],   status:'نشط',   lastPing:'منذ 2 دقيقة'},
  {name:'إشعار اعتماد المحتوى',      url:'https://cms.school.sa/webhook/content',       events:['content.approved','content.rejected'],            status:'نشط',   lastPing:'منذ 15 دقيقة'},
  {name:'إشعار التسجيل',             url:'https://crm.yaqoot.sa/webhook/user',          events:['user.registered','user.verified'],                status:'خطأ',   lastPing:'منذ ساعة'},
  {name:'إشعار الدفع',               url:'https://finance.yaqoot.sa/webhook/payment',   events:['payment.success','payment.failed'],               status:'نشط',   lastPing:'منذ 5 دقائق'},
];

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
  const [showKey, setShowKey] = useState<string|null>(null);

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
          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:10}}>
            {[
              {label:'إجمالي الطلبات اليوم',value:'8,420',  icon:'📡',color:C.blue},
              {label:'معدل النجاح',           value:'99.2%', icon:'✅',color:C.green},
              {label:'متوسط وقت الاستجابة',  value:'142 ms',icon:'⚡',color:C.orange},
              {label:'طلبات فاشلة',           value:'67',    icon:'❌',color:C.red},
            ].map((s,i)=>(
              <div key={i} style={card({padding:'14px',display:'flex',alignItems:'center',gap:10})}>
                <div style={{width:40,height:40,borderRadius:12,background:`${s.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{s.icon}</div>
                <div><p style={{color:C.text,fontWeight:900,fontSize:18}}>{s.value}</p><p style={{color:C.sub,fontSize:11}}>{s.label}</p></div>
              </div>
            ))}
          </div>

          {API_KEYS.map(ak=>(
            <div key={ak.name} style={card()}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                <div style={{width:42,height:42,borderRadius:13,background:ak.active?`${C.gold}18`:'rgba(0,0,0,0.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>🔑</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                    <p style={{color:C.text,fontWeight:800,fontSize:14}}>{ak.name}</p>
                    <span style={{padding:'2px 10px',borderRadius:20,fontSize:10,fontWeight:700,background:ak.active?'rgba(22,163,74,0.12)':'rgba(0,0,0,0.06)',color:ak.active?C.green:C.dim}}>{ak.active?'نشط':'معطّل'}</span>
                    <span style={{padding:'2px 10px',borderRadius:20,fontSize:10,fontWeight:700,background:ak.env==='production'?'rgba(239,68,68,0.1)':ak.env==='sandbox'?'rgba(37,99,235,0.1)':'rgba(124,58,237,0.1)',color:ak.env==='production'?C.red:ak.env==='sandbox'?C.blue:C.purple}}>{ak.env}</span>
                  </div>
                  <p style={{color:C.sub,fontSize:11}}>{ak.requests} طلب منذ {ak.created}</p>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>setShowKey(showKey===ak.key?null:ak.key)} style={{padding:'7px 14px',borderRadius:10,border:`1px solid ${C.border}`,background:'transparent',color:C.sub,fontSize:12,cursor:'pointer'}}>
                    {showKey===ak.key?'🙈 إخفاء':'👁️ عرض'}
                  </button>
                  <button onClick={()=>alert('تجديد مفاتيح API قيد التطوير — منصة API العامة للمطورين لم تُفعَّل بعد.')} style={{padding:'7px 14px',borderRadius:10,border:'none',background:C.goldBg,color:C.gold,fontSize:12,fontWeight:700,cursor:'pointer'}}>🔄 تجديد</button>
                </div>
              </div>
              <CodeBlock code={showKey===ak.key?ak.key:'•'.repeat(48)} lang="API Key"/>
            </div>
          ))}
        </div>
      )}

      {/* Webhooks Tab */}
      {tab==='webhooks'&&(
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'flex',justifyContent:'flex-end'}}>
            <button onClick={()=>alert('نظام Webhooks قيد التطوير — لا توجد بنية بث أحداث فعلية بالباك اند بعد.')} style={{padding:'9px 18px',borderRadius:12,background:C.goldGrad,color:'#1B2038',fontWeight:800,fontSize:13,border:'none',cursor:'pointer'}}>+ إضافة Webhook</button>
          </div>
          {WEBHOOKS.map((wh,i)=>(
            <div key={i} style={card()}>
              <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:12}}>
                <div style={{width:42,height:42,borderRadius:13,background:`${wh.status==='نشط'?C.green:C.red}12`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>🔗</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                    <p style={{color:C.text,fontWeight:800,fontSize:14}}>{wh.name}</p>
                    <span style={{padding:'2px 10px',borderRadius:20,fontSize:10,fontWeight:700,background:wh.status==='نشط'?'rgba(22,163,74,0.12)':'rgba(239,68,68,0.12)',color:wh.status==='نشط'?C.green:C.red}}>● {wh.status}</span>
                  </div>
                  <p style={{color:C.sub,fontSize:12,marginBottom:6,fontFamily:'monospace'}}>{wh.url}</p>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {wh.events.map(e=>(
                      <span key={e} style={{padding:'2px 10px',borderRadius:20,fontSize:10,background:`${C.blue}12`,color:C.blue,fontFamily:'monospace'}}>{e}</span>
                    ))}
                  </div>
                </div>
                <div style={{display:'flex',gap:8,flexShrink:0}}>
                  <span style={{color:C.dim,fontSize:11}}>آخر ping: {wh.lastPing}</span>
                  <button onClick={()=>alert('تعديل الـ Webhook قيد التطوير.')} style={{width:28,height:28,borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',cursor:'pointer',fontSize:13}}>✏️</button>
                  <button onClick={()=>alert('حذف الـ Webhook قيد التطوير.')} style={{width:28,height:28,borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',cursor:'pointer',fontSize:13}}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
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
Authorization: Bearer ya_live_sk_xK9mP2nQrTs4vW8zA1bD...
Content-Type: application/json`}/>
              <div style={{marginTop:14}}>
                <p style={{color:C.sub,fontSize:12,marginBottom:8}}>نموذج الاستجابة (200 OK)</p>
                <CodeBlock lang="JSON Response" code={`{
  "success": true,
  "data": {
    "branches": [
      {
        "id": 1,
        "country": "فلسطين",
        "flag": "🇵🇸",
        "students_count": 2840,
        "status": "active"
      }
    ],
    "pagination": {
      "total": 8,
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
