// src/app/components/seguimiento-egresados/_refactor/egresado-save.facade.ts

import { Observable, of } from 'rxjs';

export function buildFormDataFromRaw(raw: Record<string, any>, documentos: File[], includeIdEstudiante?: number) {
  const fd = new FormData();

  if (includeIdEstudiante !== undefined && includeIdEstudiante !== null) {
    fd.append('idEstudiante', includeIdEstudiante.toString());
  }

  Object.entries(raw ?? {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      fd.append(key, value.toString());
    }
  });

  (documentos ?? []).forEach((file) => fd.append('documentos', file));
  return fd;
}

export function actualizarPlanSiCambia$(
  idEstudiante: number,
  planSeleccionadoId: number | null,
  planOriginalId: number | null,
  updatePlanFn: (id: number, dto: any) => Observable<any>
) {
  const nuevoIdPlan = planSeleccionadoId ? Number(planSeleccionadoId) : null;

  if (!nuevoIdPlan) return of(null);
  if (planOriginalId && nuevoIdPlan === Number(planOriginalId)) return of(null);

  return updatePlanFn(idEstudiante, { idPlan: nuevoIdPlan });
}
