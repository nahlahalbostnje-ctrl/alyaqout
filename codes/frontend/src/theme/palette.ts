/**
 * ثيم منصة الياقوت — فاتح ومريح للعين
 * 70% فاتح · 20% أزرق هادئ · 7% نص كحلي · 3% ذهب للهوية فقط
 */
export const brand = {
  gold: '#C59341',
  goldL: '#D4A65A',
  goldGrad: 'linear-gradient(135deg,#C59341,#D4A65A)',
} as const;

/** لوحة الألوان المشتركة للواجهات (أزرار، قوائم، بطاقات) */
export const C = {
  /** أساسي تفاعلي — كان يُسمّى gold في الصفحات القديمة */
  gold: '#3B82A0',
  goldL: '#78B7C9',
  goldG: 'linear-gradient(135deg,#3B82A0 0%,#78B7C9 100%)',
  goldGrad: 'linear-gradient(135deg,#3B82A0 0%,#78B7C9 100%)',
  goldBg: 'rgba(59,130,160,0.08)',
  goldBdr: 'rgba(59,130,160,0.22)',
  shadowLg: '0 8px 32px rgba(36,55,70,0.1)',

  /** ذهب الهوية — للشعار والعناصر المهمة فقط */
  brand: brand.gold,
  brandL: brand.goldL,
  brandGrad: brand.goldGrad,

  primary: '#3B82A0',
  primarySoft: '#78B7C9',

  /** كان navy للهيدر الداكن — صار لون نص/شريط هادئ */
  navy: '#243746',
  navy2: '#3B82A0',
  navy3: '#2F6A84',

  sidebar: '#FFFFFF',
  sidebarBorder: '#E2EBF0',
  sidebarActiveBg: 'rgba(59,130,160,0.1)',

  bg: '#F7F9FA',
  card: '#FFFFFF',
  text: '#243746',
  sub: '#5A6B75',
  dim: '#8A9AA3',
  border: '#E2EBF0',
  shadow: '0 2px 16px rgba(36,55,70,0.06)',

  green: '#6FAF8A',
  greenBg: 'rgba(111,175,138,0.12)',
  red: '#E07A7A',
  redBg: 'rgba(224,122,122,0.12)',
  amber: '#C9A227',
  amberBg: 'rgba(201,162,39,0.12)',
  blue: '#78B7C9',
  blueBg: 'rgba(120,183,201,0.12)',
  purple: '#7B8CDE',
  purpleBg: 'rgba(123,140,222,0.12)',
  orange: '#D4A35A',
  teal: '#5BA3B5',
  tealBg: 'rgba(91,163,181,0.12)',
} as const;

export type ThemeColors = typeof C;

export default C;
