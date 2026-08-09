/** ثيم بوابة الطالب فقط — لا يغيّر باقي الأدوار */

export const ST = {
  primary: '#0B5ED7',
  secondary: '#1E88E5',
  navy: '#0A2540',
  bg: '#F8FAFC',
  card: '#FFFFFF',
  gold: '#F59E0B',
  success: '#10B981',
  danger: '#EF4444',
  text: '#1F2937',
  sub: '#6B7280',
  dim: '#9CA3AF',
  border: '#E5E7EB',
  shadow: '0 4px 24px rgba(10,37,64,0.06)',
  shadowLg: '0 12px 40px rgba(11,94,215,0.12)',
  radius: 20,
  blueGrad: 'linear-gradient(135deg,#0B5ED7 0%,#1E88E5 100%)',
  goldGrad: 'linear-gradient(135deg,#F59E0B 0%,#FBBF24 100%)',
  primarySoft: 'rgba(11,94,215,0.08)',
  goldSoft: 'rgba(245,158,11,0.12)',
  successSoft: 'rgba(16,185,129,0.12)',
  dangerSoft: 'rgba(239,68,68,0.12)',
  font: "'Cairo',sans-serif",
} as const;

export type StudentTheme = typeof ST;
