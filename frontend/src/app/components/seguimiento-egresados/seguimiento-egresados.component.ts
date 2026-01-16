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

import {
  EgresadosService,
  UpdateEgresadoDto,
} from '../../services/egresados.service';

import {
  EstudiantesService,
  EstudianteDTO,
  CreateEstudianteDTO,
  UpdateEstudianteDTO,
} from '../../services/estudiantes.service';

import { switchMap, of, Observable } from 'rxjs';

// ✅ (opcional) roles type
import { Roles } from '../../models/login.dto';

// ✅ Refactor definitivo (según tu estructura)
import * as DashboardUtil from './_refactor/dashboard.util';
import * as Mapper from './_refactor/egresado-form.mapper';
import { buildFormDataFromRaw, actualizarPlanSiCambia$ } from './_refactor/egresado-save.facade';

import * as Helpers from './_refactor/helpers.util';
import { EgresadosDashboardComponent } from './ui/egresados-dashboard.component';

import * as JwtUtil from '../../utils/jwt.util';
import * as RutUtil from '../../utils/rut.util';
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
      transition(':enter', [
        query('@cardItem', stagger(70, animateChild()), { optional: true }),
      ]),
      transition('* => *', [
        query('@cardItem', stagger(70, animateChild()), { optional: true }),
      ]),
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
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
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

  // ✅ SSR
  private readonly isBrowser: boolean;

  // ✅ modo EGRESADO
  public EGRESADO = 'Egresado';
  public isEgresado = false;
  private idEstudianteToken: number | null = null;

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

      this.idEstudianteToken =
        payload?.idEstudiante !== undefined && payload?.idEstudiante !== null
          ? Number(payload.idEstudiante)
          : null;

      this.isEgresado = role === (this.EGRESADO as any) || role === ('EGRESADO' as any);
    } else {
      this.idEstudianteToken = null;
      this.isEgresado = false;
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
    return !!(
      this.formulario?.errors?.[errorKey] &&
      (this.formulario.touched || this.intentoGuardar)
    );
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
          [
            Validators.required,
            Validators.min(this.MIN_ANIO_INGRESO),
            Validators.max(this.CURRENT_YEAR + 5),
          ],
        ],

        situacionActual: [null, Validators.required],
        situacionActualOtro: [''],

        empresa: [''],
        cargo: [''],

        nivelRentas: [null, Validators.required],

        viaIngreso: [null],
        viaIngresoOtro: [''],

        anioIngresoCarrera: [
          null,
          [
            Validators.min(this.MIN_ANIO_INGRESO),
            Validators.max(this.CURRENT_YEAR + 1),
          ],
        ],

        genero: [null],
        tiempoBusquedaTrabajo: [null],

        sectorLaboral: [null],
        sectorLaboralOtro: [''],

        tipoEstablecimiento: ['No aplica'],
        tipoEstablecimientoOtro: [''],

        sueldo: [null],

        anioIngresoLaboral: [
          null,
          [
            Validators.min(this.MIN_ANIO_INGRESO),
            Validators.max(this.CURRENT_YEAR + 1),
          ],
        ],

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
    // Permite: dígitos, k/K, puntos y guión. No valida.
    return (value ?? '')
      .toString()
      .replace(/[^0-9kK\.\-]/g, '')
      .replace(/K/g, 'k')
      .slice(0, 12);
  }

  private normalizarRut(rut: string): string {
    // Normaliza para comparar duplicados: quita puntos/guión y deja dv en minúscula si existe.
    const v = (rut ?? '').toString().trim().toLowerCase();
    return v.replace(/\./g, '').replace(/-/g, '').replace(/[^0-9k]/g, '');
  }

  isRutValido(_rutFormateado: string): boolean {
    // ✅ Por requerimiento: NO validar si el rut es real o falso.
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
  // Seguimiento loader único (elimina duplicaciones)
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

    // Si el usuario es egresado y existe endpoint mine, úsalo
    const obs: Observable<any> =
      this.isEgresado && typeof svc.getMine === 'function'
        ? svc.getMine()
        : this.egresadosService.findOneByEstudiante(idEstudiante);

    this.loading = true;

    obs.subscribe({
      next: (egresado: any) => {
        const eg = egresado?.data ? egresado.data : egresado;

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

  // ---------------------------
  // EGRESADO (mine)
  // ---------------------------
  private cargarMiSeguimiento() {
    const id = this.idEstudianteToken;

    if (!id || Number.isNaN(id)) {
      this.loading = false;
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin vínculo',
        detail: 'No se pudo identificar tu idEstudiante en el token.',
      });
      return;
    }

    this.loadSeguimientoByEstudiante(id, true);
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
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  // ---------------------------
  // GUARDAR (EGRESADO + ADMIN/SECRETARIA)
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

      const obs: Observable<any> = (() => {
        // sin docs -> usa raw (endpoints JSON)
        if (!hasDocs) {
          if (this.existeSeguimiento) {
            if (typeof svc.updateMine === 'function') return svc.updateMine(raw);
            const id = this.idEstudianteToken;
            if (id) return this.egresadosService.updateByEstudiante(id, raw);
            return of(null);
          } else {
            if (typeof svc.createMine === 'function') return svc.createMine(raw);
            const id = this.idEstudianteToken;
            if (id) {
              const fd = buildFormDataFromRaw(raw, [], id);
              return this.egresadosService.createWithFiles(fd);
            }
            return of(null);
          }
        }

        // con docs -> multipart
        const fd = buildFormDataFromRaw(raw, this.documentosSeleccionados, this.idEstudianteToken ?? undefined);

        if (this.existeSeguimiento) {
          if (typeof svc.updateMineWithFiles === 'function') return svc.updateMineWithFiles(fd);
          if (typeof svc.updateMine === 'function') return svc.updateMine(fd);
          const id = this.idEstudianteToken;
          if (id) return this.egresadosService.updateWithFilesByEstudiante(id, fd);
          return of(null);
        } else {
          if (typeof svc.createMineWithFiles === 'function') return svc.createMineWithFiles(fd);
          if (typeof svc.createMine === 'function') return svc.createMine(fd);
          return this.egresadosService.createWithFiles(fd);
        }
      })();

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

    // ✅ por requerimiento: no validar rut real/falso
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
            this.nuevoEstudiante.nombreSocial =
              `${this.nuevoEstudiante.nombre} ${this.nuevoEstudiante.apellido}`.trim();
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

    if (this.isEgresado) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Acción no permitida',
        detail: 'No puedes eliminar documentos.',
      });
      return;
    }

    this.confirmationService.confirm({
      message: `¿Seguro que deseas eliminar el documento "${doc.nombre}"?`,
      header: 'Eliminar documento',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.egresadosService.deleteDocumento(doc.idDocumento).subscribe({
          next: (egresadoActualizado: any) => {
            this.documentosExistentes = egresadoActualizado.documentos || [];
            this.documentosModal = egresadoActualizado.documentos || [];

            this.messageService.add({
              severity: 'success',
              summary: 'Documento eliminado',
              detail: '✅ Documento eliminado correctamente.',
            });

            this.cargarEgresados();

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

  onCohorteChange() {
    this.recalcularDashboardCohorte();
  }

  private recalcularDashboardCohorte() {
    const r = DashboardUtil.buildCohorteDashboard(this.egresados ?? [], this.cohorteSeleccionada);
    this.kpiCohorte = r.kpiCohorte;
    this.barSituacionCohorteData = r.barSituacionCohorteData;
    this.donutRentasCohorteData = r.donutRentasCohorteData;
  }
}
