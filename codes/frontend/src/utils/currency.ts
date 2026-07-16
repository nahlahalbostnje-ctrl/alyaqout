/** كود العملة من لوحة الدول (مثل SAR / JOD) — بدون مسمّى ثابت. */
export function normalizeCurrency(code?: string | null): string {
  return (code ?? '').trim().toUpperCase();
}

export function formatMoney(
  amount: number | string | null | undefined,
  currency?: string | null,
  options?: { suffix?: string },
): string {
  const n = Number(amount ?? 0);
  const formatted = Number.isFinite(n) ? n.toLocaleString('ar') : '0';
  const cur = normalizeCurrency(currency);
  const parts = [formatted];
  if (cur) parts.push(cur);
  if (options?.suffix) parts.push(options.suffix);
  return parts.join(' ');
}
