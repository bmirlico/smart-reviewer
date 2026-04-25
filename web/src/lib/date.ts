const RTF = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function formatRelativeDate(iso: string): string {
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return '';

  const diffSec = Math.round((ts - Date.now()) / 1000);
  const abs = Math.abs(diffSec);

  if (abs < 60) return RTF.format(diffSec, 'second');
  if (abs < 3600) return RTF.format(Math.round(diffSec / 60), 'minute');
  if (abs < 86_400) return RTF.format(Math.round(diffSec / 3600), 'hour');
  if (abs < 2_592_000) return RTF.format(Math.round(diffSec / 86_400), 'day');
  if (abs < 31_536_000) return RTF.format(Math.round(diffSec / 2_592_000), 'month');
  return RTF.format(Math.round(diffSec / 31_536_000), 'year');
}

const ABS_FMT = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export function formatAbsoluteDate(iso: string): string {
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return '';
  return ABS_FMT.format(new Date(ts));
}
