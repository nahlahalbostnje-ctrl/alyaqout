import { useEffect } from 'react';
import ParentLayout from '../components/ParentLayout';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../features/notifications/notificationsSlice';

const C = {
  gold:'#C59341', goldL:'#D4A65A',
  goldGrad:'linear-gradient(135deg,#C59341,#D4A65A)',
  goldBg:'rgba(197,147,65,0.08)', goldBdr:'rgba(197,147,65,0.22)',
  bg:'#F5EDD8', card:'#FFFFFF', navy:'#0D1E3A',
  text:'#1B2038', sub:'#6B7280', dim:'#9CA3AF', border:'#EDE3CE',
  shadow:'0 2px 16px rgba(0,0,0,0.06)',
};

const TYPE_ICON: Record<string, string> = {
  general: '🔔', daily_report: '📋', absence: '📅', exam_result: '📝',
  installment_paid: '💳', broadcast: '📢',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'الآن';
  if (m < 60) return `منذ ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} ساعة`;
  return `منذ ${Math.floor(h / 24)} يوم`;
}

export default function ParentNotificationsPage() {
  const dispatch = useAppDispatch();
  const { items, unreadCount, loading } = useAppSelector((s) => s.notifications);

  useEffect(() => { dispatch(fetchNotifications()); }, [dispatch]);

  return (
    <ParentLayout>
      <div dir="rtl" style={{ padding:24, fontFamily:"'Cairo',sans-serif", minHeight:'100%' }}>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <div style={{ width:4, height:22, borderRadius:2, background:C.goldGrad }} />
              <h1 style={{ color:C.text, fontWeight:900, fontSize:22, margin:0 }}>الإشعارات 🔔</h1>
            </div>
            <p style={{ color:C.sub, fontSize:13, margin:0 }}>كل التحديثات المتعلقة بأبنائك في مكان واحد</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={() => dispatch(markAllNotificationsRead())} style={{
              padding:'10px 20px', borderRadius:12, background:C.goldGrad, border:'none',
              color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer',
              boxShadow:'0 4px 14px rgba(197,147,65,0.35)', fontFamily:"'Cairo',sans-serif",
            }}>تعليم الكل كمقروء ({unreadCount})</button>
          )}
        </div>

        <div style={{ background:C.card, borderRadius:16, boxShadow:C.shadow, border:`1px solid ${C.border}`, overflow:'hidden' }}>
          {loading && (
            <p style={{ color:C.dim, fontSize:13, textAlign:'center', padding:'40px 0' }}>جارٍ التحميل...</p>
          )}

          {!loading && items.length === 0 && (
            <div style={{ padding:'60px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:40, opacity:0.4 }}>🔔</span>
              <p style={{ color:C.dim, fontSize:14 }}>لا توجد إشعارات بعد</p>
            </div>
          )}

          {!loading && items.map((n, i) => (
            <div key={n.id}
              onClick={() => !n.is_read && dispatch(markNotificationRead(n.id))}
              style={{
                display:'flex', alignItems:'flex-start', gap:12, padding:'16px 20px',
                borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : 'none',
                background: n.is_read ? 'transparent' : C.goldBg,
                cursor: n.is_read ? 'default' : 'pointer',
              }}>
              <div style={{ width:38, height:38, borderRadius:10, background: n.is_read ? '#F3F4F6' : C.goldBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                {TYPE_ICON[n.type] ?? '🔔'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <p style={{ color:C.text, fontWeight:700, fontSize:13.5, margin:0 }}>{n.title}</p>
                  {!n.is_read && <span style={{ width:7, height:7, borderRadius:'50%', background:C.gold, flexShrink:0 }} />}
                </div>
                <p style={{ color:C.sub, fontSize:12.5, lineHeight:1.6, margin:'4px 0', whiteSpace:'pre-line' }}>{n.body}</p>
                <p style={{ color:C.dim, fontSize:11 }}>{timeAgo(n.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ParentLayout>
  );
}
