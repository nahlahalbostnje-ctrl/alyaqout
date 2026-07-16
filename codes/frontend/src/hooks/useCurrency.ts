import { useAppSelector } from '../app/hooks';
import { formatMoney, normalizeCurrency } from '../utils/currency';

/** عملة بلد المستخدم من المصادقة (countries.currency في لوحة التحكم). */
export function useCurrency() {
  const country = useAppSelector((s) => s.auth.user?.country);
  const currency = normalizeCurrency(country?.currency);

  return {
    currency,
    /** مثال: `120 SAR` أو `120` إن لم تُضبط العملة */
    formatMoney: (amount: number | string | null | undefined, opts?: { suffix?: string }) =>
      formatMoney(amount, currency, opts),
    /** للتسميات مثل: السعر (SAR) */
    withLabel: (label: string) => (currency ? `${label} (${currency})` : label),
  };
}
