// src/app/mappers/egresado-form.mapper.ts

import { FormGroup } from '@angular/forms';

function construirPlanTextoDesdePlan(plan: any): string {
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

function normalizarSituacion(valor: any, situaciones: Array<{ value: string }>): string | null {
  if (!valor) return null;
  const limpio = valor.toString().trim().toLowerCase();
  const match = situaciones.find((s) => s.value.toLowerCase() === limpio);
  return match ? match.value : null;
}

function anioFinCompat(eg: any): number | null {
  return (
    eg?.anioFinEstudios ??
    (eg?.fechaEgreso ? new Date(eg.fechaEgreso).getFullYear() : null)
  );
}

export function patchFormFromEgresado(
  form: FormGroup,
  egresado: any,
  situaciones: Array<{ value: string }>,
) {
  const eg = egresado?.data ? egresado.data : egresado;
  if (!eg) return;

  const plan = eg?.Estudiante?.Plan ?? null;
  const planTexto = construirPlanTextoDesdePlan(plan);

  form.patchValue({
    planEstudios: planTexto,

    situacionActual: normalizarSituacion(eg.situacionActual, situaciones),
    situacionActualOtro: eg.situacionActualOtro ?? '',

    empresa: eg.empresa ?? '',
    cargo: eg.cargo ?? '',

    nivelRentas: eg.nivelRentas ?? null,

    viaIngreso: eg.viaIngreso ?? null,
    viaIngresoOtro: eg.viaIngresoOtro ?? '',

    anioIngresoCarrera: eg.anioIngresoCarrera ?? null,
    anioFinEstudios: anioFinCompat(eg),

    genero: eg.genero ?? null,
    tiempoBusquedaTrabajo: eg.tiempoBusquedaTrabajo ?? null,

    sectorLaboral: eg.sectorLaboral ?? null,
    sectorLaboralOtro: eg.sectorLaboralOtro ?? '',

    tipoEstablecimiento: eg.tipoEstablecimiento ?? 'No aplica',
    tipoEstablecimientoOtro: eg.tipoEstablecimientoOtro ?? '',

    sueldo: eg.sueldo ?? null,
    anioIngresoLaboral: eg.anioIngresoLaboral ?? null,

    telefono: eg.telefono ?? '',
    emailContacto: eg.emailContacto ?? '',
    linkedin: eg.linkedin ?? '',
  });
}

export function extractPlanIds(egresado: any): { planOriginalId: number | null; planSeleccionadoId: number | null } {
  const eg = egresado?.data ? egresado.data : egresado;
  const plan = eg?.Estudiante?.Plan ?? null;

  const idPlan = plan?.idPlan ?? eg?.Estudiante?.idPlan ?? null;
  const original = idPlan ? Number(idPlan) : null;

  return { planOriginalId: original, planSeleccionadoId: original };
}
