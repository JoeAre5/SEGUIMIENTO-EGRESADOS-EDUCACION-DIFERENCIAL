import { Component, OnInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

// ✅ Animaciones Angular
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
  animateChild,
} from '@angular/animations';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';

import { TableModule, Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { SidebarModule } from 'primeng/sidebar';

// ✅ Charts
import { ChartModule } from 'primeng/chart';

// ✅ RadioButton
import { RadioButtonModule } from 'primeng/radiobutton';

import { EgresadosService, UpdateEgresadoDto } from '../../services/egresados.service';

import {
  EstudiantesService,
  EstudianteDTO,
  CreateEstudianteDTO,
  UpdateEstudianteDTO,
} from '../../services/estudiantes.service';

import { switchMap, of, Observable, map, lastValueFrom } from 'rxjs';

// ✅ (opcional) roles type
import { Roles } from '../../models/login.dto';

// ✅ Refactor definitivo (según tu estructura)
import * as DashboardUtil from './_refactor/dashboard.util';
import * as Mapper from './_refactor/egresado-form.mapper';
import { buildFormDataFromRaw, actualizarPlanSiCambia$ } from './_refactor/egresado-save.facade';

import * as Helpers from './_refactor/helpers.util';
import { EgresadosDashboardComponent } from './ui/egresados-dashboard.component';

import * as JwtUtil from '../../utils/jwt.util';
import * as SsrStorage from '../../utils/ssr-storage.util';

interface PlanDTO {
  idPlan: number;
  codigo: number;
  titulo: string;
  agnio: number;
}

@Component({
  selector: 'app-seguimiento-egresados',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EgresadosDashboardComponent,
    FormsModule,
    CardModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    InputNumberModule,
    ButtonModule,
    ToastModule,
    TableModule,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
    DialogModule,
    SidebarModule,
    ChartModule,
    RadioButtonModule,
  ],
  templateUrl: './seguimiento-egresados.component.html',
  styleUrls: ['./seguimiento-egresados.component.css'],
  animations: [
    trigger('pageEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('320ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('fadeHeader', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-6px)' }),
        animate('260ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('cardsStagger', [
      transition(':enter', [query('@cardItem', stagger(70, animateChild()), { optional: true })]),
      transition('* => *', [query('@cardItem', stagger(70, animateChild()), { optional: true })]),
    ]),
    trigger('cardItem', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px) scale(0.98)' }),
        animate('260ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
    ]),
    trigger('sidebarStagger', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(10px)' }),
        animate('220ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class SeguimientoEgresadosComponent implements OnInit {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('dt') dt!: Table;

  formulario!: FormGroup;

  documentosSeleccionados: File[] = [];
  documentosExistentes: any[] = [];

  egresados: any[] = [];
  estudiantes: EstudianteDTO[] = [];
  loading = true;

  estudianteSeleccionado: EstudianteDTO | null = null;
  modoEstudiante: 'existente' | 'nuevo' = 'existente';

  existeSeguimiento = false;

  modalDocsVisible = false;
  documentosModal: any[] = [];

  modalFiltrosVisible = false;
  filtroValores: Record<string, any> = {};

  excelImportEstado = '';

  // ✅ CONSENTIMIENTO (tu modal)
  consentimientoVisible = false;
  consentimientoEstado: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO' = 'PENDIENTE';
  consentimientoCargando = false;

  // ✅ SSR
  private readonly isBrowser: boolean;

  // ✅ modo EGRESADO
  public EGRESADO = 'Egresado';
  public isEgresado = false;
  private idEstudianteToken: number | null = null;

  // ✅ FIX CONSENTIMIENTO: cache local para que NO reaparezca
  private consentimientoCacheAceptado = false;

  nivelesRentasOptions = [
    { label: 'Sueldo mínimo ($500.000)', value: 'Sueldo mínimo ($500.000)' },
    { label: 'Entre $500.001 y $1.000.000', value: 'Entre $500.001 y $1.000.000' },
    { label: 'Entre $1.000.001 y $1.500.000', value: 'Entre $1.000.001 y $1.500.000' },
    { label: 'Más de $1.500.001', value: 'Más de $1.500.001' },
  ];

  viasIngreso = [
    { label: 'PSU/PAES', value: 'PSU/PAES' },
    { label: 'CFT', value: 'CFT' },
    { label: 'PACE', value: 'PACE' },
    { label: 'Propedéutico', value: 'Propedéutico' },
    { label: 'Otro', value: 'Otro' },
  ];

  generos = [
    { label: 'Femenino', value: 'Femenino' },
    { label: 'Masculino', value: 'Masculino' },
    { label: 'Prefiero no decirlo', value: 'Prefiero no decirlo' },
  ];

  tiemposBusquedaTrabajo = [
    { label: 'Menos de 2 meses', value: 'Menos de 2 meses' },
    { label: 'Entre 2 a 6 meses', value: 'Entre 2 a 6 meses' },
    { label: 'Entre 6 meses y 1 año', value: 'Entre 6 meses y 1 año' },
    { label: 'Más de 1 año', value: 'Más de 1 año' },
    { label: 'No he encontrado trabajo', value: 'No he encontrado trabajo' },
  ];

  sectoresLaborales = [
    { label: 'Público', value: 'Público' },
    { label: 'Privado', value: 'Privado' },
    { label: 'Otro', value: 'Otro' },
  ];

  tipoEstablecimiento = [
    { label: 'Del Estado', value: 'Del Estado' },
    { label: 'Particular subvencionado', value: 'Particular subvencionado' },
    { label: 'Particular', value: 'Particular' },
    { label: 'No aplica', value: 'No aplica' },
    { label: 'Otro', value: 'Otro' },
  ];

  filtrosConfig = [
    { label: 'Situación', field: 'situacionActual', type: 'dropdown', dropdownKey: 'situacion' },
    { label: 'Empresa', field: 'empresa', type: 'text', placeholder: 'Ej: Google' },
    { label: 'Cargo', field: 'cargo', type: 'text', placeholder: 'Ej: Ingeniero' },
    { label: 'Nivel de Rentas', field: 'nivelRentas', type: 'dropdown', dropdownKey: 'nivelRentas' },
    { label: 'Teléfono', field: 'telefono', type: 'text', placeholder: 'Ej: +56 9 12345678' },
    { label: 'Email', field: 'emailContacto', type: 'text', placeholder: 'Ej: nombre@dominio.cl' },
  ];

  drawerFormulario = false;

  planes: PlanDTO[] = [];
  planesOptions: { label: string; value: number }[] = [];

  public planSeleccionadoId: number | null = null;
  public planOriginalId: number | null = null;

  situaciones = [
    { label: 'Trabajando', value: 'Trabajando' },
    { label: 'Cesante', value: 'Cesante' },
    { label: 'Otro', value: 'Otro' },
  ];

  intentoGuardar = false;

  nuevoEstudiante: CreateEstudianteDTO = {
    rut: '',
    nombre: '',
    apellido: '',
    nombreSocial: '',
    agnioIngreso: undefined,
    idPlan: undefined,
  };

  private readonly PHONE_8_REGEX = /^(\+?\d{1,3}\s?)?\d{8}$/;
  private readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  private readonly LINKEDIN_REGEX =
    /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[A-Za-z0-9-_%]+\/?(\?.*)?$/i;

  readonly CURRENT_YEAR = new Date().getFullYear();
  readonly MIN_ANIO_INGRESO = 1980;
  readonly MAX_ANIO_INGRESO = this.CURRENT_YEAR;

  rutDuplicadoNuevo = false;
  rutDuplicadoExistente = false;
  anioIngresoInvalidoNuevo = false;

  stats = { total: 0, trabajando: 0, cesante: 0, otro: 0 };

  donutSituacionData: any;
  donutDocsData: any;
  donutAnioData: any;
  donutOptions: any;

  cohortesOptions: { label: string; value: number }[] = [];
  cohorteSeleccionada: number | null = null;

  kpiCohorte = {
    total: 0,
    trabajando: 0,
    cesante: 0,
    otro: 0,
    conDocs: 0,
    porcentajeConDocs: 0,
  };

  chartOptionsCohorte: any;
  barSituacionCohorteData: any;
  donutRentasCohorteData: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private egresadosService: EgresadosService,
    private estudiantesService: EstudiantesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.crearFormulario();

    // ✅ token/JWT solo en browser
    if (this.isBrowser) {
      const token = this.getTokenSafe();
      const payload = this.decodeJwtSafe(token);
      const role = payload?.role as Roles | undefined;

      const rawIdEst =
        payload?.idEstudiante ?? payload?.id_estudiante ?? payload?.estudianteId ?? null;

      const parsed = rawIdEst !== null && rawIdEst !== undefined ? Number(rawIdEst) : NaN;

      this.idEstudianteToken = Number.isFinite(parsed) && parsed > 0 ? parsed : null;

      this.isEgresado = role === (this.EGRESADO as any) || role === ('EGRESADO' as any);

      // ✅ FIX CONSENTIMIENTO (AJUSTE): cache existe, pero NO debe bloquear para siempre si BD cambió
      this.consentimientoCacheAceptado = this.readConsentimientoCache() === 'ACEPTADO';

      // ✅ NO aplicamos estado aquí de forma definitiva; lo decide verificarConsentimientoEgresado()
      // (esto permite que si cambiaste BD a PENDIENTE/RECHAZADO, el modal vuelva a aparecer)
    } else {
      this.idEstudianteToken = null;
      this.isEgresado = false;
    }
  }

  // ---------------------------
  // ✅ FIX CONSENTIMIENTO: helpers cache
  // ---------------------------
  private consentimientoCacheKey(): string {
    const id = this.idEstudianteToken ?? 'anon';
    return `consentimiento_egresado_${id}`;
  }

  private readConsentimientoCache(): 'ACEPTADO' | 'RECHAZADO' | 'PENDIENTE' | null {
    if (!this.isBrowser) return null;
    try {
      const v = localStorage.getItem(this.consentimientoCacheKey());
      if (v === 'ACEPTADO' || v === 'RECHAZADO' || v === 'PENDIENTE') return v;
      return null;
    } catch {
      return null;
    }
  }

  private writeConsentimientoCache(v: 'ACEPTADO' | 'RECHAZADO' | 'PENDIENTE') {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(this.consentimientoCacheKey(), v);
    } catch {
      // ignore
    }
  }

  // ✅ NUEVO: borrar cache (para cuando cambias BD a PENDIENTE/RECHAZADO y quieras que aparezca el modal)
  private clearConsentimientoCache() {
    if (!this.isBrowser) return;
    try {
      localStorage.removeItem(this.consentimientoCacheKey());
    } catch {
      // ignore
    }
  }

  // ---------------------------
  // SSR-safe helpers
  // ---------------------------
  private getTokenSafe(): string | null {
    if (!this.isBrowser) return null;

    const maybe = (SsrStorage as any)?.getToken?.() ?? (SsrStorage as any)?.getTokenFromStorage?.();
    if (typeof maybe === 'string' && maybe) return maybe;

    return (
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('access_token') ||
      sessionStorage.getItem('token')
    );
  }

  private decodeJwtSafe(token: string | null): any {
    if (!token || !this.isBrowser) return null;

    const fn =
      (JwtUtil as any)?.decodeJwt ||
      (JwtUtil as any)?.getJwtPayload ||
      (JwtUtil as any)?.decodeToken;

    if (typeof fn === 'function') {
      try {
        return fn(token);
      } catch {
        // fallback
      }
    }

    try {
      const payloadPart = token.split('.')[1];
      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');

      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      this.loading = false;
      return;
    }

    // ✅ SIEMPRE verificar en backend (esto arregla que no reaparezca cuando cambias BD a PENDIENTE/RECHAZADO)
    if (this.isEgresado) {
      this.verificarConsentimientoEgresado();
    }

    this.chartOptionsCohorte = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } },
        tooltip: { enabled: true },
      },
      scales: { x: { ticks: { autoSkip: false } }, y: { beginAtZero: true } },
    };

    this.cargarPlanes();

    if (this.isEgresado) {
      this.loading = true;
      this.modoEstudiante = 'existente';
      this.drawerFormulario = true;
      this.cargarMiSeguimiento();
      return;
    }

    this.cargarEgresados();
    this.cargarEstudiantes();
  }

  /* ===============================
  CONSENTIMIENTO EGRESADO
  ================================ */

  private aplicarEstadoConsentimiento(estado: any) {
    const st = (estado || 'PENDIENTE') as 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';

    // ✅ AJUSTE CLAVE:
    // Si BD dice PENDIENTE/RECHAZADO, entonces NO puede quedar "aceptado" por cache.
    if (this.isEgresado && st !== 'ACEPTADO') {
      this.consentimientoCacheAceptado = false;
      this.clearConsentimientoCache();
    }

    this.consentimientoEstado = st;

    if (this.isEgresado && st !== 'ACEPTADO') {
      this.consentimientoVisible = true;
      this.formulario.disable({ emitEvent: false });
    } else {
      this.consentimientoVisible = false;
      this.formulario.enable({ emitEvent: false });
    }
  }

  verificarConsentimientoEgresado() {
    if (!this.isEgresado) return;

    // ✅ Siempre consulta backend para que refleje la BD aunque hayas tocado Prisma Studio
    this.egresadosService.getConsentimientoMine().subscribe({
      next: (r: any) => {
        const data = r?.data ? r.data : r;

        const estado =
          data?.consentimientoEstado ??
          data?.estadoConsentimiento ??
          data?.consentimiento ??
          data?.estado ??
          'PENDIENTE';

        // ✅ Si backend confirma ACEPTADO -> cachear
        if (estado === 'ACEPTADO') {
          this.consentimientoCacheAceptado = true;
          this.writeConsentimientoCache('ACEPTADO');
        } else {
          // ✅ Si NO es aceptado -> limpiar cache para que el modal vuelva a salir
          this.consentimientoCacheAceptado = false;
          this.clearConsentimientoCache();
        }

        this.aplicarEstadoConsentimiento(estado);
      },
      error: () => {
        // Si falla, por seguridad lo dejamos pendiente (muestra modal y bloquea)
        this.consentimientoCacheAceptado = false;
        this.clearConsentimientoCache();
        this.aplicarEstadoConsentimiento('PENDIENTE');
      },
    });
  }

  // ✅ FIX CONSENTIMIENTO: aceptar = cerrar + habilitar + cachear
  aceptarConsentimiento() {
    // UX inmediato
    this.consentimientoCargando = true;

    this.consentimientoCacheAceptado = true;
    this.writeConsentimientoCache('ACEPTADO');

    this.aplicarEstadoConsentimiento('ACEPTADO');

    this.egresadosService.setConsentimientoMine(true).subscribe({
      next: (r: any) => {
        const data = r?.data ? r.data : r;
        this.consentimientoCargando = false;

        const estado =
          data?.consentimientoEstado ??
          data?.estadoConsentimiento ??
          data?.consentimiento ??
          data?.estado ??
          'ACEPTADO';

        if (estado === 'ACEPTADO') {
          this.consentimientoCacheAceptado = true;
          this.writeConsentimientoCache('ACEPTADO');
        }

        this.aplicarEstadoConsentimiento('ACEPTADO');
      },
      error: () => {
        // si falla: por seguridad puedes decidir si quieres reabrir o dejar editar.
        // Para cumplir tu requerimiento (que NO se reabra y deje editar), dejamos aceptado.
        this.consentimientoCargando = false;

        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail:
            'Se habilitó el formulario, pero falló guardar el consentimiento en el servidor. Revisa el endpoint.',
        });

        this.consentimientoCacheAceptado = true;
        this.writeConsentimientoCache('ACEPTADO');
        this.aplicarEstadoConsentimiento('ACEPTADO');
      },
    });
  }

  rechazarConsentimiento() {
    this.consentimientoVisible = false;
    this.consentimientoCargando = true;

    // ✅ si rechaza, guardamos cache RECHAZADO (opcional)
    this.consentimientoCacheAceptado = false;
    this.writeConsentimientoCache('RECHAZADO');

    this.egresadosService.setConsentimientoMine(false).subscribe({
      next: () => {
        this.consentimientoCargando = false;

        this.messageService.add({
          severity: 'warn',
          summary: 'Consentimiento no otorgado',
          detail: 'No podrás acceder al formulario sin aceptar el consentimiento.',
        });

        this.volverMenu();
      },
      error: () => {
        this.consentimientoCargando = false;
        this.volverMenu();
      },
    });
  }

  // ---------------------------
  // UI helpers
  // ---------------------------
  isInvalid(controlName: string): boolean {
    const c = this.formulario.get(controlName);
    return !!(c && c.invalid && (c.dirty || c.touched || this.intentoGuardar));
  }

  getError(controlName: string): any {
    return this.formulario.get(controlName)?.errors;
  }

  formHasError(errorKey: string): boolean {
    return !!(this.formulario?.errors?.[errorKey] && (this.formulario.touched || this.intentoGuardar));
  }

  // ---------------------------
  // Form
  // ---------------------------
  crearFormulario() {
    this.formulario = this.fb.group(
      {
        planEstudios: [{ value: '', disabled: true }],

        anioFinEstudios: [
          null,
          [Validators.required, Validators.min(this.MIN_ANIO_INGRESO), Validators.max(this.CURRENT_YEAR + 5)],
        ],

        situacionActual: [null, Validators.required],
        situacionActualOtro: [''],

        empresa: [''],
        cargo: [''],

        nivelRentas: [null, Validators.required],

        viaIngreso: [null],
        viaIngresoOtro: [''],

        anioIngresoCarrera: [null, [Validators.min(this.MIN_ANIO_INGRESO), Validators.max(this.CURRENT_YEAR + 1)]],

        genero: [null],
        tiempoBusquedaTrabajo: [null],

        sectorLaboral: [null],
        sectorLaboralOtro: [''],

        tipoEstablecimiento: ['No aplica'],
        tipoEstablecimientoOtro: [''],

        sueldo: [null],

        anioIngresoLaboral: [null, [Validators.min(this.MIN_ANIO_INGRESO), Validators.max(this.CURRENT_YEAR + 1)]],

        telefono: ['', [Validators.maxLength(20), Validators.pattern(this.PHONE_8_REGEX)]],
        emailContacto: ['', [Validators.maxLength(120), Validators.pattern(this.EMAIL_REGEX)]],
        linkedin: ['', [Validators.maxLength(200), Validators.pattern(this.LINKEDIN_REGEX)]],
      },
      { validators: [this.validarReglasCruzadas()] }
    );
  }

  private validarReglasCruzadas(): ValidatorFn {
    return (control: AbstractControl) => {
      const group = control as FormGroup;

      const anioFin = group.get('anioFinEstudios')?.value;
      const anioIngresoLab = group.get('anioIngresoLaboral')?.value;
      const anioIngresoCarrera = group.get('anioIngresoCarrera')?.value;

      const situacion = group.get('situacionActual')?.value;
      const otro = (group.get('situacionActualOtro')?.value ?? '').toString().trim();

      const via = group.get('viaIngreso')?.value;
      const viaOtro = (group.get('viaIngresoOtro')?.value ?? '').toString().trim();

      const sector = group.get('sectorLaboral')?.value;
      const sectorOtro = (group.get('sectorLaboralOtro')?.value ?? '').toString().trim();

      const tipoEst = group.get('tipoEstablecimiento')?.value;
      const tipoEstOtro = (group.get('tipoEstablecimientoOtro')?.value ?? '').toString().trim();

      const errors: any = {};

      if (anioFin !== null && anioFin !== undefined && anioFin !== '') {
        const fin = Number(anioFin);

        if (
          anioIngresoCarrera !== null &&
          anioIngresoCarrera !== undefined &&
          anioIngresoCarrera !== '' &&
          Number(anioIngresoCarrera) > fin
        ) {
          errors.anioIngresoCarreraMayorQueFin = true;
        }

        if (
          anioIngresoLab !== null &&
          anioIngresoLab !== undefined &&
          anioIngresoLab !== '' &&
          Number(anioIngresoLab) < fin
        ) {
          errors.anioIngresoLaboralMenorQueFin = true;
        }
      }

      if (situacion === 'Otro' && !otro) errors.situacionActualOtroRequerido = true;
      if (via === 'Otro' && !viaOtro) errors.viaIngresoOtroRequerido = true;
      if (sector === 'Otro' && !sectorOtro) errors.sectorLaboralOtroRequerido = true;
      if (tipoEst === 'Otro' && !tipoEstOtro) errors.tipoEstablecimientoOtroRequerido = true;

      return Object.keys(errors).length ? errors : null;
    };
  }

  onTelefonoInput() {
    const c = this.formulario.get('telefono');
    if (!c) return;

    let v = (c.value ?? '').toString();
    v = v.replace(/[^\d+]/g, '');
    if (v.includes('+')) v = '+' + v.replace(/\+/g, '');

    if (v.startsWith('+')) {
      const digits = v.slice(1).replace(/\D/g, '');
      const prefijo = digits.slice(0, 3);
      const local = digits.slice(3).slice(0, 8);
      v = '+' + prefijo + (local.length ? ' ' + local : '');
    } else {
      v = v.replace(/\D/g, '').slice(0, 8);
    }

    c.setValue(v, { emitEvent: false });
  }

  // ---------------------------
  // RUT (libre, con DV, sin validación)
  // ---------------------------
  private sanitizeRutLibre(value: string): string {
    return (value ?? '')
      .toString()
      .replace(/[^0-9kK\.\-]/g, '')
      .replace(/K/g, 'k')
      .slice(0, 12);
  }

  private normalizarRut(rut: string): string {
    const v = (rut ?? '').toString().trim().toLowerCase();
    return v.replace(/\./g, '').replace(/-/g, '').replace(/[^0-9k]/g, '');
  }

  isRutValido(_rutFormateado: string): boolean {
    return true;
  }

  private existeRutEnEstudiantes(rut: string, excluirIdEstudiante?: number | null): boolean {
    const objetivo = this.normalizarRut(rut);
    if (!objetivo) return false;

    return (this.estudiantes ?? []).some((e) => {
      if (excluirIdEstudiante && e.idEstudiante === excluirIdEstudiante) return false;
      return this.normalizarRut(e.rut) === objetivo;
    });
  }

  onRutInputExistente() {
    if (!this.estudianteSeleccionado) return;

    this.estudianteSeleccionado.rut = this.sanitizeRutLibre(
      (this.estudianteSeleccionado.rut as any) ?? ''
    );

    const id = this.estudianteSeleccionado?.idEstudiante ?? null;
    this.rutDuplicadoExistente = this.existeRutEnEstudiantes(this.estudianteSeleccionado.rut, id);
  }

  onRutInputNuevo() {
    this.nuevoEstudiante.rut = this.sanitizeRutLibre((this.nuevoEstudiante.rut as any) ?? '');
    this.rutDuplicadoNuevo = this.existeRutEnEstudiantes(this.nuevoEstudiante.rut);
  }

  private validarAnioIngresoNuevo(): boolean {
    const v = this.nuevoEstudiante?.agnioIngreso;
    if (v === undefined || v === null) return false;
    return !(v < this.MIN_ANIO_INGRESO || v > this.MAX_ANIO_INGRESO);
  }

  // ---------------------------
  // Loads
  // ---------------------------
  cargarEstudiantes() {
    this.estudiantesService.findAll().subscribe({
      next: (data: EstudianteDTO[]) => (this.estudiantes = data),
      error: (err: any) => console.error(err),
    });
  }

  cargarPlanes() {
    this.egresadosService.getPlanesEstudio().subscribe({
      next: (data: any[]) => {
        this.planes = data as PlanDTO[];
        this.planesOptions = this.planes.map((p) => ({
          label: `${p.titulo} (${p.agnio})`,
          value: p.idPlan,
        }));
      },
      error: (err: any) => console.error('❌ ERROR CARGANDO PLANES:', err),
    });
  }

  cargarEgresados() {
    this.loading = true;
    this.egresadosService.findAll().subscribe({
      next: (data: any[]) => {
        this.egresados = data;

        this.stats = DashboardUtil.recalcularStats(this.egresados);
        this.donutOptions = DashboardUtil.buildDonutOptions();

        const charts = DashboardUtil.buildChartsGlobal(this.egresados, this.stats);
        this.donutSituacionData = charts.donutSituacionData;
        this.donutDocsData = charts.donutDocsData;
        this.donutAnioData = charts.donutAnioData;

        const cohortes = DashboardUtil.buildCohortesOptions(this.egresados);
        this.cohortesOptions = cohortes.cohortesOptions;
        if (!this.cohorteSeleccionada && cohortes.anios?.length) {
          this.cohorteSeleccionada = cohortes.anios[0];
        }

        this.recalcularDashboardCohorte();
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  // ---------------------------
  // Seguimiento loader único
  // ---------------------------
  private resetSeguimientoState(opts?: { keepForm?: boolean }) {
    this.existeSeguimiento = false;
    this.documentosExistentes = [];
    this.documentosSeleccionados = [];
    this.rutDuplicadoExistente = false;

    this.planSeleccionadoId = null;
    this.planOriginalId = null;

    this.formulario.get('planEstudios')?.setValue('', { emitEvent: false });

    if (!opts?.keepForm) {
      this.formulario.reset();
      this.formulario.get('planEstudios')?.setValue('', { emitEvent: false });
    }
  }

  private loadSeguimientoByEstudiante(idEstudiante: number, toast = true) {
    this.resetSeguimientoState();

    const svc: any = this.egresadosService as any;

    const obs: Observable<any> =
      this.isEgresado && typeof svc.getMine === 'function'
        ? svc.getMine()
        : this.egresadosService.findOneByEstudiante(idEstudiante);

    this.loading = true;

    obs.subscribe({
      next: (egresado: any) => {
        const eg = egresado?.data ? egresado.data : egresado;

        // ✅ FIX CONSENTIMIENTO: NO vuelvas a llamar verificar aquí (causaba reapertura)
        // Si necesitas forzar, solo si está pendiente y NO hay cache:
        if (this.isEgresado && !this.consentimientoCacheAceptado && this.consentimientoEstado !== 'ACEPTADO') {
          this.verificarConsentimientoEgresado();
        }

        if (!eg || Object.keys(eg).length === 0) {
          this.resetSeguimientoState();
          this.loading = false;
          return;
        }

        this.existeSeguimiento = true;

        const mapped = Mapper.mapEgresadoToFormPatch(eg, this.situaciones);

        const idPlan = mapped?.idPlan ?? null;
        this.planOriginalId = idPlan ? Number(idPlan) : null;
        this.planSeleccionadoId = this.planOriginalId;

        this.formulario.patchValue(mapped.patch);
        this.documentosExistentes = eg.documentos || [];

        if (!this.estudianteSeleccionado && eg?.Estudiante) {
          this.estudianteSeleccionado = eg.Estudiante;
        }

        if (toast) {
          this.messageService.add({
            severity: 'info',
            summary: 'Datos cargados',
            detail: '✅ Formulario rellenado automáticamente.',
          });
        }

        this.loading = false;
      },
      error: () => {
        this.resetSeguimientoState();
        this.loading = false;
      },
    });
  }

  private cargarEstudianteById$(idEstudiante: number): Observable<EstudianteDTO | null> {
    const svc: any = this.estudiantesService as any;

    if (typeof svc.findOne === 'function') return svc.findOne(idEstudiante);
    if (typeof svc.getOne === 'function') return svc.getOne(idEstudiante);
    if (typeof svc.findById === 'function') return svc.findById(idEstudiante);
    if (typeof svc.getById === 'function') return svc.getById(idEstudiante);

    return this.estudiantesService.findAll().pipe(
      map((list: EstudianteDTO[]) => list.find((e) => e.idEstudiante === idEstudiante) ?? null)
    );
  }

  // ---------------------------
  // EGRESADO (mine)
  // ---------------------------
  private cargarMiSeguimiento() {
    const id = this.idEstudianteToken;

    if (!id || Number.isNaN(id)) {
      this.loadSeguimientoByEstudiante(0 as any, true);
      return;
    }

    this.cargarEstudianteById$(id).subscribe({
      next: (est) => {
        if (est) {
          this.estudianteSeleccionado = est;
        }
        this.loadSeguimientoByEstudiante(id, true);
      },
      error: () => {
        this.loadSeguimientoByEstudiante(id, true);
      },
    });
  }

  // ---------------------------
  // UI actions
  // ---------------------------
  normalizarSituacion(valor: any): string | null {
    return Mapper.normalizarSituacion(valor, this.situaciones);
  }

  abrirDrawerFormulario() {
    this.drawerFormulario = true;
  }

  cerrarDrawerFormulario() {
    this.drawerFormulario = false;
  }

  abrirFormularioNuevo() {
    this.resetFormulario();
    this.modoEstudiante = 'existente';
    this.drawerFormulario = true;

    if (this.isBrowser) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cambiarAModoNuevo() {
    this.estudianteSeleccionado = null;

    this.resetSeguimientoState();
    this.intentoGuardar = false;

    this.rutDuplicadoNuevo = false;
    this.rutDuplicadoExistente = false;
    this.anioIngresoInvalidoNuevo = false;

    this.planSeleccionadoId = null;
    this.planOriginalId = null;

    this.nuevoEstudiante = {
      rut: '',
      nombre: '',
      apellido: '',
      nombreSocial: '',
      agnioIngreso: undefined,
      idPlan: undefined,
    };

    this.modoEstudiante = 'nuevo';
  }

  private seleccionarEstudianteParaEdicion(egresado: any) {
    const id = egresado?.Estudiante?.idEstudiante ?? egresado?.idEstudiante ?? null;

    if (!id) {
      this.estudianteSeleccionado = egresado?.Estudiante ?? null;
      setTimeout(() => this.onEstudianteChange(), 0);
      return;
    }

    const encontrado = this.estudiantes?.find((e) => e.idEstudiante === id);
    if (encontrado) {
      this.estudianteSeleccionado = encontrado;
      this.rutDuplicadoExistente = false;
      setTimeout(() => this.onEstudianteChange(), 0);
      return;
    }

    this.estudiantesService.findAll().subscribe({
      next: (data: EstudianteDTO[]) => {
        this.estudiantes = data;
        const found2 = this.estudiantes.find((e) => e.idEstudiante === id);
        this.estudianteSeleccionado = found2 ?? (egresado?.Estudiante ?? null);
        this.rutDuplicadoExistente = false;
        setTimeout(() => this.onEstudianteChange(), 0);
      },
      error: (err: any) => {
        console.error(err);
        this.estudianteSeleccionado = egresado?.Estudiante ?? null;
        this.rutDuplicadoExistente = false;
        setTimeout(() => this.onEstudianteChange(), 0);
      },
    });
  }

  onEstudianteChange() {
    if (!this.estudianteSeleccionado?.idEstudiante) {
      this.resetSeguimientoState();
      return;
    }

    this.loadSeguimientoByEstudiante(this.estudianteSeleccionado.idEstudiante, true);
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    this.documentosSeleccionados = [];
    for (let i = 0; i < files.length; i++) this.documentosSeleccionados.push(files[i]);
  }

  limpiarInputArchivos() {
    this.documentosSeleccionados = [];
    this.fileInput?.nativeElement && (this.fileInput.nativeElement.value = '');
  }

  // ---------------------------
  // ✅ GUARDAR (EGRESADO + ADMIN/SECRETARIA)
  // ---------------------------
  guardar() {
    this.intentoGuardar = true;
    this.formulario.markAllAsTouched();

    const logStop = (msg: string) => {
      console.warn('🛑 NO GUARDA:', msg);
      this.messageService.add({ severity: 'warn', summary: 'No se puede guardar', detail: msg });
    };

    // ✅ EGRESADO (mine)
    if (this.isEgresado) {
      if (this.formulario.invalid) {
        logStop('Formulario inválido (EGRESADO). Revisa requeridos.');
        return;
      }

      const svc: any = this.egresadosService as any;
      const raw = this.formulario.getRawValue();
      const hasDocs = (this.documentosSeleccionados?.length ?? 0) > 0;

      let missingMine = false;

      const obs: Observable<any> = (() => {
        // sin docs -> JSON
        if (!hasDocs) {
          if (this.existeSeguimiento) {
            if (typeof svc.updateMine === 'function') return svc.updateMine(raw);
            missingMine = true;
            return of(null);
          } else {
            if (typeof svc.createMine === 'function') return svc.createMine(raw);
            missingMine = true;
            return of(null);
          }
        }

        // con docs -> multipart (FormData)
        const fd = buildFormDataFromRaw(raw, this.documentosSeleccionados, this.idEstudianteToken ?? undefined);

        if (this.existeSeguimiento) {
          if (typeof svc.updateMineWithFiles === 'function') return svc.updateMineWithFiles(fd);
          if (typeof svc.updateMine === 'function') return svc.updateMine(fd);
          missingMine = true;
          return of(null);
        } else {
          if (typeof svc.createMineWithFiles === 'function') return svc.createMineWithFiles(fd);
          if (typeof svc.createMine === 'function') return svc.createMine(fd);
          missingMine = true;
          return of(null);
        }
      })();

      if (missingMine) {
        this.messageService.add({
          severity: 'error',
          summary: 'Falta endpoint MINE en frontend',
          detail:
            'Tu SeguimientoEgresadosComponent está listo, pero tu egresados.service.ts no tiene createMine/updateMine (y variantes con files). Agrega esos métodos apuntando a /egresados/mine.',
        });
        return;
      }

      obs.subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Guardado',
            detail: this.existeSeguimiento ? '✅ Seguimiento actualizado.' : '✅ Seguimiento creado.',
          });

          this.limpiarInputArchivos();
          this.cargarMiSeguimiento();
        },
        error: (err: any) => {
          console.error('❌ ERROR GUARDAR EGRESADO:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error al guardar',
            detail: err?.error?.message || err?.message || '❌ No se pudo guardar.',
          });
        },
      });

      return;
    }

    // ✅ ADMIN / SECRETARIA
    if (this.modoEstudiante === 'nuevo') {
      this.anioIngresoInvalidoNuevo = !this.validarAnioIngresoNuevo();
      if (this.anioIngresoInvalidoNuevo) {
        logStop(`Año ingreso inválido. Debe estar entre ${this.MIN_ANIO_INGRESO} y ${this.MAX_ANIO_INGRESO}.`);
        return;
      }
    }

    if (this.modoEstudiante === 'nuevo' && this.rutDuplicadoNuevo) {
      logStop('RUT duplicado (nuevo).');
      return;
    }

    if (this.modoEstudiante === 'existente' && this.rutDuplicadoExistente) {
      logStop('RUT duplicado (existente).');
      return;
    }

    const rutActual =
      this.modoEstudiante === 'existente'
        ? this.estudianteSeleccionado?.rut ?? ''
        : this.nuevoEstudiante?.rut ?? '';

    if (!this.isRutValido(rutActual)) {
      logStop('RUT inválido.');
      return;
    }

    if (this.modoEstudiante === 'existente' && !this.estudianteSeleccionado) {
      logStop('Debes seleccionar un estudiante.');
      return;
    }

    if (this.modoEstudiante === 'nuevo' && !this.nuevoEstudiante.idPlan) {
      logStop('Debes seleccionar un plan (nuevo estudiante).');
      return;
    }

    if (this.modoEstudiante === 'existente' && !this.planSeleccionadoId) {
      logStop('Debes seleccionar un plan (estudiante existente).');
      return;
    }

    if (this.formulario.invalid) {
      logStop('Formulario inválido. Falta completar requeridos (Año fin estudios, Situación, Nivel rentas).');
      return;
    }

    const obtenerEstudiante$ =
      this.modoEstudiante === 'existente'
        ? of(this.estudianteSeleccionado)
        : (() => {
            this.nuevoEstudiante.nombreSocial = `${this.nuevoEstudiante.nombre} ${this.nuevoEstudiante.apellido}`.trim();
            return this.estudiantesService.create(this.nuevoEstudiante);
          })();

    obtenerEstudiante$
      .pipe(
        switchMap((estudiante: any) => {
          this.estudianteSeleccionado = estudiante;
          const idEstudiante = estudiante.idEstudiante;

          return actualizarPlanSiCambia$(
            idEstudiante,
            this.planSeleccionadoId,
            this.planOriginalId,
            (id: number, dto: UpdateEstudianteDTO) => this.estudiantesService.update(id, dto)
          ).pipe(
            switchMap(() => {
              const raw = this.formulario.getRawValue();

              if (this.existeSeguimiento) {
                if (this.documentosSeleccionados.length === 0) {
                  const dto: UpdateEgresadoDto = { ...raw };
                  return this.egresadosService.updateByEstudiante(idEstudiante, dto);
                }

                const formData = buildFormDataFromRaw(raw, this.documentosSeleccionados);
                return this.egresadosService.updateWithFilesByEstudiante(idEstudiante, formData);
              }

              const formData = buildFormDataFromRaw(raw, this.documentosSeleccionados, idEstudiante);
              return this.egresadosService.createWithFiles(formData);
            })
          );
        })
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Guardado',
            detail: this.existeSeguimiento
              ? '✅ Seguimiento actualizado (y plan actualizado si cambió).'
              : '✅ Seguimiento creado correctamente.',
          });

          const id = this.estudianteSeleccionado?.idEstudiante;

          this.limpiarInputArchivos();
          this.cargarEgresados();
          this.cargarEstudiantes();

          if (id) setTimeout(() => this.onEstudianteChange(), 300);

          this.drawerFormulario = false;
        },
        error: (err: any) => {
          console.error('❌ ERROR GUARDAR:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error al guardar',
            detail: err?.error?.message || err?.message || '❌ No se pudo guardar.',
          });
        },
      });
  }

  // ---------------------------
  // documentos
  // ---------------------------
  eliminarDocumento(doc: any) {
    if (!doc?.idDocumento) return;

    this.confirmationService.confirm({
      message: `¿Seguro que deseas eliminar el documento "${doc.nombre}"?`,
      header: 'Eliminar documento',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const svc: any = this.egresadosService as any;

        const eliminar$ =
          this.isEgresado && typeof svc.deleteDocumentoMine === 'function'
            ? svc.deleteDocumentoMine(doc.idDocumento)
            : this.egresadosService.deleteDocumento(doc.idDocumento);

        eliminar$.subscribe({
          next: (egresadoActualizado: any) => {
            this.documentosExistentes = egresadoActualizado.documentos || [];
            this.documentosModal = egresadoActualizado.documentos || [];

            this.messageService.add({
              severity: 'success',
              summary: 'Documento eliminado',
              detail: '✅ Documento eliminado correctamente.',
            });

            if (this.isEgresado) {
              this.cargarMiSeguimiento();
            } else {
              this.cargarEgresados();
            }

            if (this.modalDocsVisible && this.documentosModal.length === 0) {
              this.modalDocsVisible = false;
              this.messageService.add({
                severity: 'info',
                summary: 'Sin documentos',
                detail: '📌 Ya no quedan documentos para este egresado.',
              });
            }
          },
          error: (err: any) => {
            console.error('❌ ERROR ELIMINAR DOCUMENTO:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: '❌ No se pudo eliminar el documento.',
            });
          },
        });
      },
    });
  }

  resetFormulario() {
    this.formulario.reset();
    this.formulario.get('planEstudios')?.setValue('', { emitEvent: false });

    this.documentosSeleccionados = [];
    this.documentosExistentes = [];
    this.estudianteSeleccionado = null;
    this.intentoGuardar = false;
    this.existeSeguimiento = false;
    this.modoEstudiante = 'existente';

    this.planSeleccionadoId = null;
    this.planOriginalId = null;

    this.rutDuplicadoNuevo = false;
    this.rutDuplicadoExistente = false;
    this.anioIngresoInvalidoNuevo = false;

    this.nuevoEstudiante.idPlan = undefined;

    this.formulario.get('viaIngreso')?.setValue(null, { emitEvent: false });
    this.formulario.get('viaIngresoOtro')?.setValue('', { emitEvent: false });
    this.formulario.get('anioIngresoCarrera')?.setValue(null, { emitEvent: false });
    this.formulario.get('anioFinEstudios')?.setValue(null, { emitEvent: false });
    this.formulario.get('genero')?.setValue(null, { emitEvent: false });
    this.formulario.get('tiempoBusquedaTrabajo')?.setValue(null, { emitEvent: false });
    this.formulario.get('sectorLaboral')?.setValue(null, { emitEvent: false });
    this.formulario.get('sectorLaboralOtro')?.setValue('', { emitEvent: false });
    this.formulario.get('tipoEstablecimiento')?.setValue('No aplica', { emitEvent: false });
    this.formulario.get('tipoEstablecimientoOtro')?.setValue('', { emitEvent: false });

    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  volverMenu() {
    this.router.navigateByUrl('/menu');
  }

  verDocumento(doc: any) {
    const url = this.egresadosService.getDocumentoUrl(doc.url);
    if (this.isBrowser) window.open(url, '_blank');
  }

  descargarDocumento(doc: any) {
    if (!doc?.url) return;
    if (!this.isBrowser) return;

    const filename = (doc?.nombre || 'documento').toString();

    this.egresadosService.downloadDocumento(doc.url).subscribe({
      next: (blob: Blob) => {
        const blobUrl = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(blobUrl);
      },
      error: (err) => {
        console.error('❌ Error descargando documento:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo descargar el documento.',
        });
      },
    });
  }

  eliminar(egresado: any) {
    if (this.isEgresado) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Acción no permitida',
        detail: 'No puedes eliminar seguimientos.',
      });
      return;
    }

    this.confirmationService.confirm({
      message: `¿Seguro que deseas eliminar el seguimiento de ${egresado.Estudiante?.nombreCompleto}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.egresadosService.delete(egresado.idEgresado).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: '✅ Registro eliminado correctamente.',
            });
            this.cargarEgresados();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: '❌ No se pudo eliminar.',
            });
          },
        });
      },
    });
  }

  getSituacionSeverity(situacion: string) {
    return Helpers.getSituacionSeverity(situacion);
  }

  formatCLP(valor: number): string {
    return Helpers.formatCLP(valor);
  }

  onGlobalFilter(table: any, event: any) {
    Helpers.applyGlobalFilter(table, event, 'contains');
  }

  abrirEdicion(egresado: any) {
    this.modoEstudiante = 'existente';
    this.drawerFormulario = true;
    this.seleccionarEstudianteParaEdicion(egresado);

    if (this.isBrowser) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  abrirModalDocumentos(egresado: any) {
    this.documentosModal = egresado.documentos || [];
    this.modalDocsVisible = true;
  }

  onRangoFiltroChange(dt: any, field: string, tipo: 'min' | 'max', valor: any) {
    if (!dt) return;

    const v = valor === '' || valor === undefined ? null : valor;

    this.filtroValores[field] = {
      ...(this.filtroValores[field] || {}),
      [tipo]: v,
    };

    const min = this.filtroValores[field]?.min ?? null;
    const max = this.filtroValores[field]?.max ?? null;

    dt.filter([min, max], field, 'between');
  }

  getDropdownOptions(dropdownKey?: string) {
    if (dropdownKey === 'nivelRentas') return this.nivelesRentasOptions;
    return this.situaciones;
  }

  onCohorteChange(event?: any) {
    const raw = event?.value ?? event ?? this.cohorteSeleccionada;

    let anio: any = raw;

    if (anio && typeof anio === 'object') {
      anio = (anio as any).value ?? (anio as any).anio ?? null;
    }

    if (anio !== null && anio !== undefined && anio !== '') {
      const n = Number(anio);
      this.cohorteSeleccionada = Number.isFinite(n) ? n : null;
    } else {
      this.cohorteSeleccionada = null;
    }

    this.recalcularDashboardCohorte();
  }

  private recalcularDashboardCohorte() {
    const r = DashboardUtil.buildCohorteDashboard(this.egresados ?? [], this.cohorteSeleccionada);

    this.kpiCohorte = { ...r.kpiCohorte };

    this.barSituacionCohorteData = r.barSituacionCohorteData
      ? {
          ...r.barSituacionCohorteData,
          labels: [...(r.barSituacionCohorteData.labels ?? [])],
          datasets: [...(r.barSituacionCohorteData.datasets ?? [])],
        }
      : r.barSituacionCohorteData;

    this.donutRentasCohorteData = r.donutRentasCohorteData
      ? {
          ...r.donutRentasCohorteData,
          labels: [...(r.donutRentasCohorteData.labels ?? [])],
          datasets: [...(r.donutRentasCohorteData.datasets ?? [])],
        }
      : r.donutRentasCohorteData;
  }
  /* ===============================
   ✅ EXCEL (IMPORT / EXPORT) - SOLO ADMIN
   - No afecta al resto: se ejecuta solo en navegador y solo si !isEgresado
  ================================ */

  excelImportando = false;
  excelImportTotal = 0;
  excelImportProcesados = 0;


  abrirSelectorExcel() {
  if (this.isEgresado) return;
  if (!isPlatformBrowser(this.platformId)) return;

  if (!this.fileInput?.nativeElement) return;

  // para que si eliges el mismo archivo 2 veces dispare change
  this.fileInput.nativeElement.value = '';
  this.fileInput.nativeElement.click();
}


  async descargarPlantillaExcel() {
    if (this.isEgresado) return;
    if (!isPlatformBrowser(this.platformId)) return;

    const XLSX = await import('xlsx');

    const headers = [
      'rut',
      'nombre',
      'apellido',
      'planId',
      'anioFinEstudios',
      'situacionActual',
      'situacionActualOtro',
      'empresa',
      'cargo',
      'nivelRentas',
      'viaIngreso',
      'viaIngresoOtro',
      'anioIngresoCarrera',
      'genero',
      'tiempoBusquedaTrabajo',
      'sectorLaboral',
      'sectorLaboralOtro',
      'tipoEstablecimiento',
      'tipoEstablecimientoOtro',
      'sueldo',
      'anioIngresoLaboral',
      'telefono',
      'emailContacto',
      'linkedin',
    ];

    // fila ejemplo (para probar subida)
    const example: any = {
      rut: '10.000.196-9',
      nombre: 'Nombre',
      apellido: 'Apellido',
      planId: this.planes?.[0]?.idPlan ?? '',
      anioFinEstudios: this.CURRENT_YEAR,
      situacionActual: this.situaciones?.[0]?.value ?? 'Trabajando',
      situacionActualOtro: '',
      empresa: 'Ej: Colegio X',
      cargo: 'Ej: Educadora diferencial',
      nivelRentas: this.nivelesRentasOptions?.[0]?.value ?? '',
      viaIngreso: this.viasIngreso?.[0]?.value ?? '',
      viaIngresoOtro: '',
      anioIngresoCarrera: this.CURRENT_YEAR - 5,
      genero: this.generos?.[0]?.value ?? '',
      tiempoBusquedaTrabajo: this.tiemposBusquedaTrabajo?.[0]?.value ?? '',
      sectorLaboral: this.sectoresLaborales?.[0]?.value ?? '',
      sectorLaboralOtro: '',
      tipoEstablecimiento: this.tipoEstablecimiento?.[0]?.value ?? 'No aplica',
      tipoEstablecimientoOtro: '',
      sueldo: 600000,
      anioIngresoLaboral: this.CURRENT_YEAR,
      telefono: '912345678',
      emailContacto: 'correo@ejemplo.com',
      linkedin: 'https://www.linkedin.com/in/usuario',
    };

    const ws = XLSX.utils.json_to_sheet([example], { header: headers });
    // fuerza headers en primera fila
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    const { saveAs } = await import('file-saver');
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `plantilla-seguimiento-egresados_${this.CURRENT_YEAR}.xlsx`);
  }

  async exportarEgresadosExcel() {
    if (this.isEgresado) return;
    if (!isPlatformBrowser(this.platformId)) return;

    const XLSX = await import('xlsx');

    const data = (this.egresados ?? []).map((e: any) => ({
      rut: e?.estudiante?.rut ?? '',
      nombreCompleto: e?.estudiante?.nombreCompleto ?? '',
      planEstudios: e?.planEstudios ?? e?.plan?.titulo ?? '',
      anioFinEstudios: e?.anioFinEstudios ?? '',
      situacionActual: e?.situacionActual ?? '',
      empresa: e?.empresa ?? '',
      cargo: e?.cargo ?? '',
      nivelRentas: e?.nivelRentas ?? '',
      viaIngreso: e?.viaIngreso ?? '',
      anioIngresoCarrera: e?.anioIngresoCarrera ?? '',
      genero: e?.genero ?? '',
      tiempoBusquedaTrabajo: e?.tiempoBusquedaTrabajo ?? '',
      sectorLaboral: e?.sectorLaboral ?? '',
      tipoEstablecimiento: e?.tipoEstablecimiento ?? '',
      sueldo: e?.sueldo ?? '',
      anioIngresoLaboral: e?.anioIngresoLaboral ?? '',
      telefono: e?.telefono ?? '',
      emailContacto: e?.emailContacto ?? '',
      linkedin: e?.linkedin ?? '',
      documentos: Array.isArray(e?.documentos) ? e.documentos.length : '',
      updatedAt: e?.updatedAt ?? e?.updatedAt?.toString?.() ?? '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Egresados');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    const { saveAs } = await import('file-saver');
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `egresados_export_${this.CURRENT_YEAR}.xlsx`);
  }

  async onExcelSelected(event: any) {
    if (this.isEgresado) return;
    if (!isPlatformBrowser(this.platformId)) return;

    const input = event.target as HTMLInputElement;
    const file: File | undefined = event?.target?.files?.[0];
    if (!file) return;

    try {
      this.excelImportando = true;
      this.excelImportProcesados = 0;
      this.excelImportEstado = 'Cargando egresados desde Excel...';

      const XLSX = await import('xlsx');

      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheet = wb.SheetNames?.[0];
      const ws = wb.Sheets[firstSheet];

      const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

      if (!rows?.length) {
        this.messageService.add({ severity: 'warn', summary: 'Excel vacío', detail: 'El archivo no tiene filas.' });
        return;
      }

      // Normaliza keys (acepta headers con mayúsculas/espacios)
      const norm = (k: string) =>
        (k ?? '')
          .toString()
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '')
          .replace(/[_-]/g, '');

      const normalizedRows = rows.map((r) => {
        const out: any = {};
        Object.keys(r).forEach((k) => (out[norm(k)] = r[k]));
        return out;
      });

      // Validación mínima
      const missingRut = normalizedRows.findIndex((r) => !r.rut);
      if (missingRut >= 0) {
        this.messageService.add({
          severity: 'error',
          summary: 'Falta RUT',
          detail: `Fila ${missingRut + 2}: la columna "rut" es obligatoria.`,
        });
        return;
      }

      this.excelImportTotal = normalizedRows.length;

      // Procesa en serie (evita saturar API)
      const resumen = await this.importarFilasExcel(normalizedRows);

      // refresca tabla (await para que el dashboard vea los nuevos datos)
      await this.cargarEgresados();
      await this.cargarEstudiantes();

      this.messageService.add({
        severity: resumen.failed ? 'warn' : 'success',
        summary: 'Importación finalizada',
        detail: `Creados: ${resumen.created} | Actualizados: ${resumen.updated} | Errores: ${resumen.failed}`,
      });
    } catch (err: any) {
      console.error('❌ Error importando Excel:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error importando Excel',
        detail: err?.message ?? 'Ocurrió un error leyendo el archivo.',
      });
    } finally {
      this.excelImportando = false;
      this.excelImportEstado = '';
      // limpia input para permitir subir el mismo archivo otra vez
      try {
        if (this.fileInput?.nativeElement) this.fileInput.nativeElement.value = '';
      } catch {}
    }
  }

  private async importarFilasExcel(rows: any[]) {
    // aseguramos estudiantes cargados
    const estudiantesPorRut = new Map<string, EstudianteDTO>();
    (this.estudiantes ?? []).forEach((e) => estudiantesPorRut.set((e.rut ?? '').trim(), e));

    let created = 0;
    let updated = 0;
    let failed = 0;

    for (const r of rows) {
      try {
        const rut = (r.rut ?? '').toString().trim();
        const nombre = (r.nombre ?? '').toString().trim();
        const apellido = (r.apellido ?? '').toString().trim();

        let estudiante = estudiantesPorRut.get(rut);

        // crea estudiante si no existe
        if (!estudiante) {
          const planId = this.resolvePlanIdFromRow(r);
          const agnioIngreso = this.toIntOrNull(r.anioingresocarrera ?? r.agnioingreso ?? r.anioingreso);

          const dto: any = {
            rut,
            nombre: nombre || 'SinNombre',
            apellido: apellido || 'SinApellido',
            nombreSocial: `${nombre} ${apellido}`.trim(),
            agnioIngreso: agnioIngreso ?? undefined,
            idPlan: planId ?? undefined,
          };

          estudiante = await lastValueFrom(this.estudiantesService.create(dto));
          if (estudiante) estudiantesPorRut.set(rut, estudiante);
        }

        if (!estudiante) {
          failed++;
          continue;
        }

        const idEstudiante = estudiante.idEstudiante;

        // actualiza plan del estudiante si viene planId
        const planIdRow = this.resolvePlanIdFromRow(r);
        if (planIdRow && estudiante.idPlan && planIdRow !== estudiante.idPlan) {
          try {
            await lastValueFrom(this.estudiantesService.update(idEstudiante, { idPlan: planIdRow }));
          } catch {}
        }

        const cohorte = this.toIntOrNull(r.aniocohorte ?? r.aniofinestudios ?? r.aniofinestudio);

        // ✅ raw listo para backend
        const raw: any = {
          idEstudiante,
          // backend usa singular; dejamos también plural por compatibilidad
          anioFinEstudio: cohorte ?? null,
          anioFinEstudios: cohorte ?? null,

          // ...resto de campos
          planEstudios: '', // se controla por plan en estudiante; no es requerido aquí
          situacionActual: (r.situacionactual ?? null) || null,
          situacionActualOtro: (r.situacionactualotro ?? '').toString(),
          empresa: (r.empresa ?? '').toString(),
          cargo: (r.cargo ?? '').toString(),
          nivelRentas: (r.nivelrentas ?? null) || null,
          viaIngreso: (r.viaingreso ?? null) || null,
          viaIngresoOtro: (r.viaingresootro ?? '').toString(),
          anioIngresoCarrera: this.toIntOrNull(r.anioingresocarrera) ?? null,
          genero: (r.genero ?? null) || null,
          tiempoBusquedaTrabajo:
            (r.tiempobusqueda ?? r.tiempobusquedatrabajo) || null,
          sectorLaboral: (r.sectorlaboral ?? null) || null,
          sectorLaboralOtro: (r.sectorlaboralotro ?? '').toString(),
          tipoEstablecimiento: (r.tipoestablecimiento ?? 'No aplica') || 'No aplica',
          tipoEstablecimientoOtro: (r.tipoestablecimientootro ?? '').toString(),
          sueldo: this.toIntOrNull(r.sueldo),
          anioIngresoLaboral: this.toIntOrNull(r.anioingresolaboral ?? r.anioingresolab) ?? null,
          telefono: (r.telefono ?? '').toString(),
          emailContacto: (r.emailcontacto ?? '').toString(),
          linkedin: (r.linkedin ?? '').toString(),
        };

        const res = await this.upsertSeguimientoByEstudiante(idEstudiante, raw);
        if (res?.ok && res.action === 'created') created++;
        else if (res?.ok && res.action === 'updated') updated++;
        else failed++;
      } catch (e) {
        failed++;
      } finally {
        this.excelImportProcesados++;
        this.excelImportEstado = `Importando egresados desde Excel... (${this.excelImportProcesados}/${this.excelImportTotal})`;
      }
    }

    return { created, updated, failed };
  }



  private resolvePlanIdFromRow(r: any): number | null {
    const raw = r.planid ?? r.idplan ?? '';
    const n = this.toIntOrNull(raw);
    if (n) return n;

    // también acepta planEstudios como "Título (AÑO)"
    const planTxt = (r.planestudios ?? r.plan ?? r.plandetudio ?? '').toString().trim();
    if (!planTxt) return null;

    const found = (this.planes ?? []).find((p: any) => {
      const label = `${p.titulo} (${p.agnio})`;
      return label.toLowerCase() === planTxt.toLowerCase();
    });

    return found?.idPlan ?? null;
  }

  private toIntOrNull(v: any): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    return Math.trunc(n);
  }

  private buildEgresadoFormData(raw: any): FormData {
    const fd = new FormData();

    Object.entries(raw ?? {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      fd.append(key, String(value));
    });

    return fd;
  }

  private async upsertSeguimientoByEstudiante(idEstudiante: number, raw: any) {
    try {
      // ✅ UPDATE JSON (tu endpoint ya lo soporta)
      await lastValueFrom(this.egresadosService.updateByEstudiante(idEstudiante, raw));
      return { ok: true, action: 'updated' as const };
    } catch (err: any) {
      // ✅ CREATE usando FormData (POST /egresados espera multipart)
      const fd = this.buildEgresadoFormData(raw);

      try {
        await lastValueFrom(this.egresadosService.createWithFiles(fd));
        return { ok: true, action: 'created' as const };
      } catch (err2: any) {
        console.error('❌ Error upsert seguimiento', { idEstudiante, err2 });
        return { ok: false, action: 'failed' as const, error: err2 };
      }
    }
  }

}