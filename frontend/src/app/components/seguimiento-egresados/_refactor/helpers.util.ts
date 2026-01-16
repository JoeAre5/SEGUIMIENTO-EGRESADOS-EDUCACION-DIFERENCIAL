export type TagSeverity = 'success' | 'info' | 'warning' | 'danger' | 'secondary';

export function getSituacionSeverity(situacion?: string | null): TagSeverity {
  const s = (situacion ?? '').toString().trim().toLowerCase();
  if (s === 'trabajando') return 'success';
  if (s === 'cesante') return 'danger';
  if (!s) return 'secondary';
  return 'warning';
}

export function formatCLP(valor?: number | null): string {
  // mantiene tu comportamiento: 0/undefined/null -> "-"
  if (!valor) return '-';
  return valor.toLocaleString('es-CL');
}

export function applyGlobalFilter(table: any, event: any, matchMode: string = 'contains'): void {
  if (!table || typeof table.filterGlobal !== 'function') return;
  const value = (event?.target?.value ?? '').toString();
  table.filterGlobal(value, matchMode);
}
