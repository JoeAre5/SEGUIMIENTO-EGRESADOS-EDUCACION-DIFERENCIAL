import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

// ✅ Animaciones Angular
import { animate, style, transition, trigger } from '@angular/animations';

import { TableModule, Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ChartModule } from 'primeng/chart';
import { InputNumberModule } from 'primeng/inputnumber';

import { applyGlobalFilter, getSituacionSeverity } from '../_refactor/helpers.util';

@Component({
  selector: 'app-egresados-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    TagModule,
    ButtonModule,
    TooltipModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    ChartModule,
    InputNumberModule,
  ],
  templateUrl: './egresados-dashboard.component.html',
  animations: [
    trigger('fadeSlide', [
      transition('* => *', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('240ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('kpiPop', [
      transition('* => *', [
        style({ opacity: 0, transform: 'translateY(6px) scale(0.985)' }),
        animate('240ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
    ]),
    trigger('chartFade', [
      transition('* => *', [
        style({ opacity: 0, transform: 'translateY(6px)' }),
        animate('220ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class EgresadosDashboardComponent {
  // ====== Table ref (para dt.clear(), filtros, etc.) ======
  @ViewChild('dt') dt!: Table;

  // ====== Inputs ======
  @Input() isEgresado = false;

  @Input() egresados: any[] = [];
  @Input() loading = false;

  @Input() stats!: { total: number; trabajando: number; cesante: number; otro: number };

  @Input() donutOptions: any;
  @Input() donutSituacionData: any;
  @Input() donutDocsData: any;
  @Input() donutAnioData: any;

  @Input() cohortesOptions: { label: string; value: number }[] = [];
  @Input() cohorteSeleccionada: number | null = null;

  @Input() kpiCohorte: any;
  @Input() chartOptionsCohorte: any;
  @Input() barSituacionCohorteData: any;
  @Input() donutRentasCohorteData: any;

  @Input() filtrosConfig: any[] = [];
  @Input() filtroValores: Record<string, any> = {};

  @Input() modalFiltrosVisible = false;
  @Input() modalDocsVisible = false;
  @Input() documentosModal: any[] = [];

  // opciones dropdown (se las pedimos al padre con callback)
  @Input() getDropdownOptions!: (key?: string) => any[];

  // ====== Outputs (acciones) ======
  @Output() abrirFormularioNuevo = new EventEmitter<void>();
  @Output() abrirEdicion = new EventEmitter<any>();
  @Output() eliminar = new EventEmitter<any>();

  @Output() abrirModalDocumentos = new EventEmitter<any>();
  @Output() cerrarModalDocumentos = new EventEmitter<void>();

  // ✅ emitimos el valor seleccionado (number|null)
  @Output() onCohorteChange = new EventEmitter<number | null>();

  // ✅ binding “two-way” real hacia el padre (opcional, pero útil)
  @Output() cohorteSeleccionadaChange = new EventEmitter<number | null>();

  @Output() modalFiltrosVisibleChange = new EventEmitter<boolean>();
  @Output() filtroValoresChange = new EventEmitter<Record<string, any>>();

  // ====== Outputs (documentos) ======
  @Output() verDocumento = new EventEmitter<any>();
  @Output() descargarDocumento = new EventEmitter<any>();
  @Output() eliminarDocumento = new EventEmitter<any>();

  // ====== Anim keys (para que Angular dispare transiciones) ======
  dashboardAnimKey = 0;
  kpiAnimKey = 0;
  chartsAnimKey = 0;

  // ✅ Forzar re-render de <p-chart> para que se vea la animación de Chart.js al cambiar cohorte
  chartsVisible = true;

  // ====== UI helpers ======
  severity(s: any) {
    return getSituacionSeverity(s);
  }

  onGlobalFilter(event: any) {
    applyGlobalFilter(this.dt, event, 'contains');
  }

  clearFilters() {
    this.dt?.clear();
  }

  // ✅ handler correcto para cambio de cohorte (dropdown)
  onCohorteDropdownChange(valor: any) {
    const n =
      valor === null || valor === undefined || valor === ''
        ? null
        : Number(valor);

    const finalValue = n !== null && Number.isFinite(n) ? n : null;

    // actualiza estado local (para que el dropdown muestre el valor)
    this.cohorteSeleccionada = finalValue;

    // emite hacia el padre
    this.cohorteSeleccionadaChange.emit(finalValue);
    this.onCohorteChange.emit(finalValue);

    // ✅ dispara animaciones sin tocar nada más
    this.dispararAnimacionCohorte();
  }

  private dispararAnimacionCohorte() {
    this.dashboardAnimKey++;
    this.kpiAnimKey++;
    this.chartsAnimKey++;

    // Re-montar charts para que Chart.js haga “enter animation”
    this.chartsVisible = false;
    setTimeout(() => (this.chartsVisible = true), 0);
  }

  // range filter (mismo comportamiento que tenías)
  onRangoFiltroChange(field: string, tipo: 'min' | 'max', valor: any) {
    const v = valor === '' || valor === undefined ? null : valor;

    const nuevo = {
      ...this.filtroValores,
      [field]: {
        ...(this.filtroValores[field] || {}),
        [tipo]: v,
      },
    };

    this.filtroValores = nuevo;
    this.filtroValoresChange.emit(nuevo);

    const min = nuevo[field]?.min ?? null;
    const max = nuevo[field]?.max ?? null;

    this.dt.filter([min, max], field, 'between');
  }

  setModalFiltrosVisible(v: boolean) {
    this.modalFiltrosVisible = v;
    this.modalFiltrosVisibleChange.emit(v);
  }

  closeDocsModal() {
    this.modalDocsVisible = false;
    this.cerrarModalDocumentos.emit();
  }
}
