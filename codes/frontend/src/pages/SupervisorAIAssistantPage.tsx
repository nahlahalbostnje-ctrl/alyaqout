import { useState, useRef, useEffect } from 'react';
import SupervisorLayout from '../components/SupervisorLayout';
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
  text: 'مرحباً أستاذ! أنا مساعدك الذكي لعملية الإشراف التربوي 🎓\n\nأنا هنا لمساعدتك في:\n• تحليل أداء الطلاب وتحديد نقاط القوة والضعف\n• إعداد جلسات الإرشاد الأكاديمي والنفسي\n• اقتراح خطط تدخلية للطلاب المتعثرين\n• صياغة تقارير المتابعة والتوصيات\n• التعامل مع حالات القلق والتوتر الدراسي',
  time: new Date().toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit' }),
};

const SUGGESTIONS = [
  'كيف أعد خطة إرشادية لطالب متعثر دراسياً؟',
  'طالب يعاني من قلق الاختبارات، كيف أساعده؟',
  'كيف أكتب تقرير متابعة أكاديمي احترافي؟',
  'ما أساليب تحفيز الطلاب المحبطين؟',
  'كيف أتعامل مع طالب يتغيب بكثرة؟',
  'ضع لي نموذج جلسة إرشاد جماعي',
];

const CAPABILITIES = [
  'تحليل الأداء الأكاديمي للطلاب',
  'إعداد خطط الإرشاد والتوجيه',
  'صياغة تقارير المتابعة',
  'استراتيجيات التدخل المبكر',
  'التعامل مع الحالات الخاصة',
  'دعم الصحة النفسية للطلاب',
];

export default function SupervisorAIAssistantPage() {
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
      const { data } = await api.post('/supervisor/chatbot', {
        message: text.trim(),
        history: buildHistory(updatedMessages),
      });
      const aiMsg: Message = { id: nextId.current++, role:'assistant', text: data.reply, time: now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = {
        id: nextId.current++, role:'assistant',
        text: 'عذراً، حدث خطأ في الاتصال. تأكد من تفعيل خدمة المساعد الذكي في إعدادات المنصة.',
        time: now(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const reset = () => { setMessages([INITIAL_MSG]); setInput(''); setIsTyping(false); };

  return (
    <SupervisorLayout>
      <div dir="rtl" style={{ display:'flex', flexDirection: isMobile ? 'column' : 'row', height: isMobile ? 'auto' : 'calc(100vh - 54px)', minHeight: isMobile ? 'calc(100vh - 54px)' : undefined, fontFamily:"'Cairo',sans-serif" }}>

        {/* Left sidebar — stacks on top, capped height, on mobile */}
        <div style={{ width: isMobile ? '100%' : 270, maxHeight: isMobile ? 220 : undefined, flexShrink:0, background:C.card, borderLeft: isMobile ? 'none' : `1px solid ${C.border}`, borderBottom: isMobile ? `1px solid ${C.border}` : 'none', display:'flex', flexDirection:'column', padding:18, gap:14, overflowY:'auto' }}>
          <div style={{ textAlign:'center', padding:'10px 0 16px', borderBottom:`1px solid ${C.border}` }}>
            <div style={{ width:76, height:76, borderRadius:22, background:`linear-gradient(135deg,${C.navy},#1a3355)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:40, margin:'0 auto 12px', boxShadow:'0 8px 24px rgba(13,30,58,0.35)' }}>🎓</div>
            <p style={{ color:C.text, fontWeight:900, fontSize:15, marginBottom:3 }}>مساعد الإشراف الذكي</p>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:C.green }} />
              <span style={{ color:C.green, fontSize:12, fontWeight:600 }}>مدعوم بـ Claude AI</span>
            </div>
          </div>

          <div>
            <p style={{ color:C.sub, fontSize:11, fontWeight:700, marginBottom:8 }}>تخصصاتي</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {CAPABILITIES.map((cap, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ color:C.gold, fontSize:12 }}>✓</span>
                  <span style={{ color:C.text, fontSize:12 }}>{cap}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={reset}
            style={{ padding:'10px', borderRadius:12, border:`1.5px solid ${C.goldBdr}`, background:C.goldBg, color:C.gold, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
            ✨ محادثة جديدة
          </button>

          <div>
            <p style={{ color:C.sub, fontSize:11, fontWeight:700, marginBottom:8 }}>أسئلة إرشادية سريعة</p>
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s)}
                  style={{ padding:'8px 10px', borderRadius:10, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:11, fontWeight:600, cursor:'pointer', textAlign:'right', lineHeight:1.5, fontFamily:"'Cairo',sans-serif", transition:'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=C.gold; e.currentTarget.style.background=C.goldBg; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background=C.bg; }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
          {/* Header */}
          <div style={{ padding:'12px 20px', background:C.card, borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:11, background:`linear-gradient(135deg,${C.navy},#1a3355)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🎓</div>
            <div>
              <p style={{ color:C.text, fontWeight:800, fontSize:14 }}>مساعد الإشراف التربوي الذكي</p>
              <p style={{ color:C.green, fontSize:11.5, fontWeight:600 }}>🟢 Claude AI • متخصص في الإرشاد والإشراف</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'18px', display:'flex', flexDirection:'column', gap:14, background:'#FDFAF4' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display:'flex', gap:10, flexDirection: msg.role==='user' ? 'row-reverse' : 'row', alignItems:'flex-end' }}>
                <div style={{ width:34, height:34, borderRadius:'50%', flexShrink:0, background: msg.role==='assistant' ? `linear-gradient(135deg,${C.navy},#1a3355)` : C.goldGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize: msg.role==='assistant' ? 16 : 12, color:'#fff', fontWeight:900 }}>
                  {msg.role==='assistant' ? '🎓' : 'م'}
                </div>
                <div style={{ maxWidth:'72%' }}>
                  <div style={{ padding:'12px 16px', borderRadius: msg.role==='assistant' ? '4px 16px 16px 16px' : '16px 4px 16px 16px', background: msg.role==='assistant' ? C.card : C.goldGrad, color: msg.role==='assistant' ? C.text : '#fff', fontSize:13, lineHeight:1.8, boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border: msg.role==='assistant' ? `1px solid ${C.border}` : 'none', whiteSpace:'pre-wrap' }}>
                    {msg.text}
                  </div>
                  <p style={{ color:C.dim, fontSize:10, marginTop:4, textAlign: msg.role==='user' ? 'left' : 'right' }}>{msg.time}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
                <div style={{ width:34, height:34, borderRadius:'50%', background:`linear-gradient(135deg,${C.navy},#1a3355)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>🎓</div>
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
          <div style={{ padding:'12px 20px', background:C.card, borderTop:`1px solid ${C.border}` }}>
            <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="اكتب سؤالك الإرشادي هنا... (Enter للإرسال)"
                rows={1}
                style={{ flex:1, padding:'10px 14px', borderRadius:12, border:`1.5px solid ${C.border}`, background:C.bg, color:C.text, fontSize:13, outline:'none', fontFamily:"'Cairo',sans-serif", resize:'none', lineHeight:1.6, maxHeight:100, overflowY:'auto' }}
                onFocus={e => (e.currentTarget.style.borderColor = C.gold)}
                onBlur={e => (e.currentTarget.style.borderColor = C.border)}
              />
              <button onClick={() => send(input)} disabled={!input.trim() || isTyping}
                style={{ width:42, height:42, borderRadius:12, border:'none', background: input.trim() && !isTyping ? C.goldGrad : '#E5E7EB', color: input.trim() && !isTyping ? '#fff' : C.dim, cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, transition:'all 0.2s' }}>
                ↑
              </button>
            </div>
            <p style={{ color:C.dim, fontSize:10.5, marginTop:5, textAlign:'center' }}>مدعوم بـ Claude AI • متخصص في الإشراف التربوي</p>
          </div>
        </div>

        <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }`}</style>
      </div>
    </SupervisorLayout>
  );
}
