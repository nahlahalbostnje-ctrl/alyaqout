import { useState, useRef, useEffect } from 'react';
import ParentLayout from '../components/ParentLayout';
import api from '../services/axios';

const C = {
  gold:'#C59341', goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.22)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  green:'#10B981',
};

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

const INITIAL_MSG: Message = {
  id: 1, role: 'assistant',
  text: 'مرحباً! أنا مساعد الياقوت الذكي 🤖\n\nأنا هنا لمساعدتك في متابعة رحلة أبنائك التعليمية. يمكنك سؤالي عن:\n• مستوى أبنائك الأكاديمي وكيفية التحسين\n• نصائح تربوية لتحسين التحصيل الدراسي\n• كيفية التعامل مع صعوبات التعلم\n• إدارة وقت المذاكرة في المنزل\n• تفسير التقارير والنتائج',
  time: new Date().toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit' }),
};

const SUGGESTIONS = [
  'كيف يمكنني مساعدة ابني في اللغة الإنجليزية؟',
  'ما أفضل طرق المذاكرة للمرحلة الابتدائية؟',
  'ابني يتأخر في تسليم الواجبات، ماذا أفعل؟',
  'كيف أتعامل مع قلق الاختبارات عند أبنائي؟',
];

const CAPABILITIES = [
  'تحليل مستوى أبنائك أكاديمياً',
  'اقتراح خطط مراجعة مخصصة',
  'نصائح لتعزيز الدافعية',
  'التعامل مع صعوبات التعلم',
  'إدارة وقت المذاكرة',
  'الدعم النفسي لولي الأمر',
];

export default function ParentAIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MSG]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const now = () => new Date().toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit' });

  const buildHistory = (msgs: Message[]) =>
    msgs
      .filter(m => m.id !== 1)
      .slice(-8)
      .map(m => ({ role: m.role, content: m.text }));

  const send = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { id: nextId.current++, role:'user', text: text.trim(), time: now() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      const { data } = await api.post('/parent/chatbot', {
        message: text.trim(),
        history: buildHistory(updatedMessages),
      });
      const aiMsg: Message = { id: nextId.current++, role:'assistant', text: data.reply, time: now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = {
        id: nextId.current++, role:'assistant',
        text: 'عذراً، حدث خطأ في الاتصال. تأكد من أن خدمة المساعد الذكي مفعّلة في إعدادات المنصة.',
        time: now(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const reset = () => { setMessages([INITIAL_MSG]); setInput(''); setIsTyping(false); };

  return (
    <ParentLayout>
      <div dir="rtl" style={{ display:'flex', flexDirection: isMobile ? 'column' : 'row', height: isMobile ? 'auto' : 'calc(100vh - 58px)', minHeight: isMobile ? 'calc(100vh - 58px)' : undefined, fontFamily:"'Cairo',sans-serif" }}>

        {/* Left sidebar — stacks on top, capped height, on mobile */}
        <div style={{ width: isMobile ? '100%' : 280, maxHeight: isMobile ? 220 : undefined, flexShrink:0, background:C.card, borderLeft: isMobile ? 'none' : `1px solid ${C.border}`, borderBottom: isMobile ? `1px solid ${C.border}` : 'none', display:'flex', flexDirection:'column', padding:20, gap:16, overflowY:'auto' }}>
          {/* AI avatar */}
          <div style={{ textAlign:'center', padding:'10px 0 16px', borderBottom:`1px solid ${C.border}` }}>
            <div style={{ width:80, height:80, borderRadius:24, background:`linear-gradient(135deg,${C.navy},#2D3561)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:42, margin:'0 auto 12px', boxShadow:'0 8px 24px rgba(13,30,58,0.35)' }}>🤖</div>
            <p style={{ color:C.text, fontWeight:900, fontSize:16, marginBottom:3 }}>مساعد الياقوت الذكي</p>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:C.green }} />
              <span style={{ color:C.green, fontSize:12, fontWeight:600 }}>مدعوم بـ Claude AI</span>
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <p style={{ color:C.sub, fontSize:11, fontWeight:700, marginBottom:8, letterSpacing:1 }}>ما يمكنني مساعدتك به</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {CAPABILITIES.map((cap, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ color:C.gold, fontSize:12 }}>✓</span>
                  <span style={{ color:C.text, fontSize:12 }}>{cap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* New chat button */}
          <button onClick={reset}
            style={{ padding:'10px', borderRadius:12, border:`1.5px solid ${C.goldBdr}`, background:C.goldBg, color:C.gold, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
            ✨ محادثة جديدة
          </button>

          {/* Quick questions */}
          <div>
            <p style={{ color:C.sub, fontSize:11, fontWeight:700, marginBottom:8 }}>أسئلة سريعة</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s)}
                  style={{ padding:'9px 12px', borderRadius:10, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:11.5, fontWeight:600, cursor:'pointer', textAlign:'right', lineHeight:1.5, fontFamily:"'Cairo',sans-serif", transition:'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget).style.borderColor=C.gold; (e.currentTarget).style.background=C.goldBg; }}
                  onMouseLeave={e => { (e.currentTarget).style.borderColor=C.border; (e.currentTarget).style.background=C.bg; }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
          {/* Header */}
          <div style={{ padding:'14px 20px', background:C.card, borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:12, background:`linear-gradient(135deg,${C.navy},#2D3561)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🤖</div>
            <div>
              <p style={{ color:C.text, fontWeight:800, fontSize:14 }}>مساعد الياقوت الذكي</p>
              <p style={{ color:C.green, fontSize:11.5, fontWeight:600 }}>🟢 Claude AI • يرد فوراً</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column', gap:16, background:'#FDFAF4' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display:'flex', gap:10, flexDirection: msg.role==='user' ? 'row-reverse' : 'row', alignItems:'flex-end' }}>
                <div style={{ width:36, height:36, borderRadius:'50%', flexShrink:0, background: msg.role==='assistant' ? `linear-gradient(135deg,${C.navy},#2D3561)` : C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize: msg.role==='assistant' ? 18 : 13, color:'#fff', fontWeight:900 }}>
                  {msg.role==='assistant' ? '🤖' : 'و'}
                </div>
                <div style={{ maxWidth:'70%' }}>
                  <div style={{ padding:'12px 16px', borderRadius: msg.role==='assistant' ? '4px 16px 16px 16px' : '16px 4px 16px 16px', background: msg.role==='assistant' ? C.card : C.goldGrad, color: msg.role==='assistant' ? C.text : '#fff', fontSize:13, lineHeight:1.8, boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border: msg.role==='assistant' ? `1px solid ${C.border}` : 'none', whiteSpace:'pre-wrap' }}>
                    {msg.text}
                  </div>
                  <p style={{ color:C.dim, fontSize:10, marginTop:4, textAlign: msg.role==='user' ? 'left' : 'right' }}>{msg.time}</p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:`linear-gradient(135deg,${C.navy},#2D3561)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>🤖</div>
                <div style={{ padding:'12px 16px', borderRadius:'4px 16px 16px 16px', background:C.card, border:`1px solid ${C.border}`, display:'flex', gap:4, alignItems:'center' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:C.gold, animation:`bounce 1s ${i*0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding:'14px 20px', background:C.card, borderTop:`1px solid ${C.border}` }}>
            <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="اكتب سؤالك هنا... (Enter للإرسال، Shift+Enter للسطر الجديد)"
                rows={1}
                style={{ flex:1, padding:'10px 14px', borderRadius:12, border:`1.5px solid ${C.border}`, background:C.bg, color:C.text, fontSize:13, outline:'none', fontFamily:"'Cairo',sans-serif", resize:'none', lineHeight:1.6, maxHeight:100, overflowY:'auto' }}
                onFocus={e => (e.currentTarget.style.borderColor = C.gold)}
                onBlur={e => (e.currentTarget.style.borderColor = C.border)}
              />
              <button onClick={() => send(input)} disabled={!input.trim() || isTyping}
                style={{ width:44, height:44, borderRadius:12, border:'none', background: input.trim() && !isTyping ? C.goldGrad : '#E5E7EB', color: input.trim() && !isTyping ? '#fff' : C.dim, cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, boxShadow: input.trim() && !isTyping ? '0 4px 12px rgba(197,147,65,0.35)' : 'none', transition:'all 0.2s' }}>
                ↑
              </button>
            </div>
            <p style={{ color:C.dim, fontSize:10.5, marginTop:6, textAlign:'center' }}>مدعوم بـ Claude AI • منصة الياقوت التعليمية</p>
          </div>
        </div>

        <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }`}</style>
      </div>
    </ParentLayout>
  );
}
