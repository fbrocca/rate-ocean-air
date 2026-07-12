export function fmtMoney(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

export function fmtTeu(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K TEU`;
  return `${Math.round(value)} TEU`;
}

export function fmtRate(value: number): string {
  return `$${Math.round(value).toLocaleString()}/TEU`;
}

export function fmtPct(value: number): string {
  return `${Math.round(value * 100)}%`;
}
