

export function extraerRutCuerpo(raw: string): string {
  const digits = (raw ?? '').toString().replace(/\D/g, '');
  return digits.slice(0, 8);
}

export function formatearRutMinimoSinDv(raw: string): string {
  const cuerpo = extraerRutCuerpo(raw);
  if (!cuerpo) return '';
  return cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function normalizarRut(raw: string): string {
  return extraerRutCuerpo(raw);
}

export function isRutValido(rutFormateado: string): boolean {
  const cuerpo = normalizarRut(rutFormateado);
  return /^\d{7,8}$/.test(cuerpo);
}

export function existeRutEnEstudiantes(
  estudiantes: Array<{ idEstudiante: number; rut: string }>,
  rut: string,
  excluirIdEstudiante?: number | null,
): boolean {
  const objetivo = normalizarRut(rut);
  if (!objetivo || objetivo.length < 7) return false;

  return (estudiantes ?? []).some((e) => {
    if (excluirIdEstudiante && e.idEstudiante === excluirIdEstudiante) return false;
    return normalizarRut(e.rut) === objetivo;
  });
}
    