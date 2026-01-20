// src/app/components/seguimiento-egresados/_refactor/dashboard.util.ts

export type Stats = { total: number; trabajando: number; cesante: number; otro: number };

export function normalizarSituacionStats(valor: any): string {
  return (valor ?? '').toString().trim().toLowerCase();
}

export function obtenerAnioFinDesdeEgresado(e: any): number | null {
  const yRaw = e?.anioFinEstudios ?? (e?.fechaEgreso ? new Date(e.fechaEgreso).getFullYear() : null);
  const y = typeof yRaw === 'number' ? yRaw : parseInt(yRaw, 10);
  return Number.isFinite(y) ? y : null;
}

export function recalcularStats(lista: any[]): Stats {
  const arr = Array.isArray(lista) ? lista : [];
  const total = arr.length;

  const trabajando = arr.filter((x) => normalizarSituacionStats(x?.situacionActual) === 'trabajando').length;
  const cesante = arr.filter((x) => normalizarSituacionStats(x?.situacionActual) === 'cesante').length;
  const otro = arr.filter((x) => normalizarSituacionStats(x?.situacionActual) === 'otro').length;

  return { total, trabajando, cesante, otro };
}

export function buildDonutOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } },
      tooltip: { enabled: true },
    },
  };
}

export function buildChartsGlobal(lista: any[], stats: Stats) {
  const arr = Array.isArray(lista) ? lista : [];

  const donutSituacionData = {
    labels: ['Trabajando', 'Cesante', 'Otro'],
    datasets: [
      {
        data: [stats.trabajando, stats.cesante, stats.otro],
        backgroundColor: ['#047857', '#E11D48', '#D97706'],
        hoverBackgroundColor: ['#059669', '#F43F5E', '#F59E0B'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const conDocs = arr.filter((x) => (x?.documentos?.length ?? 0) > 0).length;
  const sinDocs = arr.length - conDocs;

  const donutDocsData = {
    labels: ['Con documentos', 'Sin documentos'],
    datasets: [
      {
        data: [conDocs, sinDocs],
        backgroundColor: ['#0369A1', '#CBD5E1'],
        hoverBackgroundColor: ['#0284C7', '#E2E8F0'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const conteoPorAnio = new Map<number, number>();
  for (const x of arr) {
    const y = obtenerAnioFinDesdeEgresado(x);
    if (!y) continue;
    conteoPorAnio.set(y, (conteoPorAnio.get(y) ?? 0) + 1);
  }

  const pares = Array.from(conteoPorAnio.entries()).sort((a, b) => b[0] - a[0]);
  const top = pares.slice(0, 6);
  const otros = pares.slice(6);

  const labelsAnios = top.map(([anio]) => anio.toString());
  const countsAnios = top.map(([, c]) => c);

  if (otros.length > 0) {
    const sumOtros = otros.reduce((acc, [, c]) => acc + c, 0);
    labelsAnios.push('Otros');
    countsAnios.push(sumOtros);
  }

  const total = arr.length || 1;
  const porcentajes = countsAnios.map((c) => Math.round((c / total) * 100));

  const palette = ['#0F766E', '#2563EB', '#7C3AED', '#DB2777', '#EA580C', '#16A34A', '#64748B'];

  const donutAnioData = {
    labels: labelsAnios.map((l, idx) => `${l} (${porcentajes[idx]}%)`),
    datasets: [
      {
        data: countsAnios,
        backgroundColor: labelsAnios.map((_, i) => palette[i % palette.length]),
        hoverBackgroundColor: labelsAnios.map((_, i) => palette[i % palette.length]),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  return { donutSituacionData, donutDocsData, donutAnioData };
}

/**
 * ✅ FIX: tu componente espera:
 *  - cohortes.cohortesOptions
 *  - cohortes.anios
 */
export function buildCohortesOptions(egresados: any[]): { cohortesOptions: { label: string; value: number }[]; anios: number[] } {
  const arr = Array.isArray(egresados) ? egresados : [];
  const setAnios = new Set<number>();

  for (const e of arr) {
    const y = obtenerAnioFinDesdeEgresado(e);
    if (y) setAnios.add(y);
  }

  const anios = Array.from(setAnios.values()).sort((a, b) => b - a);

  const cohortesOptions = anios.map((y) => ({ label: y.toString(), value: y }));

  return { cohortesOptions, anios };
}

export function buildCohorteDashboard(egresados: any[], cohorte: number | null) {
  const arr = Array.isArray(egresados) ? egresados : [];
  const lista = cohorte ? arr.filter((x) => obtenerAnioFinDesdeEgresado(x) === cohorte) : [];

  const stats = recalcularStats(lista);

  const conDocs = lista.filter((x) => (x?.documentos?.length ?? 0) > 0).length;
  const porcentajeConDocs = stats.total ? Math.round((conDocs / stats.total) * 100) : 0;

  // ✅ Bar Situación cohorte (con colores)
  const barSituacionCohorteData = {
    labels: ['Trabajando', 'Cesante', 'Otro'],
    datasets: [
      {
        label: `Cohorte ${cohorte ?? ''}`,
        data: [stats.trabajando, stats.cesante, stats.otro],
        backgroundColor: ['#22c55e', '#ef4444', '#f59e0b'],
        hoverBackgroundColor: ['#16a34a', '#dc2626', '#d97706'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  // ✅ Donut Rentas cohorte (con colores)
  const conteoRentas = new Map<string, number>();
  for (const x of lista) {
    const k = (x?.nivelRentas ?? 'Sin info').toString();
    conteoRentas.set(k, (conteoRentas.get(k) ?? 0) + 1);
  }

  const labelsRentas = Array.from(conteoRentas.keys());
  const countsRentas = labelsRentas.map((k) => conteoRentas.get(k) ?? 0);

  const rentasPalette = ['#0F766E', '#2563EB', '#7C3AED', '#DB2777', '#EA580C', '#16A34A', '#0369A1', '#64748B'];

  const donutRentasCohorteData = {
    labels: labelsRentas,
    datasets: [
      {
        data: countsRentas,
        backgroundColor: labelsRentas.map((_, i) => rentasPalette[i % rentasPalette.length]),
        hoverBackgroundColor: labelsRentas.map((_, i) => rentasPalette[i % rentasPalette.length]),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  return {
    kpiCohorte: {
      total: stats.total,
      trabajando: stats.trabajando,
      cesante: stats.cesante,
      otro: stats.otro,
      conDocs,
      porcentajeConDocs,
    },
    barSituacionCohorteData,
    donutRentasCohorteData,
  };
}
