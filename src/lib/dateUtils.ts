export function getBrazilTodayStr(dateObj?: Date | number | string): string {
  const d = dateObj ? new Date(dateObj) : new Date();
  const parts = new Intl.DateTimeFormat('pt-BR', { 
    timeZone: 'America/Sao_Paulo', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  }).formatToParts(d);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}
