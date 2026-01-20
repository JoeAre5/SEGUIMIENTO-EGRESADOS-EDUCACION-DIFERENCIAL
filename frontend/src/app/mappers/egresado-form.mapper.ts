// src/app/mappers/egresado-form.mapper.ts

export type SituacionOption = { label: string; value: string };

export function normalizarSituacion(valor: any, situaciones: SituacionOption[]): string | null {
  if (!valor) return null;
  const limpio = valor.toString().trim().toLowerCase();
  const match = (situaciones ?? []).find((s) => s.value.toLowerCase() === limpio);
  return match ? match.value : null;
}

export function construirPlanTextoDesdePlan(plan: any): string {
  if (!plan) return '';
  const titulo = plan?.titulo ?? '';
  const codigo = plan?.codigo ?? '';
  const agnio = plan?.agnio ?? '';
  const partes: string[] = [];
  if (titulo) partes.push(titulo);
  if (agnio !== '' && agnio !== null && agnio !== undefined) partes.push(`Año: ${agnio}`);
  if (codigo !== '' && codigo !== null && codigo !== undefined) partes.push(`Código: ${codigo}`);
  return partes.join(' • ');
}

/**
 * Devuelve:
 * - idPlan (para planOriginalId/planSeleccionadoId)
 * - patch (objeto listo para formulario.patchValue)
 */
export function mapEgresadoToFormPatch(
  eg: any,
  situaciones: SituacionOption[]
): { idPlan: number | null; patch: Record<string, any> } {
  const plan = eg?.Estudiante?.Plan ?? null;
  const planTexto = construirPlanTextoDesdePlan(plan);

  const idPlanRaw = plan?.idPlan ?? eg?.Estudiante?.idPlan ?? null;
  const idPlan = idPlanRaw !== null && idPlanRaw !== undefined ? Number(idPlanRaw) : null;

  const anioFinCompat =
    eg?.anioFinEstudios ??
    (eg?.fechaEgreso ? new Date(eg.fechaEgreso).getFullYear() : null);

  return {
    idPlan,
    patch: {
      planEstudios: planTexto,

      situacionActual: normalizarSituacion(eg?.situacionActual, situaciones),
      situacionActualOtro: eg?.situacionActualOtro ?? '',

      empresa: eg?.empresa ?? '',
      cargo: eg?.cargo ?? '',

      nivelRentas: eg?.nivelRentas ?? null,

      viaIngreso: eg?.viaIngreso ?? null,
      viaIngresoOtro: eg?.viaIngresoOtro ?? '',

      anioIngresoCarrera: eg?.anioIngresoCarrera ?? null,
      anioFinEstudios: anioFinCompat,

      genero: eg?.genero ?? null,
      tiempoBusquedaTrabajo: eg?.tiempoBusquedaTrabajo ?? null,

      sectorLaboral: eg?.sectorLaboral ?? null,
      sectorLaboralOtro: eg?.sectorLaboralOtro ?? '',

      tipoEstablecimiento: eg?.tipoEstablecimiento ?? 'No aplica',
      tipoEstablecimientoOtro: eg?.tipoEstablecimientoOtro ?? '',

      sueldo: eg?.sueldo ?? null,
      anioIngresoLaboral: eg?.anioIngresoLaboral ?? null,

      telefono: eg?.telefono ?? '',
      emailContacto: eg?.emailContacto ?? '',
      linkedin: eg?.linkedin ?? '',
    },
  };
}
