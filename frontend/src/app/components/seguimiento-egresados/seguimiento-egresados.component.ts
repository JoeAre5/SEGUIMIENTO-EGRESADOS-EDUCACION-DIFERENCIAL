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
  // ✅ Inputs file separados (docs vs excel) para evitar choques de ViewChild
  @ViewChild('fileInputDocs') fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('fileInputExcel') fileInputExcel?: ElementRef<HTMLInputElement>;
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
  excelImportEstado = '';

  
  // Reporte de filas no asociadas (nombre+correo no encontrados o duplicados)
  excelNoEncontrados: any[] = [];
  excelErrores: string[] = [];
abrirSelectorExcel() {
    if (this.isEgresado) return;
    // ✅ asegurar que se abra el selector correcto (excel) aunque el form/drawer no esté renderizado
    const el = this.fileInputExcel?.nativeElement;
    if (!el) return;
    // reset para permitir re-seleccionar el mismo archivo
    el.value = '';
    el.click();
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
      anioIngresoCarrera: this.CURRENT_YEAR - 5,
      genero: this.generos?.[0]?.value ?? '',
      tiempoBusquedaTrabajo: this.tiemposBusquedaTrabajo?.[0]?.value ?? '',
      sectorLaboral: this.sectoresLaborales?.[0]?.value ?? '',
      tipoEstablecimiento: this.tipoEstablecimiento?.[0]?.value ?? 'No aplica',
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
      rut: e?.estudiante?.rut ?? e?.rut ?? '',
      nombreCompleto: e?.estudiante?.nombreCompleto ?? e?.nombreCompleto ?? '',
      planEstudios: e?.planEstudios?.nombre ?? e?.planEstudios ?? e?.plan?.titulo ?? '',
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


  private buildEgresadoFormData(raw: any): FormData {
    const fd = new FormData();
    Object.entries(raw || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      fd.append(key, String(value));
    });
    return fd;
  }

  private normalizeText(v: any): string {
    return (v ?? '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  

  private async descargarNoEncontradosExcel() {
    if (this.isEgresado) return;
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.excelNoEncontrados?.length) return;

    const XLSX = await import('xlsx');

    const headers = [
      'FilaExcel',
      'Nombre completo',
      'correo',
      'Motivo',
      'Plan o programa de Ingreso',
      'Vía de Ingreso',
      'Año ingreso',
      'Año finalización',
    ];

    const data = this.excelNoEncontrados.map((r: any) => ({
      FilaExcel: r.filaExcel ?? '',
      'Nombre completo': r.nombreCompleto ?? '',
      correo: r.correo ?? '',
      Motivo: r.motivo ?? '',
      'Plan o programa de Ingreso': r.planEstudios ?? '',
      'Vía de Ingreso': r.viaIngreso ?? '',
      'Año ingreso': r.anioIngresoCarrera ?? '',
      'Año finalización': r.anioCohorte ?? '',
    }));

    const ws = XLSX.utils.json_to_sheet(data, { header: headers });
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'No encontrados');

    const ahora = new Date();
    const name = `PEDIF_no_encontrados_${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(
      ahora.getDate()
    ).padStart(2, '0')}.xlsx`;

    XLSX.writeFile(wb, name);
  }

private normalizeKey(k: any): string {
    return this.normalizeText(k).replace(/\s+/g, '').replace(/[_-]/g, '');
  }

  private getRowValue(r: any, keys: string[]): any {
    for (const k of keys) {
      const nk = this.normalizeKey(k);
      if (r[nk] !== undefined && r[nk] !== null && r[nk] !== '') return r[nk];
    }
    return '';
  }


  // ---------------------------------------------------------
  // ✅ Blindaje import Excel: normaliza valores fuera de catálogo
  //    - Si el valor no existe en tus options, se guarda como "Otro"
  //      y el texto original queda en el campo "...Otro".
  //    - No afecta el formulario manual; solo se usa en import.
  // ---------------------------------------------------------

  private getOptionValues(options: any[] | undefined | null): string[] {
    if (!options?.length) return [];
    // soporta string[] o SelectItem[{label,value}]
    return options
      .map((o: any) => {
        if (o == null) return '';
        if (typeof o === 'string' || typeof o === 'number') return String(o);
        if (typeof o === 'object') return String(o.value ?? o.label ?? '');
        return '';
      })
      .map((s) => this.normalizeText(s))
      .filter(Boolean);
  }

  private normalizeForCompare(v: any): string {
    // baja a una forma comparable (sin tildes, minúsculas, trim)
    const s = this.normalizeText(v).toLowerCase();
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  private normalizeImportEnum(
    raw: any,
    options: any[] | undefined | null,
    opts?: { emptyAsOtro?: boolean; directMap?: Record<string, string> }
  ): { value: string; otro: string } {
    const rawText = this.normalizeText(raw);
    const optionVals = this.getOptionValues(options);

    // vacío
    if (!rawText) {
      if (opts?.emptyAsOtro) return { value: 'Otro', otro: 'No informado' };
      return { value: '', otro: '' };
    }

    // mapeos directos (por ejemplo "PROPEDEÚTICO" -> "Propedéutico")
    const keyRaw = this.normalizeForCompare(rawText);
    const key = keyRaw.replace(/\s+/g, ' ').trim();
    if (opts?.directMap?.[key]) {
      const mapped = opts.directMap[key];
      // si el mapped está en options, úsalo, si no, cae a "Otro"
      if (optionVals.includes(mapped)) return { value: mapped, otro: '' };
      return { value: 'Otro', otro: rawText };
    }

    // match exacto por texto
    const exact = optionVals.find((o) => this.normalizeForCompare(o) === key);
    if (exact) return { value: exact, otro: '' };

    // match por inclusión (tolerante)
    const fuzzy = optionVals.find((o) => this.normalizeForCompare(o).includes(key) || key.includes(this.normalizeForCompare(o)));
    if (fuzzy) return { value: fuzzy, otro: '' };

    // no calza: usar "Otro"
    return { value: 'Otro', otro: rawText };
  }

  private normalizeViaIngresoExcel(v: any): { value: string; otro: string } {
    // ✅ Backend es estricto: SOLO acepta 'PSU/PAES' | 'CFT' | 'PACE' | 'Propedéutico' | 'Otro'
    const raw = this.normalizeText(v);
    if (!raw) return { value: 'Otro', otro: 'No informado' };

    const key = this.normalizeForCompare(raw).replace(/\s+/g, ' ').trim();

    // Normalizaciones comunes
    if (key.startsWith('prope')) return { value: 'Propedéutico', otro: '' };

    // PSU/PAES (tolerante a variantes)
    if (key === 'psu/paes' || key === 'psu' || key === 'paes') return { value: 'PSU/PAES', otro: '' };

    if (key === 'cft') return { value: 'CFT', otro: '' };
    if (key === 'pace') return { value: 'PACE', otro: '' };
    if (key === 'otro') return { value: 'Otro', otro: '' };

    // Cualquier otro texto del Excel (ej: 'Ingreso especial', 'Puntaje Ranking', etc.)
    // se guarda como 'Otro' + detalle en viaIngresoOtro
    return { value: 'Otro', otro: raw };
  }

  private normalizeSectorLaboralExcel(v: any): { value: string; otro: string } {
    // ✅ Backend es estricto: SOLO acepta 'Público' | 'Privado' | 'Otro'
    const raw = this.normalizeText(v);
    if (!raw) return { value: 'Otro', otro: 'No informado' };
    const key = this.normalizeForCompare(raw).replace(/\s+/g, ' ').trim();
    if (key === 'publico' || key === 'público') return { value: 'Público', otro: '' };
    if (key === 'privado') return { value: 'Privado', otro: '' };
    if (key === 'otro') return { value: 'Otro', otro: '' };
    return { value: 'Otro', otro: raw };
  }

  private normalizeTipoEstablecimientoExcel(v: any): { value: string; otro: string } {
    // ✅ Backend es estricto: SOLO acepta 'Del Estado' | 'Particular subvencionado' | 'Particular' | 'No aplica' | 'Otro'
    const raw = this.normalizeText(v);
    if (!raw) return { value: 'No aplica', otro: '' };

    const key = this.normalizeForCompare(raw).replace(/\s+/g, ' ').trim();

    // Normalizaciones comunes
    if (key === 'del estado' || key === 'estado' || key === 'delestado') return { value: 'Del Estado', otro: '' };
    if (key === 'particular subvencionado' || key === 'subvencionado') return { value: 'Particular subvencionado', otro: '' };
    if (key === 'particular') return { value: 'Particular', otro: '' };
    if (key === 'no aplica' || key === 'n/a' || key === 'na') return { value: 'No aplica', otro: '' };
    if (key === 'otro') return { value: 'Otro', otro: '' };

    // Texto no reconocido -> 'Otro' + detalle
    return { value: 'Otro', otro: raw };
  }


  /**
   * ✅ Blindaje para no romper el backend por:
   * - campos extra no soportados
   * - nulls que se serializan como "null" en FormData
   * - campos "*Otro" cuando no aplica
   */
  private sanitizeImportPayload(raw: any): any {
    const out: any = { ...(raw ?? {}) };

    // El backend suele ser estricto: eliminamos aliases/extra no esenciales del import
    delete out.tiempoBusqueda; // dejamos solo tiempoBusquedaTrabajo
    delete out.planEstudios;   // informativo en UI
    delete out.sueldo;         // no se usa en este flujo
    delete out.anioFinEstudio; // usamos solo anioFinEstudios
    // (si en tu DTO sí existen, no pasa nada si faltan)

    // Si el tipo viene como "No aplica", no lo enviamos
    if (this.normalizeForCompare(out.tipoEstablecimiento) === 'noaplica') {
      delete out.tipoEstablecimiento;
      delete out.tipoEstablecimientoOtro;
    }

    // Solo enviar campos "*Otro" cuando realmente el valor principal es "Otro"
    if (out.viaIngreso !== 'Otro') delete out.viaIngresoOtro;
    if (out.sectorLaboral !== 'Otro') delete out.sectorLaboralOtro;
    if (out.tipoEstablecimiento !== 'Otro') delete out.tipoEstablecimientoOtro;
    if (out.situacionActual !== 'Otro') delete out.situacionActualOtro;

    // Eliminar null/undefined/'' para evitar "null" en FormData/JSON
    Object.keys(out).forEach((k) => {
      const v = out[k];
      if (v === null || v === undefined || v === '') delete out[k];
    });

    return out;
  }

  private resolveIdEstudianteFromRow(r: any, estudiantesPorRut: Map<string, EstudianteDTO>, estudiantesPorNombre: Map<string, EstudianteDTO>, egresadoIdByNombreCorreo: Map<string, number>): number | null {
    const rut = this.normalizeText(this.getRowValue(r, ['rut', 'RUT'])).toUpperCase();
    if (rut) {
      const est = estudiantesPorRut.get(rut);
      if (est?.idEstudiante) return est.idEstudiante;
    }

    const nombreCompleto = this.normalizeText(this.getRowValue(r, ['Nombre completo', 'nombreCompleto', 'nombre completo', 'nombre'])).replace(/\s+/g, ' ');
    const correo = this.normalizeText(this.getRowValue(r, ['correo', 'email', 'emailContacto', 'Correo']));

    if (nombreCompleto) {
      // 1) si ya existe egresado con ese nombre+correo, tomamos su idEstudiante
      if (correo) {
        const key = `${nombreCompleto}||${correo}`;
        const id = egresadoIdByNombreCorreo.get(key);
        if (id) return id;
      }

      // 2) fallback: buscar estudiante por nombreCompleto exacto
      const est = estudiantesPorNombre.get(nombreCompleto);
      if (est?.idEstudiante) return est.idEstudiante;
    }

    return null;
  }
// ---------------------------
// Import helpers (RUT temporal)
// ---------------------------
private parseNombreApellido(nombreCompleto: string): { nombre: string; apellido: string } {
  const parts = (nombreCompleto ?? '').toString().trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { nombre: parts[0] ?? 'SinNombre', apellido: 'SinApellido' };
  return { nombre: parts[0], apellido: parts.slice(1).join(' ') };
}

private generateRutTemporal(existingRutsUpper: Set<string>): string {
  // Formato reconocible y estable: 99.YYDDD.SSS-9 (sin validar DV en backend)
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));
  const ddd = String(day).padStart(3, '0');

  for (let seq = 1; seq <= 999; seq++) {
    const sss = String(seq).padStart(3, '0');
    const rut = `99.${yy}${ddd}.${sss}-9`;
    const key = this.normalizeText(rut).toUpperCase();
    if (!existingRutsUpper.has(key)) return rut;
  }

  // fallback extremo (muy improbable)
  const rut = `99.${yy}${ddd}.999-9`;
  return rut;
}

private async crearEstudianteTemporalFromRow(r: any, existingRutsUpper: Set<string>): Promise<EstudianteDTO | null> {
  const nombreCompleto = (this.getRowValue(r, ['Nombre completo', 'nombreCompleto', 'nombre completo', 'nombre']) ?? '').toString().trim();
  if (!nombreCompleto) return null;

  const anioIngreso = this.toIntOrNull(
    this.getRowValue(r, ['Periodo de Estudios\nAño de ingreso a la Carrera o Programa', 'anioIngresoCarrera', 'agnioIngreso', 'anioIngreso', 'Año ingreso', 'Ano ingreso', 'año ingreso'])
  );
  const planTxt = this.getRowValue(r, ['Plan o programa de Ingreso', 'planEstudios', 'plan', 'Plan']);

  // idPlan es obligatorio en tu backend
  const planId = this.resolvePlanIdFromRow({
    ...r,
    planoprogramadeingreso: planTxt,
    planestudios: planTxt,
    plan: planTxt,
  });

  if (!anioIngreso || !planId) return null;

  const { nombre, apellido } = this.parseNombreApellido(nombreCompleto);
  const rutTemporal = this.generateRutTemporal(existingRutsUpper);

  const dto: CreateEstudianteDTO = {
    rut: rutTemporal,
    nombre,
    apellido,
    nombreSocial: nombreCompleto,
    agnioIngreso: anioIngreso,
    idPlan: planId,
  };

  try {
    const created = await lastValueFrom(this.estudiantesService.create(dto));
    // normaliza respuesta
    const id = (created as any)?.idEstudiante ?? (created as any)?.id ?? (created as any)?.id_estudiante;
    if (!id) return null;

    // agrega rut al set para evitar colisiones en el mismo import
    existingRutsUpper.add(this.normalizeText(rutTemporal).toUpperCase());
    return created as any;
  } catch (err) {
    console.error('❌ No se pudo crear estudiante temporal:', err);
    return null;
  }
}



  async onExcelSelected(event: any) {
    if (this.isEgresado) return;
    if (!isPlatformBrowser(this.platformId)) return;

    const file: File | undefined = event?.target?.files?.[0];
    if (!file) return;

    try {
      this.excelImportando = true;
      this.excelImportProcesados = 0;
      this.excelImportEstado = 'Cargando egresados desde Excel...';

      const XLSX = await import('xlsx');

      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: 'array' });

      // Preferir hoja oficial si existe
      const sheetName = wb.SheetNames?.includes('Todas las Cohortes') ? 'Todas las Cohortes' : wb.SheetNames?.[0];
      const ws = wb.Sheets[sheetName];

      const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

      if (!rows?.length) {
        this.messageService.add({ severity: 'warn', summary: 'Excel vacío', detail: 'El archivo no tiene filas.' });
        return;
      }

      // Normaliza keys (acepta headers con mayúsculas/espacios/acentos)
      const normalizedRows = rows.map((r) => {
        const out: any = {};
        Object.keys(r).forEach((k) => (out[this.normalizeKey(k)] = (r as any)[k]));
        return out;
      });

      // ✅ Según lo acordado: este archivo tiene datos de egresados solo hasta la fila 29 (incluye header en fila 1).
      // Por lo tanto, procesamos únicamente las primeras 28 filas de datos para evitar basura/hojas auxiliares.
      const MAX_EXCEL_SHEET_ROW = 29;
      const MAX_DATA_ROWS = Math.max(0, MAX_EXCEL_SHEET_ROW - 1); // descuenta header
      const limitedRows = normalizedRows.slice(0, MAX_DATA_ROWS);

      this.excelImportTotal = limitedRows.length;

      // Procesa en serie (evita saturar API)
      this.excelImportEstado = 'Guardando egresados desde Excel...';
      const result = await this.importarFilasExcel(limitedRows);

      // Guardar y (si hay) descargar reporte de no encontrados/duplicados
      this.excelNoEncontrados = result?.notFoundRows ?? [];
      if (this.excelNoEncontrados.length) {
        this.messageService.add({
          severity: 'info',
          summary: 'Pendientes detectados',
          detail: `Se descargará un Excel con ${this.excelNoEncontrados.length} filas no asociadas (requieren estudiante con RUT).`,
          life: 8000,
        });
        await this.descargarNoEncontradosExcel();
      }

      this.messageService.add({
        severity: result?.failed ? 'warn' : 'success',
        summary: 'Importación finalizada',
        detail: `Egresados creados: ${result?.created ?? 0} | Egresados actualizados: ${result?.updated ?? 0} | Estudiantes creados: ${result?.studentsCreated ?? 0} | No encontrados: ${result?.notFound ?? 0} | Duplicados: ${result?.duplicated ?? 0} | Errores: ${result?.failed ?? 0}`,
        life: 8000,
      });

      // refresca tabla
      await this.cargarEgresados();
      await this.cargarEstudiantes();
    } catch (err: any) {
      console.error('❌ Error importando Excel:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error importando Excel',
        detail: err?.message ?? 'Ocurrió un error leyendo el archivo.',
        life: 8000,
      });
    } finally {
      this.excelImportando = false;
      this.excelImportEstado = '';
      // limpia input para permitir subir el mismo archivo otra vez
      try {
        if (this.fileInputExcel?.nativeElement) this.fileInputExcel.nativeElement.value = '';
      } catch {}
    }
  }

  private async importarFilasExcel(rows: any[]) {
    // asegurar listas cargadas
    const estudiantesPorRut = new Map<string, EstudianteDTO>();
    const estudiantesPorNombre = new Map<string, EstudianteDTO>();
    const nombresDuplicados = new Set<string>();

    (this.estudiantes ?? []).forEach((e) => {
      const rut = this.normalizeText((e as any).rut).toUpperCase();
      if (rut) estudiantesPorRut.set(rut, e);

      const nombre = this.normalizeText((e as any).nombreCompleto).replace(/\s+/g, ' ');
      if (nombre) {
        if (estudiantesPorNombre.has(nombre)) nombresDuplicados.add(nombre);
        estudiantesPorNombre.set(nombre, e);
      }
    });

    const existingRutsUpper = new Set<string>(Array.from(estudiantesPorRut.keys()));

    // Si ya existe Egresado con ese correo, tomamos su idEstudiante (más confiable que solo nombre)
    const egresadoIdByNombreCorreo = new Map<string, number>();
    const nombreCorreoDuplicado = new Set<string>();

    (this.egresados ?? []).forEach((eg: any) => {
      const n = this.normalizeText(eg?.estudiante?.nombreCompleto).replace(/\s+/g, ' ');
      const c = this.normalizeText(eg?.emailContacto);
      const id = eg?.idEstudiante ?? eg?.idEstudiante ?? eg?.estudiante?.idEstudiante ?? eg?.estudiante?.idEstudiante;
      if (!n || !c || !id) return;

      const key = `${n}||${c}`;
      if (egresadoIdByNombreCorreo.has(key)) nombreCorreoDuplicado.add(key);
      egresadoIdByNombreCorreo.set(key, Number(id));
    });

    let created = 0;
    let updated = 0;
    let failed = 0;
    let notFound = 0;
    let duplicated = 0;
    let studentsCreated = 0;

    const notFoundRows: any[] = [];

    for (let idx = 0; idx < rows.length; idx++) {
      const r = rows[idx];

      const nombreExcel = this.getRowValue(r, ['Nombre completo', 'nombreCompleto', 'nombre completo', 'nombre']);
      const correoExcel = this.getRowValue(r, ['correo', 'email', 'emailContacto', 'Correo']);

      const idEstudiante = this.resolveIdEstudianteFromRow(
        r,
        estudiantesPorRut,
        estudiantesPorNombre,
        egresadoIdByNombreCorreo
      );


if (!idEstudiante) {
  // Si el Excel NO trae RUT, intentamos crear un estudiante temporal para no bloquear el import.
  const rutExcel = this.getRowValue(r, ['rut', 'RUT']);
  const rutNorm = this.normalizeText(rutExcel).toUpperCase();

  if (!rutNorm) {
    const createdSt = await this.crearEstudianteTemporalFromRow(r, existingRutsUpper);

    const newId =
      (createdSt as any)?.idEstudiante ?? (createdSt as any)?.id ?? (createdSt as any)?.id_estudiante;

    if (newId) {
      // actualiza mapas locales para próximos rows
      const nombreNew = this.normalizeText((createdSt as any)?.nombreCompleto ?? (createdSt as any)?.nombreSocial ?? nombreExcel).replace(/\s+/g, ' ');
      if (nombreNew) estudiantesPorNombre.set(nombreNew, createdSt as any);

      const rutNew = this.normalizeText((createdSt as any)?.rut).toUpperCase();
      if (rutNew) estudiantesPorRut.set(rutNew, createdSt as any);

      studentsCreated++;

      // sigue flujo normal creando/actualizando egresado
      const idEstudianteCreated = Number(newId);

      const cohorteTemp = this.toIntOrNull(
        this.getRowValue(r, [
          'Periodo de Estudios\nAño de finalización de los estudios',
          'anioFinEstudio',
          'anioFinEstudios',
          'anioCohorte',
          'añoCohorte',
          'Año finalización',
          'Ano finalizacion',
          'año finalización',
          'año finalizacion',
        ])
      );

      const rawTemp: any = {
        idEstudiante: idEstudianteCreated,
        anioFinEstudios: cohorteTemp ?? null,
        cargo: this.getRowValue(r, ['Cargo que ocupa en la Organización', 'cargo']),
        nivelRentas: this.getRowValue(r, ['Nivel de Rentas', 'nivelRentas']),
        viaIngreso: this.normalizeViaIngresoExcel(this.getRowValue(r, ['Vía de Ingreso', 'viaIngreso'])).value,
        viaIngresoOtro: this.normalizeViaIngresoExcel(this.getRowValue(r, ['Vía de Ingreso', 'viaIngreso'])).otro,
        anioIngresoCarrera: this.toIntOrNull(
          this.getRowValue(r, [
            'Periodo de Estudios\nAño de ingreso a la Carrera o Programa',
            'anioIngresoCarrera',
            'agnioIngreso',
            'anioIngreso',
            'Año ingreso',
            'Ano ingreso',
            'año ingreso',
          ])
        ),
        genero: this.getRowValue(r, ['Género', 'genero']),
        tiempoBusquedaTrabajo: this.getRowValue(r, ['Tiempo que has demorado en encontrar trabajo', 'tiempoBusquedaTrabajo', 'tiempoBusqueda']),
        tiempoBusqueda: this.getRowValue(r, ['Tiempo que has demorado en encontrar trabajo', 'tiempoBusqueda', 'tiempoBusquedaTrabajo']),
        sectorLaboral: this.normalizeSectorLaboralExcel(this.getRowValue(r, ['Sector en el cual se desempeña su labor profesional', 'sectorLaboral'])).value,
        sectorLaboralOtro: this.normalizeSectorLaboralExcel(this.getRowValue(r, ['Sector en el cual se desempeña su labor profesional', 'sectorLaboral'])).otro,
        tipoEstablecimiento: this.normalizeTipoEstablecimientoExcel(this.getRowValue(r, ['Si trabajas en establecimiento educacional es:', 'tipoEstablecimiento']) || 'No aplica').value,
        tipoEstablecimientoOtro: this.normalizeTipoEstablecimientoExcel(this.getRowValue(r, ['Si trabajas en establecimiento educacional es:', 'tipoEstablecimiento']) || 'No aplica').otro,
        emailContacto: correoExcel || null,
        telefono: this.getRowValue(r, ['telefono', 'Teléfono']),
        linkedin: this.getRowValue(r, ['linkedin', 'LinkedIn']),
        empresa: this.getRowValue(r, ['empresa', 'Organización', 'Institución', 'Institución o establecimiento']),
        situacionActual: this.getRowValue(r, ['situacionActual', 'Situación']) || 'Trabajando',
        situacionActualOtro: '',
        sueldo: null,
        anioIngresoLaboral: null,
        planEstudios: '',
      };

      const resTemp = await this.upsertSeguimientoByEstudiante(idEstudianteCreated, this.sanitizeImportPayload(rawTemp));
      if (resTemp?.ok && resTemp.action === 'created') created++;
      else if (resTemp?.ok && resTemp.action === 'updated') updated++;
      else failed++;

      this.excelImportProcesados++;
      this.excelImportEstado = `Guardando egresados desde Excel... (${this.excelImportProcesados}/${this.excelImportTotal})`;
      continue;
    }
  }

  // Si no se pudo resolver ni crear, se reporta como pendiente
  const nombreNorm = this.normalizeText(nombreExcel).replace(/\s+/g, ' ');
  const correoNorm = this.normalizeText(correoExcel);
  const key = nombreNorm && correoNorm ? `${nombreNorm}||${correoNorm}` : '';

  const motivo = key && nombreCorreoDuplicado.has(key)
    ? 'Nombre+correo duplicado en registros existentes'
    : (nombreNorm && nombresDuplicados.has(nombreNorm))
      ? 'Nombre completo duplicado en estudiantes'
      : 'No existe estudiante/egresado asociado y no se pudo crear estudiante temporal (faltan Año ingreso o Plan)';

  if (motivo.includes('duplicado')) duplicated++;
  else notFound++;

  notFoundRows.push({
    filaExcel: idx + 2,
    nombreCompleto: (nombreExcel ?? '').toString(),
    correo: (correoExcel ?? '').toString(),
    motivo,
    planEstudios: this.getRowValue(r, ['Plan o programa de Ingreso', 'planEstudios', 'plan', 'Plan']),
    viaIngreso: this.normalizeViaIngresoExcel(this.getRowValue(r, ['Vía de Ingreso', 'viaIngreso'])).value,
        viaIngresoOtro: this.normalizeViaIngresoExcel(this.getRowValue(r, ['Vía de Ingreso', 'viaIngreso'])).otro,
    anioIngresoCarrera: this.toIntOrNull(
      this.getRowValue(r, ['Periodo de Estudios\nAño de ingreso a la Carrera o Programa', 'anioIngresoCarrera', 'anioIngreso'])
    ),
    anioCohorte: this.toIntOrNull(
      this.getRowValue(r, ['Periodo de Estudios\nAño de finalización de los estudios', 'anioFinEstudio', 'anioFinEstudios', 'anioCohorte'])
    ),
  });

  failed++;
  this.excelImportProcesados++;
  this.excelImportEstado = `Guardando egresados desde Excel... (${this.excelImportProcesados}/${this.excelImportTotal})`;
  continue;
}

      const cohorte = this.toIntOrNull(
        this.getRowValue(r, [
          'Periodo de Estudios\nAño de finalización de los estudios',
          'anioFinEstudio',
          'anioFinEstudios',
          'anioCohorte',
          'añoCohorte',
          'Año finalización',
          'Ano finalizacion',
          'año finalización',
          'año finalizacion',
        ])
      );

      const raw: any = {
        idEstudiante,

        // Año de cohorte (se guarda internamente como anioFinEstudio)
        anioFinEstudios: cohorte ?? null,

        // Campos PEDIF
        cargo: this.getRowValue(r, ['Cargo que ocupa en la Organización', 'cargo']),
        nivelRentas: this.getRowValue(r, ['Nivel de Rentas', 'nivelRentas']),
        viaIngreso: this.normalizeViaIngresoExcel(this.getRowValue(r, ['Vía de Ingreso', 'viaIngreso'])).value,
        viaIngresoOtro: this.normalizeViaIngresoExcel(this.getRowValue(r, ['Vía de Ingreso', 'viaIngreso'])).otro,
        anioIngresoCarrera: this.toIntOrNull(
          this.getRowValue(r, [
            'Periodo de Estudios\nAño de ingreso a la Carrera o Programa',
            'anioIngresoCarrera',
            'agnioIngreso',
            'anioIngreso',
            'Año ingreso',
            'Ano ingreso',
            'año ingreso',
          ])
        ),
        genero: this.getRowValue(r, ['Género', 'genero']),
        tiempoBusquedaTrabajo: this.getRowValue(r, ['Tiempo que has demorado en encontrar trabajo', 'tiempoBusquedaTrabajo', 'tiempoBusqueda']),
        tiempoBusqueda: this.getRowValue(r, ['Tiempo que has demorado en encontrar trabajo', 'tiempoBusqueda', 'tiempoBusquedaTrabajo']),
        sectorLaboral: this.normalizeSectorLaboralExcel(this.getRowValue(r, ['Sector en el cual se desempeña su labor profesional', 'sectorLaboral'])).value,
        sectorLaboralOtro: this.normalizeSectorLaboralExcel(this.getRowValue(r, ['Sector en el cual se desempeña su labor profesional', 'sectorLaboral'])).otro,
        tipoEstablecimiento: this.normalizeTipoEstablecimientoExcel(this.getRowValue(r, ['Si trabajas en establecimiento educacional es:', 'tipoEstablecimiento']) || 'No aplica').value,
        tipoEstablecimientoOtro: this.normalizeTipoEstablecimientoExcel(this.getRowValue(r, ['Si trabajas en establecimiento educacional es:', 'tipoEstablecimiento']) || 'No aplica').otro,

        // contacto
        emailContacto: correoExcel || null,
        telefono: this.getRowValue(r, ['telefono', 'Teléfono']),
        linkedin: this.getRowValue(r, ['linkedin', 'LinkedIn']),

        // Formato PEDIF no trae institución/empresa de forma directa, dejamos opcional
        empresa: this.getRowValue(r, ['empresa', 'Organización', 'Institución', 'Institución o establecimiento']),

        // Situación actual: no viene explícita en PEDIF
        situacionActual: this.getRowValue(r, ['situacionActual', 'Situación']) || 'Trabajando',

        // opcionales
        situacionActualOtro: '',
        sueldo: null,
        anioIngresoLaboral: null,
        planEstudios: '',
      };

      const res = await this.upsertSeguimientoByEstudiante(idEstudiante, this.sanitizeImportPayload(raw));
      if (res?.ok && res.action === 'created') created++;
      else if (res?.ok && res.action === 'updated') updated++;
      else failed++;

      this.excelImportProcesados++;
      this.excelImportEstado = `Guardando egresados desde Excel... (${this.excelImportProcesados}/${this.excelImportTotal})`;
    }

    return { created, updated, failed, notFound, duplicated, studentsCreated, notFoundRows };
  }

  private resolvePlanIdFromRow(r: any): number | null {
    // 1) Si viene id numérico directo
    const raw = r.planid ?? r.idplan ?? r.idPlan ?? '';
    const n = this.toIntOrNull(raw);
    if (n) return n;

    // 2) Texto del plan/programa
    const planTxtRaw = (r.planoprogramadeingreso ?? r.planestudios ?? r.plan ?? r.plandetudio ?? r['Plan o programa de Ingreso'] ?? '').toString().trim();
    if (!planTxtRaw) return null;

    const planTxt = this.normalizeText(planTxtRaw).toLowerCase();

    // 3) Hint de año (si existe en el Excel)
    const yearHint =
      this.toIntOrNull(r['Año ingreso']) ??
      this.toIntOrNull(r['Ano ingreso']) ??
      this.toIntOrNull(r['año ingreso']) ??
      this.toIntOrNull(r.anioIngresoCarrera ?? r.agnioIngreso ?? r.anioIngreso) ??
      null;

    const planes: any[] = this.planes ?? [];

    // Helper: mejor match por año
    const pickByYear = (cands: any[]) => {
      if (!cands.length) return null;
      if (yearHint) {
        const exact = cands.find((p) => Number(p.agnio) === Number(yearHint));
        if (exact) return exact;
      }
      // fallback: más nuevo
      return cands.slice().sort((a, b) => Number(b.agnio ?? 0) - Number(a.agnio ?? 0))[0];
    };

    // 4) Casos especiales acordados: "Plan Regular" y "Plan Ingreso Profesional"
    if (planTxt.includes('plan regular') || (planTxt.includes('regular') && !planTxt.includes('profesional'))) {
      const cands = planes.filter((p: any) => this.normalizeText(p.titulo).toLowerCase().includes('ingreso regular') || this.normalizeText(p.titulo).toLowerCase().includes('regular'));
      const picked = pickByYear(cands);
      return picked?.idPlan ?? null;
    }

    if (planTxt.includes('ingreso profesional') || planTxt.includes('profesional')) {
      const cands = planes.filter((p: any) => this.normalizeText(p.titulo).toLowerCase().includes('ingreso profesional') || this.normalizeText(p.titulo).toLowerCase().includes('profesional'));
      const picked = pickByYear(cands);
      return picked?.idPlan ?? null;
    }

    // 5) Match exacto "Título (AÑO)"
    const exactLabel = planes.find((p: any) => {
      const label = `${p.titulo} (${p.agnio})`;
      return label.toLowerCase() === planTxtRaw.toLowerCase();
    });
    if (exactLabel?.idPlan) return exactLabel.idPlan;

    // 6) Match por contiene (título)
    const candsContains = planes.filter((p: any) => {
      const t = this.normalizeText(p.titulo).toLowerCase();
      return planTxt.includes(t) || t.includes(planTxt);
    });
    const picked2 = pickByYear(candsContains);
    return picked2?.idPlan ?? null;
  }

  private toIntOrNull(v: any): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    return Math.trunc(n);
  }

  private async upsertSeguimientoByEstudiante(idEstudiante: number, raw: any) {
    try {
      await lastValueFrom(this.egresadosService.updateByEstudiante(idEstudiante, raw));
      return { ok: true, action: 'updated' as const };
    } catch (err: any) {
      // Log detallado del PATCH (actualización) cuando falla
      console.error('❌ PATCH /egresados por idEstudiante falló', {
        idEstudiante,
        status: err?.status,
        message: err?.message,
        error: err?.error,
      });

      // CREATE usando FormData (POST /egresados espera multipart)
      const fd = this.buildEgresadoFormData({ ...raw, idEstudiante });

      try {
        await lastValueFrom(this.egresadosService.createWithFiles(fd));
        return { ok: true, action: 'created' as const };
      } catch (err2: any) {
        console.error('❌ POST /egresados (createWithFiles) falló', {
          idEstudiante,
          status: err2?.status,
          message: err2?.message,
          error: err2?.error,
        });
        return { ok: false, action: 'failed' as const, error: err2 };
      }
    }
  }
}