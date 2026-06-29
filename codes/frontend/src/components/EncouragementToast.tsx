import { useState, useEffect } from 'react';

const MESSAGES: Record<string, string[]> = {
  exam_passed:   ['🎉 أحسنت! لقد اجتزت الاختبار بنجاح!', '🏆 رائع! علامتك تعكس جهدك!', '⭐ ممتاز! واصل هذا المستوى!'],
  homework_done: ['✅ رائع! أنجزت واجبك في الوقت المحدد!', '💪 أنت طالب منظم ورائع!', '📚 واجبك مسلّم — استمر هكذا!'],
  points_earned: ['⭐ نقاط جديدة في رصيدك!', '🌟 أنت تتقدم بسرعة!', '💰 نقاطك تتراكم — واصل!'],
  attendance:    ['🏆 حضورك المنتظم يصنع الفارق!', '📅 يوم رائع آخر في المنصة!', '🌅 الاستمرارية هي سر النجاح!'],
  general:       ['💪 أنت تسير في الاتجاه الصحيح!', '🚀 كل يوم خطوة نحو هدفك!', '✨ طالب ياقوت النجوم!'],
};

function getRandom(type: string): string {
  const arr = MESSAGES[type] ?? MESSAGES.general;
  return arr[Math.floor(Math.random() * arr.length)];
}

interface Props {
  type: string;
  onClose: () => void;
}

export default function EncouragementToast({ type, onClose }: Props) {
  const [msg] = useState(() => getRandom(type));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onClose, 400); }, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position:'fixed', bottom:80, left:'50%', transform:`translateX(-50%) translateY(${visible ? 0 : 20}px)`,
      background:'linear-gradient(135deg,#0D1E3A,#162144)', color:'#fff',
      padding:'14px 24px', borderRadius:16, boxShadow:'0 8px 32px rgba(0,0,0,0.3)',
      fontFamily:"'Cairo',sans-serif", fontSize:15, fontWeight:700, textAlign:'center',
      zIndex:9999, transition:'all 0.4s ease', opacity: visible ? 1 : 0,
      border:'1px solid rgba(197,147,65,0.4)', whiteSpace:'nowrap',
    }}>
      {msg}
      <button onClick={() => { setVisible(false); setTimeout(onClose, 400); }}
        style={{ marginRight:12, background:'transparent', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:16, verticalAlign:'middle' }}>✕</button>
    </div>
  );
}

export function useEncouragement() {
  const [toast, setToast] = useState<{ type: string; key: number } | null>(null);

  const show = (type: string) => setToast({ type, key: Date.now() });
  const hide = () => setToast(null);

  const element = toast ? <EncouragementToast key={toast.key} type={toast.type} onClose={hide} /> : null;

  return { show, element };
}
