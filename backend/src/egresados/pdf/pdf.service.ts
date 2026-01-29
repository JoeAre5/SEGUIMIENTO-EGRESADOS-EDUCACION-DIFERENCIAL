import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as Handlebars from 'handlebars';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

type FichaInput = {
  egresado: any;
  generadoEn: Date;
};

@Injectable()
export class PdfService {
  private readonly primary = '#1E5AA8';
  private readonly primarySoft = '#E8F0FF';

  private assetToDataUri(filename: string): string | null {
    const p = join(process.cwd(), 'documents', 'assets', filename);
    if (!existsSync(p)) return null;
    const buf = readFileSync(p);
    const ext = filename.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
    return `data:image/${ext};base64,${buf.toString('base64')}`;
  }

  private formatCLP(value: number | null | undefined): string {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) return '—';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(Number(value));
  }

  private formatDate(d: Date | string | null | undefined): string {
    if (!d) return '—';
    const date = typeof d === 'string' ? new Date(d) : d;
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  private escape(s: any): string {
    if (s === null || s === undefined) return '';
    return String(s);
  }

  private async htmlToPdfBuffer(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '16mm', right: '14mm', bottom: '16mm', left: '14mm' },
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  // -------------------------
  // FICHA
  // -------------------------
  async generarFichaEgresadoPdf(input: FichaInput): Promise<Buffer> {
    const logoUta = this.assetToDataUri('logo_uta.png');
    const logoCarrera = this.assetToDataUri('logo_carrera.png');

    const e = input.egresado ?? {};
    const est = e.Estudiante ?? {};
    const plan = est.Plan ?? {};
    const docs = Array.isArray(e.documentos) ? e.documentos : [];
    const email = (e.emailContacto ?? est.email ?? est.correo ?? null) as string | null;


    const template = Handlebars.compile(`
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Ficha de Egresado</title>
  <style>
    :root {
      --primary: {{primary}};
      --primarySoft: {{primarySoft}};
      --text: #0F172A;
      --muted: #475569;
      --border: #E2E8F0;
      --card: #FFFFFF;
    }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: var(--text); font-size: 12px; background:#fff; }

    .header {
      display:grid;
      grid-template-columns: 1fr auto 1fr;
      align-items:center;
      gap: 10px;
      padding-bottom: 10px;
      border-bottom: 2px solid var(--primary);
    }
    .logoLeft { display:flex; justify-content:flex-start; }
    .logoRight { display:flex; justify-content:flex-end; }
    .logo { height: 62px; width:auto; object-fit:contain; }
    .headerCenter { text-align:center; }
    .headerCenter h1 { margin:0; font-size: 18px; }
    .headerCenter p { margin:4px 0 0; color: var(--muted); font-size: 11px; }

    .card {
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 14px;
      margin: 12px 0;
      background: var(--card);
    }
    .sectionTitle {
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 10px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .4px;
    }
    .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 10px 18px; }
    .item { display:flex; gap: 8px; }
    .k { min-width: 140px; color: var(--muted); font-weight: 700; }
    .v { color: var(--text); }
    .badge {
      display:inline-block; padding: 2px 10px; border-radius: 999px;
      font-weight: 700; font-size: 11px;
      background: var(--primarySoft); color: var(--primary); border: 1px solid #C7DAFF;
    }
    .table { width: 100%; border-collapse: collapse; margin-top: 6px; }
    .table th, .table td { border: 1px solid var(--border); padding: 8px 10px; text-align: left; }
    .table th { background: #F8FAFC; font-weight: 700; }
    .footer { margin-top: 14px; font-size: 10px; color:#64748B; text-align:center; }
  
    .grid2 { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
    .bars { display:flex; flex-direction:column; gap: 8px; margin-top: 8px; }
    /* Barras "tipo gráfico" compatibles con PDF (evita CSS grid para no cortar líneas) */
    .barRow { display:flex; align-items:center; gap: 8px; }
    .barLbl { width: 150px; color: var(--muted); font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .barWrap { flex: 1; height: 10px; background: #EEF2FF; border: 1px solid var(--border); border-radius: 999px; overflow:hidden; }
    .barFill { height: 100%; background: var(--primary); border-radius: 999px; }
    .barFill.male { background: #4F8CFF; }
    .barFill.female { background: #FF7EB6; }
    .barFill.other { background: #94A3B8; }
    .barFill.primary { background: var(--primary); }
    .barVal { width: 40px; text-align:right; font-weight: 700; }

    .distCompact { font-size: 11px; color: var(--text); line-height: 1.25; }
    .distRow { display:grid; grid-template-columns: 110px 1fr 34px; gap: 6px; align-items:center; }
    .distLbl { font-size: 11px; color: var(--muted); }
    .distBarWrap { height: 8px; background: #EEF2FF; border: 1px solid var(--border); border-radius: 999px; overflow:hidden; }
    .distBar { height: 100%; background: var(--primary); }
    .distVal { text-align:right; font-weight:700; font-size: 11px; }
</style>
</head>
<body>

  <div class="header">
    <div class="logoLeft">
      {{#if logoUta}}<img class="logo" src="{{logoUta}}" alt="Universidad de Tarapacá" />{{/if}}
    </div>
    <div class="headerCenter">
      <h1>Ficha de Egresado</h1>
      <p>Generado el {{generadoEn}}</p>
    </div>
    <div class="logoRight">
      {{#if logoCarrera}}<img class="logo" src="{{logoCarrera}}" alt="Pedagogía en Educación Diferencial" />{{/if}}
    </div>
  </div>

  <div class="card">
    <div class="sectionTitle">Identificación</div>
    <div class="grid">
      <div class="item"><div class="k">Nombre</div><div class="v">{{nombre}}</div></div>
      <div class="item"><div class="k">RUT</div><div class="v">{{rut}}</div></div>
      <div class="item"><div class="k">Plan / Carrera</div><div class="v">{{planTitulo}}</div></div>
      <div class="item"><div class="k">Código plan</div><div class="v">{{planCodigo}}</div></div>
      <div class="item"><div class="k">Cohorte (año fin)</div><div class="v">{{anioFinEstudios}}</div></div>
      <div class="item"><div class="k">Situación actual</div><div class="v"><span class="badge">{{situacionActual}}</span></div></div>
      <div class="item"><div class="k">Teléfono</div><div class="v">{{telefono}}</div></div>
      <div class="item"><div class="k">Correo</div><div class="v">{{correo}}</div></div>
      <div class="item"><div class="k">Empresa</div><div class="v">{{empresa}}</div></div>
      <div class="item"><div class="k">Cargo</div><div class="v">{{cargo}}</div></div>
      <div class="item"><div class="k">Nivel de rentas</div><div class="v">{{nivelRentas}}</div></div>
      <div class="item"><div class="k">—</div><div class="v"></div></div>
    </div>
  </div>

  <div class="card">
    <div class="sectionTitle">Documentos asociados</div>
    {{#if documentos.length}}
      <table class="table">
        <thead>
          <tr>
            <th style="width: 80px;">ID</th>
            <th>Nombre</th>
          </tr>
        </thead>
        <tbody>
          {{#each documentos}}
            <tr>
              <td>{{idDocumento}}</td>
              <td>{{nombre}}</td>
            </tr>
          {{/each}}
        </tbody>
      </table>
    {{else}}
      <div style="color:#64748B;">No registra documentos.</div>
    {{/if}}
  </div>

  <div class="card">
    <div class="sectionTitle">Gráficas</div>
    <div class="grid2">
      <div>
        <div class="muted"><b>Distribución por género</b></div>
        <div class="bars">
          {{#each genero}}
            <div class="barRow">
              <div class="barLbl">{{label}} ({{pct}}%)</div>
              <div class="barWrap"><div class="barFill {{className}}" style="width: {{barPctOfMax}}%;"></div></div>
              <div class="barVal">{{count}}</div>
            </div>
          {{/each}}
        </div>
      </div>
      <div>
        <div class="muted"><b>Egresados por cohorte</b></div>
        <div class="bars">
          {{#each cohortesGraf}}
            <div class="barRow">
              <div class="barLbl">{{label}}</div>
              <div class="barWrap"><div class="barFill {{className}}" style="width: {{barPctOfMax}}%;"></div></div>
              <div class="barVal">{{count}}</div>
            </div>
          {{/each}}
        </div>
      </div>



  <div class="footer">
    Documento generado automáticamente por el sistema de Seguimiento de Egresados.
  </div>

</body>
</html>
`);

    const html = template({
      primary: this.primary,
      primarySoft: this.primarySoft,
      logoUta,
      logoCarrera,
      generadoEn: this.formatDate(input.generadoEn),

      nombre: this.escape(est.nombreCompleto) || '—',
      rut: this.escape(est.rut) || '—',
      planTitulo: this.escape(plan.titulo) || '—',
      planCodigo: this.escape(plan.codigo) || '—',

      anioFinEstudios: e.anioFinEstudios ?? '—',
      situacionActual: this.escape(e.situacionActual) || 'Otro',

      telefono: this.escape(e.telefono) || '—',
      correo: this.escape(email) || '—',

      empresa: this.escape(e.empresa) || '—',
      cargo: this.escape(e.cargo) || '—',
      nivelRentas: this.escape(e.nivelRentas) || '—',

      documentos: docs.map((d: any) => ({ idDocumento: d.idDocumento, nombre: d.nombre })),
    });

    return this.htmlToPdfBuffer(html);
  }

  // -------------------------
  // REPORTE
  // -------------------------
  async generarReporteCohortesPdf(data: any): Promise<Buffer> {
    const logoUta = this.assetToDataUri('logo_uta.png');
    const logoCarrera = this.assetToDataUri('logo_carrera.png');
    const genero = (Array.isArray(data?.graficas?.genero) ? data.graficas.genero : []).map((g: any) => {
      const lbl = (g?.label ?? '').toString().toLowerCase();
      const className = lbl.startsWith('m') ? 'male' : lbl.startsWith('f') ? 'female' : 'other';
      return { ...g, className };
    });
    const cohortesGraf = (Array.isArray(data?.graficas?.cohortes) ? data.graficas.cohortes : []).map((c: any) => ({
      ...c,
      className: 'primary',
    }));


    const cohortes = Array.isArray(data?.cohortes) ? data.cohortes : [];
    const cohortesVm = cohortes.map((c: any) => ({
      ...c,
      sueldoStats: {
        ...c.sueldoStats,
        medianStr: this.formatCLP(c?.sueldoStats?.median),
        avgStr: this.formatCLP(c?.sueldoStats?.avg),
        // Compacto para tabla + barra proporcional (mini-gráfico)
        bucketsArr: (() => {
          const arr = [
            { label: '< $500.000', key: '< $500.000' },
            { label: '$500k–$699k', key: '$500.000 – $699.999' },
            { label: '$700k–$899k', key: '$700.000 – $899.999' },
            { label: '$900k–$1.199k', key: '$900.000 – $1.199.999' },
            { label: '≥ $1.200.000', key: '≥ $1.200.000' },
          ].map((x) => ({
            label: x.label,
            value: c?.sueldoStats?.buckets?.[x.key] ?? 0,
          }));

          const max = Math.max(...arr.map((x) => x.value), 1);
          return arr.map((x) => ({
            ...x,
            barPctOfMax: Math.round((x.value / max) * 100),
          }));
        })(),
        bucketsCompact: (() => {
          const all = [
            { label: '< $500.000', key: '< $500.000' },
            { label: '$500k–$699k', key: '$500.000 – $699.999' },
            { label: '$700k–$899k', key: '$700.000 – $899.999' },
            { label: '$900k–$1.199k', key: '$900.000 – $1.199.999' },
            { label: '≥ $1.200.000', key: '≥ $1.200.000' },
          ]
            .map((x) => ({ label: x.label, value: c?.sueldoStats?.buckets?.[x.key] ?? 0 }))
            .filter((x) => x.value > 0)
            .sort((a, b) => b.value - a.value);

          if (!all.length) return '—';

          const shown = all.slice(0, 2).map((x) => `${x.label} (${x.value})`);
          const rest = all.length - shown.length;
          if (rest > 0) shown.push(`+ ${rest} tramos`);
          return shown.join(' · ');
        })(),
      },
    }));

    const template = Handlebars.compile(`
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Reporte de Egresados por Cohorte</title>
  <style>
    :root {
      --primary: {{primary}};
      --primarySoft: {{primarySoft}};
      --text: #0F172A;
      --muted: #475569;
      --border: #E2E8F0;
      --card: #FFFFFF;
    }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: var(--text); font-size: 12px; background:#fff; }

    .header {
      display:grid;
      grid-template-columns: 1fr auto 1fr;
      align-items:center;
      gap: 10px;
      padding-bottom: 10px;
      border-bottom: 2px solid var(--primary);
    }
    .logoLeft { display:flex; justify-content:flex-start; }
    .logoRight { display:flex; justify-content:flex-end; }
    .logo { height: 62px; width:auto; object-fit:contain; }
    .headerCenter { text-align:center; }
    .headerCenter h1 { margin:0; font-size: 18px; }
    .headerCenter p { margin:4px 0 0; color: var(--muted); font-size: 11px; }

    .card { border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; margin: 12px 0; background: var(--card); }

    .metrics { display:grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .metric { border-radius: 12px; padding: 10px 12px; border: 1px solid #C7DAFF; background: var(--primarySoft); }
    .metric .k { color: var(--primary); font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: .35px; }
    .metric .v { font-size: 18px; font-weight: 900; margin-top: 2px; color: #0B2A55; }

    .sectionTitle { font-weight: 800; color: var(--primary); margin-bottom: 10px; font-size: 12px; text-transform: uppercase; letter-spacing: .4px; }

    .table { width: 100%; border-collapse: collapse; margin-top: 6px; }
    .table th, .table td { border: 1px solid var(--border); padding: 8px 10px; text-align: left; vertical-align: top; }
    .table th { background: #F8FAFC; font-weight: 800; }

    .pill { display:inline-block; padding: 2px 10px; border-radius: 999px; font-weight: 900; font-size: 11px; border: 1px solid #C7DAFF; background: #fff; color: var(--primary); }

    .dist { width: 100%; border-collapse: collapse; }
    .dist td { padding: 2px 6px; border: none; }
    .dist .lbl { color: #334155; font-weight: 700; white-space: nowrap; }
    .dist .val { color: #0F172A; font-weight: 900; text-align: right; width: 28px; }

    .muted { color:#64748B; font-size: 11px; }
    .footer { margin-top: 14px; font-size: 10px; color:#64748B; text-align:center; }
  </style>
</head>
<body>

  <div class="header">
    <div class="logoLeft">
      {{#if logoUta}}<img class="logo" src="{{logoUta}}" alt="Universidad de Tarapacá" />{{/if}}
    </div>
    <div class="headerCenter">
      <h1>Reporte Analítico de Egresados por Cohorte</h1>
      <p>Periodo analizado: <b>{{from}}</b> a <b>{{to}}</b> — Generado el {{generadoEn}}</p>
    </div>
    <div class="logoRight">
      {{#if logoCarrera}}<img class="logo" src="{{logoCarrera}}" alt="Pedagogía en Educación Diferencial" />{{/if}}
    </div>
  </div>

  <div class="card">
    <div class="metrics">
      <div class="metric"><div class="k">Total egresados</div><div class="v">{{resumen.totalEgresados}}</div></div>
      <div class="metric"><div class="k">Total trabajando</div><div class="v">{{resumen.totalTrabajando}}</div></div>
      <div class="metric"><div class="k">Empleabilidad global</div><div class="v">{{resumen.empleabilidadGlobalPct}}%</div></div>
      <div class="metric"><div class="k">Con documentos</div><div class="v">{{resumen.docsGlobalPct}}%</div></div>
    </div>
  </div>

  </div>
  </div>

  <div class="card">
    <div class="sectionTitle">Indicadores por cohorte</div>

    <table class="table">
      <thead>
        <tr>
          <th style="width:80px;">Cohorte</th>
          <th style="width:70px;">Total Egresados</th>
          <th style="width:120px;">Empleabilidad</th>
          <th style="width:120px;">Docs respaldo</th>
          <th style="width:140px;">Renta mediana (est.)</th>
          <th style="width:140px;">Renta promedio (est.)</th>
          <th>Distribución (Nivel de rentas)</th>
        </tr>
      </thead>
      <tbody>
        {{#each cohortes}}
          <tr>
            <td><b>{{anio}}</b></td>
            <td>{{total}}</td>
            <td><span class="pill">{{empleabilidadPct}}%</span></td>
            <td><span class="pill">{{docsPct}}%</span></td>
            <td>{{sueldoStats.medianStr}}</td>
            <td>{{sueldoStats.avgStr}}</td>
            <td>
              <div class="distCompact">{{sueldoStats.bucketsCompact}}</div>
            </td>
          </tr>
        {{/each}}
      </tbody>
    </table>

    <div class="muted" style="margin-top:10px;">
      Nota: Mediana y promedio estimados usando el mínimo del rango declarado en Nivel de rentas. Si aparece “—”, significa que no hay Nivel de rentas informado para esa cohorte.
    </div>
  </div>

  <div class="footer">
    Documento generado automáticamente por el sistema de Seguimiento de Egresados.
  </div>

</body>
</html>
`);

    const html = template({
      primary: this.primary,
      primarySoft: this.primarySoft,
      logoUta,
      logoCarrera,
      from: data?.from ?? '—',
      to: data?.to ?? '—',
      generadoEn: this.formatDate(data?.generadoEn),
      resumen: data?.resumen ?? { totalEgresados: 0, totalTrabajando: 0, empleabilidadGlobalPct: 0, docsGlobalPct: 0 },
      genero,
      cohortesGraf,
      cohortes: cohortesVm,
    });

    return this.htmlToPdfBuffer(html);
  }
}