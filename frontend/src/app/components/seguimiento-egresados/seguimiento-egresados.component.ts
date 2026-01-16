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

// ✅ NUEVO (sin romper nada): roles para detectar EGRESADO desde JWT
import { Roles } from '../../models/login.dto';

// ✅ REFACTOR: utils + mapper (los que ya creaste)
import {
  formatearRutMinimoSinDv,
  existeRutEnEstudiantes,
  isRutValido,
} from '../../utils/rut.util';

import { buildFormDataFromObject, appendFiles } from '../../utils/formdata.util';

import {
  patchFormFromEgresado,
  extractPlanIds,
} from '../../mappers/egresado-form.mapper';

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
        animate(
          '320ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),

    trigger('fadeHeader', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-6px)' }),
        animate(
          '260ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
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
        animate(
          '260ms ease-out',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' })
        ),
      ]),
    ]),

    trigger('sidebarStagger', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(10px)' }),
        animate(
          '220ms ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
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

  existeSeguimiento: boolean = false;

  modalDocsVisible = false;
  documentosModal: any[] = [];

  modalFiltrosVisible: boolean = false;
  filtroValores: Record<string, any> = {};

  // ✅ SSR
  private readonly isBrowser: boolean;

  // ✅ NUEVO (sin afectar nada): modo EGRESADO
  public EGRESADO = 'Egresado';
  public isEgresado: boolean = false;
  private idEstudianteToken: number | null = null;

  // ✅ Opciones para filtro de NIVEL RENTAS
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

  drawerFormulario: boolean = false;

  planes: PlanDTO[] = [];
  planesOptions: { label: string; value: number }[] = [];

  public planSeleccionadoId: number | null = null;
  public planOriginalId: number | null = null;

  situaciones = [
    { label: 'Trabajando', value: 'Trabajando' },
    { label: 'Cesante', value: 'Cesante' },
    { label: 'Otro', value: 'Otro' },
  ];

  intentoGuardar: boolean = false;

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

  stats = {
    total: 0,
    trabajando: 0,
    cesante: 0,
    otro: 0,
  };

  donutSituacionData: any;
  donutDocsData: any;
  donutAnioData: any;
  donutOptions: any;

  cohortesOptions: { label: string; value: number }[] = [];
  cohorteSeleccionada: number | null = null;

  kpiCohorte: {
    total: number;
    trabajando: number;
    cesante: number;
    otro: number;
    conDocs: number;
    porcentajeConDocs: number;
  } = {
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

    // ✅ SSR-safe: token/JWT solo en browser
    if (this.isBrowser) {
      const token =
        localStorage.getItem('access_token') ||
        localStorage.getItem('token') ||
        sessionStorage.getItem('access_token') ||
        sessionStorage.getItem('token');

      const payload = this.decodeJwt(token);
      const role = payload?.role;

      this.idEstudianteToken =
        payload?.idEstudiante !== undefined && payload?.idEstudiante !== null
          ? Number(payload.idEstudiante)
          : null;

      this.isEgresado = role === this.EGRESADO || role === 'EGRESADO';
    } else {
      this.idEstudianteToken = null;
      this.isEgresado = false;
    }
  }

  // ✅ SSR-safe: atob solo en browser
  private decodeJwt(token: string | null): any {
    if (!token) return null;
    if (!this.isBrowser) return null;

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
    // ✅✅✅ FIX CLAVE: En SSR NO hagas llamadas HTTP (no hay token => 401)
    if (!this.isBrowser) {
      this.loading = false;
      return;
    }

    if (this.isEgresado) {
      this.loading = true;
      this.modoEstudiante = 'existente';
      this.drawerFormulario = true;

      this.cargarPlanes();
      this.cargarMiSeguimiento();

      this.chartOptionsCohorte = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { usePointStyle: true, boxWidth: 8 },
          },
          tooltip: { enabled: true },
        },
        scales: {
          x: { ticks: { autoSkip: false } },
          y: { beginAtZero: true },
        },
      };

      return;
    }

    this.cargarEgresados();
    this.cargarEstudiantes();
    this.cargarPlanes();

    this.chartOptionsCohorte = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true, boxWidth: 8 },
        },
        tooltip: { enabled: true },
      },
      scales: {
        x: { ticks: { autoSkip: false } },
        y: { beginAtZero: true },
      },
    };
  }

  private resetFormSinSeguimiento() {
    this.existeSeguimiento = false;
    this.documentosExistentes = [];
    this.formulario.reset();
    this.formulario.get('planEstudios')?.setValue('', { emitEvent: false });
  }

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

    const svc: any = this.egresadosService as any;

    const obs =
      typeof svc.getMine === 'function'
        ? svc.getMine()
        : this.egresadosService.findOneByEstudiante(id);

    obs.subscribe({
      next: (egresado: any) => {
        const eg = egresado?.data ? egresado.data : egresado;

        if (!eg || Object.keys(eg).length === 0) {
          this.resetFormSinSeguimiento();
          this.loading = false;
          return;
        }

        this.existeSeguimiento = true;

        // ✅ REFACTOR: mapper central
        const { planOriginalId, planSeleccionadoId } = extractPlanIds(egresado);
        this.planOriginalId = planOriginalId;
        this.planSeleccionadoId = planSeleccionadoId;

        patchFormFromEgresado(this.formulario, egresado, this.situaciones);

        this.documentosExistentes = eg.documentos || [];

        this.messageService.add({
          severity: 'info',
          summary: 'Datos cargados',
          detail: '✅ Formulario rellenado automáticamente.',
        });

        this.loading = false;
      },
      error: () => {
        this.resetFormSinSeguimiento();
        this.loading = false;
      },
    });
  }

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

        telefono: [
          '',
          [Validators.maxLength(20), Validators.pattern(this.PHONE_8_REGEX)],
        ],
        emailContacto: [
          '',
          [Validators.maxLength(120), Validators.pattern(this.EMAIL_REGEX)],
        ],
        linkedin: [
          '',
          [Validators.maxLength(200), Validators.pattern(this.LINKEDIN_REGEX)],
        ],
      },
      {
        validators: [this.validarReglasCruzadas()],
      }
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

  // ✅ REFACTOR: RUT ahora viene de util
  onRutInputExistente() {
    if (!this.estudianteSeleccionado) return;

    this.estudianteSeleccionado.rut = formatearRutMinimoSinDv(
      (this.estudianteSeleccionado.rut as any) ?? ''
    );

    const id = this.estudianteSeleccionado?.idEstudiante ?? null;

    this.rutDuplicadoExistente = existeRutEnEstudiantes(
      this.estudiantes as any,
      this.estudianteSeleccionado.rut,
      id
    );
  }

  onRutInputNuevo() {
    this.nuevoEstudiante.rut = formatearRutMinimoSinDv(
      (this.nuevoEstudiante.rut as any) ?? ''
    );

    this.rutDuplicadoNuevo = existeRutEnEstudiantes(
      this.estudiantes as any,
      this.nuevoEstudiante.rut
    );
  }

  private validarAnioIngresoNuevo(): boolean {
    const v = this.nuevoEstudiante?.agnioIngreso;
    if (v === undefined || v === null) return false;
    if (v < this.MIN_ANIO_INGRESO || v > this.MAX_ANIO_INGRESO) return false;
    return true;
  }

  // ✅ REFACTOR: RUT válido desde util
  isRutValido(rutFormateado: string): boolean {
    return isRutValido(rutFormateado);
  }

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
      error: (err: any) => {
        console.error('❌ ERROR CARGANDO PLANES:', err);
      },
    });
  }

  cargarEgresados() {
    this.loading = true;
    this.egresadosService.findAll().subscribe({
      next: (data: any[]) => {
        this.egresados = data;

        this.recalcularStats(this.egresados);
        this.actualizarChartsGlobal(this.egresados);

        this.prepararCohortesDesdeEgresados(this.egresados);

        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  normalizarSituacion(valor: any): string | null {
    if (!valor) return null;
    const limpio = valor.toString().trim().toLowerCase();
    const match = this.situaciones.find((s) => s.value.toLowerCase() === limpio);
    return match ? match.value : null;
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

    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  cambiarAModoNuevo() {
    this.estudianteSeleccionado = null;
    this.existeSeguimiento = false;
    this.documentosExistentes = [];
    this.documentosSeleccionados = [];
    this.intentoGuardar = false;

    this.rutDuplicadoNuevo = false;
    this.rutDuplicadoExistente = false;
    this.anioIngresoInvalidoNuevo = false;

    this.planSeleccionadoId = null;
    this.planOriginalId = null;

    this.formulario.reset();
    this.formulario.get('planEstudios')?.setValue('', { emitEvent: false });

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
    this.existeSeguimiento = false;
    this.documentosExistentes = [];
    this.rutDuplicadoExistente = false;

    this.planSeleccionadoId = null;
    this.planOriginalId = null;

    this.formulario.get('planEstudios')?.setValue('', { emitEvent: false });

    if (!this.estudianteSeleccionado?.idEstudiante) {
      this.formulario.reset();
      this.formulario.get('planEstudios')?.setValue('', { emitEvent: false });
      return;
    }

    const id = this.estudianteSeleccionado.idEstudiante;

    this.egresadosService.findOneByEstudiante(id).subscribe({
      next: (egresado: any) => {
        const eg = egresado?.data ? egresado.data : egresado;

        if (!eg || Object.keys(eg).length === 0) {
          this.resetFormSinSeguimiento();
          return;
        }

        this.existeSeguimiento = true;

        // ✅ REFACTOR: mapper central
        const { planOriginalId, planSeleccionadoId } = extractPlanIds(egresado);
        this.planOriginalId = planOriginalId;
        this.planSeleccionadoId = planSeleccionadoId;

        patchFormFromEgresado(this.formulario, egresado, this.situaciones);

        this.documentosExistentes = eg.documentos || [];

        this.messageService.add({
          severity: 'info',
          summary: 'Datos cargados',
          detail: '✅ Formulario rellenado automáticamente.',
        });
      },
      error: () => {
        this.resetFormSinSeguimiento();
      },
    });
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    this.documentosSeleccionados = [];
    for (let i = 0; i < files.length; i++) {
      this.documentosSeleccionados.push(files[i]);
    }
  }

  limpiarInputArchivos() {
    this.documentosSeleccionados = [];
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  private actualizarPlanSiCambia$(idEstudiante: number): Observable<any> {
    const nuevoIdPlan = this.planSeleccionadoId ? Number(this.planSeleccionadoId) : null;

    if (!nuevoIdPlan) return of(null);
    if (this.planOriginalId && nuevoIdPlan === Number(this.planOriginalId)) return of(null);

    const dto: UpdateEstudianteDTO = { idPlan: nuevoIdPlan };
    return this.estudiantesService.update(idEstudiante, dto);
  }

  guardar() {
    this.intentoGuardar = true;
    this.formulario.markAllAsTouched();

    // ✅ DEBUG: dime por qué no guarda (no cambia el flujo)
    const logStop = (msg: string) => {
      console.warn('🛑 NO GUARDA:', msg, {
        modo: this.modoEstudiante,
        formularioInvalid: this.formulario?.invalid,
        estudianteSeleccionado: this.estudianteSeleccionado,
        planSeleccionadoId: this.planSeleccionadoId,
        rutExistente: this.estudianteSeleccionado?.rut,
        rutNuevo: this.nuevoEstudiante?.rut,
        errores: this.formulario?.errors,
        controles: Object.keys(this.formulario?.controls || {}).reduce((acc: any, k) => {
          const c = this.formulario.get(k);
          if (c?.invalid) acc[k] = c.errors;
          return acc;
        }, {}),
      });

      this.messageService.add({
        severity: 'warn',
        summary: 'No se puede guardar',
        detail: msg,
      });
    };

    // ==============================
    // ✅ EGRESADO (token)
    // ==============================
    if (this.isEgresado) {
      if (this.formulario.invalid) {
        logStop('Formulario inválido (EGRESADO). Revisa requeridos.');
        return;
      }

      const svc: any = this.egresadosService as any;
      const id = this.idEstudianteToken;

      if (!id || Number.isNaN(id)) {
        logStop('No se pudo identificar idEstudiante en token.');
        return;
      }

      // ... (deja tu código EGRESADO igual)
      // ⚠️ pega aquí tu bloque actual sin cambios
    }

    // ==============================
    // ✅ ADMIN / SECRETARIA
    // ==============================
    if (this.modoEstudiante === 'nuevo') {
      this.anioIngresoInvalidoNuevo = !this.validarAnioIngresoNuevo();
      if (this.anioIngresoInvalidoNuevo) {
        logStop(
          `Año ingreso inválido. Debe estar entre ${this.MIN_ANIO_INGRESO} y ${this.MAX_ANIO_INGRESO}.`
        );
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
      logStop('RUT inválido (solo cuerpo 7 u 8 dígitos).');
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
      logStop(
        'Formulario inválido. Falta completar requeridos (Año fin estudios, Situación, Nivel rentas).'
      );
      return;
    }

    // ✅ desde aquí tu flujo original sigue igual:
    // (NO toco nada más)
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

          return this.actualizarPlanSiCambia$(idEstudiante).pipe(
            switchMap(() => {
              if (this.existeSeguimiento) {
                if (this.documentosSeleccionados.length === 0) {
                  const dto: UpdateEgresadoDto = {
                    ...this.formulario.getRawValue(),
                  };

                  return this.egresadosService.updateByEstudiante(idEstudiante, dto);
                }

                // ✅ REFACTOR: util FormData
                const formData = buildFormDataFromObject(this.formulario.getRawValue());
                appendFiles(formData, 'documentos', this.documentosSeleccionados);

                return this.egresadosService.updateWithFilesByEstudiante(idEstudiante, formData);
              }

              // ✅ REFACTOR: util FormData
              const formData = buildFormDataFromObject(this.formulario.getRawValue());
              formData.append('idEstudiante', idEstudiante.toString());
              appendFiles(formData, 'documentos', this.documentosSeleccionados);

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
    switch (situacion) {
      case 'Trabajando':
        return 'success';
      case 'Cesante':
        return 'danger';
      default:
        return 'warning';
    }
  }

  formatCLP(valor: number): string {
    if (!valor) return '-';
    return valor.toLocaleString('es-CL');
  }

  onGlobalFilter(table: any, event: any) {
    table.filterGlobal(event.target.value, 'contains');
  }

  abrirEdicion(egresado: any) {
    this.modoEstudiante = 'existente';
    this.drawerFormulario = true;
    this.seleccionarEstudianteParaEdicion(egresado);

    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  private normalizarSituacionStats(valor: any): string {
    return (valor ?? '').toString().trim().toLowerCase();
  }

  private recalcularStats(lista: any[]) {
    const arr = Array.isArray(lista) ? lista : [];

    const total = arr.length;

    const trabajando = arr.filter(
      (x) => this.normalizarSituacionStats(x?.situacionActual) === 'trabajando'
    ).length;

    const cesante = arr.filter(
      (x) => this.normalizarSituacionStats(x?.situacionActual) === 'cesante'
    ).length;

    const otro = arr.filter(
      (x) => this.normalizarSituacionStats(x?.situacionActual) === 'otro'
    ).length;

    this.stats = { total, trabajando, cesante, otro };
  }

  private actualizarChartsGlobal(lista: any[]) {
    const arr = Array.isArray(lista) ? lista : [];

    this.donutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true, boxWidth: 8 },
        },
        tooltip: { enabled: true },
      },
    };

    this.donutSituacionData = {
      labels: ['Trabajando', 'Cesante', 'Otro'],
      datasets: [
        {
          data: [this.stats.trabajando, this.stats.cesante, this.stats.otro],
          backgroundColor: ['#047857', '#E11D48', '#D97706'],
          hoverBackgroundColor: ['#059669', '#F43F5E', '#F59E0B'],
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    };

    const conDocs = arr.filter((x) => (x?.documentos?.length ?? 0) > 0).length;
    const sinDocs = arr.length - conDocs;

    this.donutDocsData = {
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
      const yRaw =
        x?.anioFinEstudios ??
        (x?.fechaEgreso ? new Date(x.fechaEgreso).getFullYear() : null);
      const y = typeof yRaw === 'number' ? yRaw : parseInt(yRaw, 10);
      if (!Number.isFinite(y)) continue;
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

    const palette = [
      '#0F766E',
      '#2563EB',
      '#7C3AED',
      '#DB2777',
      '#EA580C',
      '#16A34A',
      '#64748B',
    ];

    this.donutAnioData = {
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
  }

  private obtenerAnioFinDesdeEgresado(e: any): number | null {
    const yRaw =
      e?.anioFinEstudios ??
      (e?.fechaEgreso ? new Date(e.fechaEgreso).getFullYear() : null);

    const y = typeof yRaw === 'number' ? yRaw : parseInt(yRaw, 10);
    return Number.isFinite(y) ? y : null;
  }

  private prepararCohortesDesdeEgresados(lista: any[]) {
    const arr = Array.isArray(lista) ? lista : [];

    const setAnios = new Set<number>();
    for (const e of arr) {
      const y = this.obtenerAnioFinDesdeEgresado(e);
      if (y) setAnios.add(y);
    }

    const anios = Array.from(setAnios.values()).sort((a, b) => b - a);

    this.cohortesOptions = anios.map((y) => ({ label: y.toString(), value: y }));

    if (!this.cohorteSeleccionada && anios.length > 0) {
      this.cohorteSeleccionada = anios[0];
    }

    this.recalcularDashboardCohorte();
  }

  onCohorteChange() {
    this.recalcularDashboardCohorte();
  }

  private recalcularDashboardCohorte() {
    const cohorte = this.cohorteSeleccionada;

    if (!cohorte) {
      this.kpiCohorte = {
        total: 0,
        trabajando: 0,
        cesante: 0,
        otro: 0,
        conDocs: 0,
        porcentajeConDocs: 0,
      };
      this.barSituacionCohorteData = {
        labels: ['Trabajando', 'Cesante', 'Otro'],
        datasets: [{ data: [0, 0, 0], label: 'Cantidad' }],
      };
      this.donutRentasCohorteData = {
        labels: ['Sin datos'],
        datasets: [{ data: [1] }],
      };
      return;
    }

    const arr = (this.egresados ?? []).filter(
      (e) => this.obtenerAnioFinDesdeEgresado(e) === cohorte
    );

    const total = arr.length;

    const trabajando = arr.filter(
      (x) => this.normalizarSituacionStats(x?.situacionActual) === 'trabajando'
    ).length;

    const cesante = arr.filter(
      (x) => this.normalizarSituacionStats(x?.situacionActual) === 'cesante'
    ).length;

    const otro = arr.filter(
      (x) => this.normalizarSituacionStats(x?.situacionActual) === 'otro'
    ).length;

    const conDocs = arr.filter((x) => (x?.documentos?.length ?? 0) > 0).length;

    const porcentajeConDocs = total > 0 ? Math.round((conDocs / total) * 100) : 0;

    this.kpiCohorte = {
      total,
      trabajando,
      cesante,
      otro,
      conDocs,
      porcentajeConDocs,
    };

    this.barSituacionCohorteData = {
      labels: ['Trabajando', 'Cesante', 'Otro'],
      datasets: [
        {
          label: `Cohorte ${cohorte}`,
          data: [trabajando, cesante, otro],
        },
      ],
    };

    const conteoRentas = new Map<string, number>();

    for (const e of arr) {
      const r = (e?.nivelRentas ?? '').toString().trim();
      if (!r) continue;
      conteoRentas.set(r, (conteoRentas.get(r) ?? 0) + 1);
    }

    const pares = Array.from(conteoRentas.entries()).sort((a, b) => b[1] - a[1]);

    if (pares.length === 0) {
      this.donutRentasCohorteData = {
        labels: ['Sin datos'],
        datasets: [{ data: [1] }],
      };
    } else {
      const labels = pares.map(([k]) => k);
      const data = pares.map(([, v]) => v);

      this.donutRentasCohorteData = {
        labels,
        datasets: [
          {
            data,
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        ],
      };
    }
  }
}
