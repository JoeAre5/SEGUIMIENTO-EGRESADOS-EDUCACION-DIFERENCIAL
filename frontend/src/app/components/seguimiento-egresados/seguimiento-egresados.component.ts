import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';

import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { SidebarModule } from 'primeng/sidebar';

import {
  EgresadosService,
  UpdateEgresadoDto,
} from '../../services/egresados.service';
import {
  EstudiantesService,
  EstudianteDTO,
  CreateEstudianteDTO,
} from '../../services/estudiantes.service';

import { switchMap, of } from 'rxjs';

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
  ],
  templateUrl: './seguimiento-egresados.component.html',
  styleUrls: ['./seguimiento-egresados.component.css'], // ✅ estándar Angular
})
export class SeguimientoEgresadosComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

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

  // ✅ Modal de filtros
  modalFiltrosVisible: boolean = false;

  // ✅ Valores temporales de filtros (between)
  filtroValores: Record<string, any> = {};

  // ✅ Config filtros (render en HTML)
  filtrosConfig = [
    { label: 'Situación', field: 'situacionActual', type: 'dropdown' },

    {
      label: 'Año Seguimiento',
      field: 'anioSeguimiento',
      type: 'range-number',
      placeholderMin: 'Desde',
      placeholderMax: 'Hasta',
    },
    {
      label: 'Año Ingreso Laboral',
      field: 'anioIngresoLaboral',
      type: 'range-number',
      placeholderMin: 'Desde',
      placeholderMax: 'Hasta',
    },

    { label: 'Empresa', field: 'empresa', type: 'text', placeholder: 'Ej: Google' },
    { label: 'Cargo', field: 'cargo', type: 'text', placeholder: 'Ej: Ingeniero' },

    {
      label: 'Sueldo (CLP)',
      field: 'sueldo',
      type: 'range-number',
      placeholderMin: 'Min',
      placeholderMax: 'Max',
    },

    { label: 'Teléfono', field: 'telefono', type: 'text', placeholder: 'Ej: +56 9 12345678' },
    { label: 'Email', field: 'emailContacto', type: 'text', placeholder: 'Ej: nombre@dominio.cl' },
  ];

  drawerFormulario: boolean = false;

  planes: PlanDTO[] = [];
  planesOptions: any[] = [];

  situaciones = [
    { label: 'Trabajando', value: 'Trabajando' },
    { label: 'Cesante', value: 'Cesante' },
    { label: 'Estudiando', value: 'Estudiando' },
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

  // ✅ Años lógicos
  readonly CURRENT_YEAR = new Date().getFullYear();
  readonly MIN_ANIO_INGRESO = 1980;
  readonly MAX_ANIO_INGRESO = this.CURRENT_YEAR;

  readonly MIN_ANIO_SEGUIMIENTO = 2000;
  readonly MAX_ANIO_SEGUIMIENTO = this.CURRENT_YEAR + 1;

  rutDuplicadoNuevo = false;
  rutDuplicadoExistente = false;
  anioIngresoInvalidoNuevo = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private egresadosService: EgresadosService,
    private estudiantesService: EstudiantesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarEgresados();
    this.cargarEstudiantes();
    this.cargarPlanes();
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
        fechaEgreso: [null, Validators.required],
        situacionActual: [null, Validators.required],
        empresa: [''],
        cargo: [''],
        sueldo: [null],

        // ✅ Año ingreso laboral: SOLO rango lógico
        anioIngresoLaboral: [
          null,
          [
            Validators.min(this.MIN_ANIO_INGRESO),
            Validators.max(this.CURRENT_YEAR + 1),
          ],
        ],

        anioSeguimiento: [
          2026,
          [
            Validators.required,
            Validators.min(this.MIN_ANIO_SEGUIMIENTO),
            Validators.max(this.MAX_ANIO_SEGUIMIENTO),
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
        direccion: ['', [Validators.maxLength(250)]],
        contactoAlternativo: ['', [Validators.maxLength(120)]],
      },
      {
        validators: [this.validarReglasCruzadas()],
      }
    );
  }

  // ✅ Reglas cruzadas:
  // 1) Año seguimiento >= año egreso
  // 2) Año ingreso laboral >= año egreso (si se ingresó)
  private validarReglasCruzadas(): ValidatorFn {
    return (control: AbstractControl) => {
      const group = control as FormGroup;

      const fecha = group.get('fechaEgreso')?.value;
      const anioSeg = group.get('anioSeguimiento')?.value;
      const anioIngresoLab = group.get('anioIngresoLaboral')?.value;

      if (!fecha) return null;

      const anioEgreso = new Date(fecha).getFullYear();
      const errors: any = {};

      if (anioSeg && anioSeg < anioEgreso) {
        errors.anioSeguimientoMenorQueEgreso = true;
      }

      if (
        anioIngresoLab !== null &&
        anioIngresoLab !== undefined &&
        anioIngresoLab !== '' &&
        anioIngresoLab < anioEgreso
      ) {
        errors.anioIngresoLaboralMenorQueEgreso = true;
      }

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

  private formatearRutControlado(raw: string): string {
    let s = (raw ?? '').toString().toUpperCase();
    s = s.replace(/[^0-9K]/g, '');
    if (s === 'K') return '';

    let cuerpo = '';
    let dv = '';

    for (const ch of s) {
      if (/\d/.test(ch)) {
        if (dv) continue;
        if (cuerpo.length < 8) cuerpo += ch;
        else dv = ch;
      } else if (ch === 'K') {
        dv = 'K';
      }
    }

    if (!cuerpo) return '';

    const cuerpoConPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return dv ? `${cuerpoConPuntos}-${dv}` : cuerpoConPuntos;
  }

  private normalizarRut(rut: string): string {
    return (rut ?? '').toString().toUpperCase().replace(/[^0-9K]/g, '');
  }

  private existeRutEnEstudiantes(rut: string, excluirIdEstudiante?: number | null): boolean {
    const objetivo = this.normalizarRut(rut);
    if (!objetivo || objetivo.length < 2) return false;

    return (this.estudiantes ?? []).some((e) => {
      if (excluirIdEstudiante && e.idEstudiante === excluirIdEstudiante) return false;
      return this.normalizarRut(e.rut) === objetivo;
    });
  }

  onRutInputExistente() {
    if (!this.estudianteSeleccionado) return;

    this.estudianteSeleccionado.rut = this.formatearRutControlado(
      (this.estudianteSeleccionado.rut as any) ?? ''
    );

    const id = this.estudianteSeleccionado?.idEstudiante ?? null;
    this.rutDuplicadoExistente = this.existeRutEnEstudiantes(
      this.estudianteSeleccionado.rut,
      id
    );
  }

  onRutInputNuevo() {
    this.nuevoEstudiante.rut = this.formatearRutControlado(
      (this.nuevoEstudiante.rut as any) ?? ''
    );

    this.rutDuplicadoNuevo = this.existeRutEnEstudiantes(this.nuevoEstudiante.rut);
  }

  private validarAnioIngresoNuevo(): boolean {
    const v = this.nuevoEstudiante?.agnioIngreso;
    if (v === undefined || v === null) return false;
    if (v < this.MIN_ANIO_INGRESO || v > this.MAX_ANIO_INGRESO) return false;
    return true;
  }

  isRutValido(rutFormateado: string): boolean {
    if (!rutFormateado) return false;

    const limpio = rutFormateado
      .toString()
      .toUpperCase()
      .replace(/[^0-9K]/g, '');

    if (limpio.length < 2) return false;

    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);

    if (!/^\d+$/.test(cuerpo)) return false;
    if (cuerpo.length < 7 || cuerpo.length > 8) return false;

    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i], 10) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resto = suma % 11;
    const dvCalc = 11 - resto;

    let dvEsperado = '';
    if (dvCalc === 11) dvEsperado = '0';
    else if (dvCalc === 10) dvEsperado = 'K';
    else dvEsperado = dvCalc.toString();

    return dvEsperado === dv;
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

  nuevoSeguimiento() {
    this.resetFormulario();
    this.drawerFormulario = true;
  }

  abrirFormularioNuevo() {
    this.resetFormulario();
    this.modoEstudiante = 'existente';
    this.drawerFormulario = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    this.formulario.reset({ anioSeguimiento: 2026 });

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

    if (!this.estudianteSeleccionado?.idEstudiante) {
      this.formulario.reset({ anioSeguimiento: 2026 });
      return;
    }

    const id = this.estudianteSeleccionado.idEstudiante;

    this.egresadosService.findOneByEstudiante(id).subscribe({
      next: (egresado: any) => {
        const eg = egresado?.data ? egresado.data : egresado;

        if (!eg || Object.keys(eg).length === 0) {
          this.existeSeguimiento = false;
          this.documentosExistentes = [];
          this.formulario.reset({ anioSeguimiento: 2026 });
          return;
        }

        this.existeSeguimiento = true;

        const fechaDate = eg.fechaEgreso ? new Date(eg.fechaEgreso) : null;

        this.formulario.patchValue({
          fechaEgreso: fechaDate,
          situacionActual: this.normalizarSituacion(eg.situacionActual),
          empresa: eg.empresa ?? '',
          cargo: eg.cargo ?? '',
          sueldo: eg.sueldo ?? null,
          anioIngresoLaboral: eg.anioIngresoLaboral ?? null,
          anioSeguimiento: eg.anioSeguimiento ?? 2026,
          telefono: eg.telefono ?? '',
          emailContacto: eg.emailContacto ?? '',
          linkedin: eg.linkedin ?? '',
          direccion: eg.direccion ?? '',
          contactoAlternativo: eg.contactoAlternativo ?? '',
        });

        this.documentosExistentes = eg.documentos || [];

        this.messageService.add({
          severity: 'info',
          summary: 'Datos cargados',
          detail: '✅ Formulario rellenado automáticamente.',
        });
      },
      error: () => {
        this.existeSeguimiento = false;
        this.documentosExistentes = [];
        this.formulario.reset({ anioSeguimiento: 2026 });
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

  guardar() {
    this.intentoGuardar = true;
    this.formulario.markAllAsTouched();

    if (this.modoEstudiante === 'nuevo') {
      this.anioIngresoInvalidoNuevo = !this.validarAnioIngresoNuevo();
      if (this.anioIngresoInvalidoNuevo) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Año ingreso inválido',
          detail: `Debe estar entre ${this.MIN_ANIO_INGRESO} y ${this.MAX_ANIO_INGRESO}.`,
        });
        return;
      }
    }

    if (this.modoEstudiante === 'nuevo' && this.rutDuplicadoNuevo) {
      this.messageService.add({
        severity: 'warn',
        summary: 'RUT duplicado',
        detail: 'Ya existe un estudiante con ese RUT.',
      });
      return;
    }

    if (this.modoEstudiante === 'existente' && this.rutDuplicadoExistente) {
      this.messageService.add({
        severity: 'warn',
        summary: 'RUT duplicado',
        detail: 'Ese RUT ya pertenece a otro estudiante.',
      });
      return;
    }

    const rutActual =
      this.modoEstudiante === 'existente'
        ? this.estudianteSeleccionado?.rut ?? ''
        : this.nuevoEstudiante?.rut ?? '';

    if (!this.isRutValido(rutActual)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'RUT inválido',
        detail: 'Revisa el RUT y el dígito verificador.',
      });
      return;
    }

    if (this.modoEstudiante === 'existente' && !this.estudianteSeleccionado) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Falta estudiante',
        detail: 'Debes seleccionar un estudiante.',
      });
      return;
    }

    if (this.modoEstudiante === 'nuevo' && !this.nuevoEstudiante.idPlan) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Falta Plan',
        detail: 'Debes seleccionar un plan de estudios.',
      });
      return;
    }

    if (this.formulario.invalid) return;

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

          if (this.existeSeguimiento) {
            if (this.documentosSeleccionados.length === 0) {
              const dto: UpdateEgresadoDto = {
                ...this.formulario.value,
                fechaEgreso: this.formulario.value.fechaEgreso
                  ? new Date(this.formulario.value.fechaEgreso).toISOString().split('T')[0]
                  : undefined,
              };

              return this.egresadosService.updateByEstudiante(idEstudiante, dto);
            }

            const formData = new FormData();

            const fecha = this.formulario.value.fechaEgreso;
            const fechaFormateada = new Date(fecha).toISOString().split('T')[0];
            formData.append('fechaEgreso', fechaFormateada);

            Object.entries(this.formulario.value).forEach(([key, value]) => {
              if (key !== 'fechaEgreso' && value !== null && value !== undefined && value !== '') {
                formData.append(key, value.toString());
              }
            });

            this.documentosSeleccionados.forEach((file) => formData.append('documentos', file));

            return this.egresadosService.updateWithFilesByEstudiante(idEstudiante, formData);
          }

          const formData = new FormData();
          formData.append('idEstudiante', idEstudiante.toString());

          const fecha = this.formulario.value.fechaEgreso;
          const fechaFormateada = new Date(fecha).toISOString().split('T')[0];
          formData.append('fechaEgreso', fechaFormateada);

          Object.entries(this.formulario.value).forEach(([key, value]) => {
            if (key !== 'fechaEgreso' && value !== null && value !== undefined && value !== '') {
              formData.append(key, value.toString());
            }
          });

          this.documentosSeleccionados.forEach((file) => formData.append('documentos', file));

          return this.egresadosService.createWithFiles(formData);
        })
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Guardado',
            detail: this.existeSeguimiento
              ? '✅ Seguimiento actualizado + documentos agregados.'
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
    this.formulario.reset({ anioSeguimiento: 2026 });
    this.documentosSeleccionados = [];
    this.documentosExistentes = [];
    this.estudianteSeleccionado = null;
    this.intentoGuardar = false;
    this.existeSeguimiento = false;
    this.modoEstudiante = 'existente';

    this.rutDuplicadoNuevo = false;
    this.rutDuplicadoExistente = false;
    this.anioIngresoInvalidoNuevo = false;

    this.nuevoEstudiante.idPlan = undefined;

    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  volverMenu() {
    this.router.navigateByUrl('/menu');
  }

  verDocumento(doc: any) {
    const url = this.egresadosService.getDocumentoUrl(doc.url);
    window.open(url, '_blank');
  }

  descargarDocumento(doc: any) {
    if (!doc?.url) return;

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
      case 'Estudiando':
        return 'info';
      default:
        return 'warning';
    }
  }

  formatCLP(valor: number): string {
    // ✅ se mantiene tu lógica “tal cual”
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  abrirModalDocumentos(egresado: any) {
    this.documentosModal = egresado.documentos || [];
    this.modalDocsVisible = true;
  }

  cerrarModalDocumentos() {
    this.modalDocsVisible = false;
    this.documentosModal = [];
  }

  irAlFormulario() {
    this.drawerFormulario = true;
  }

  /**
   * ✅ NECESARIO para el HTML:
   * Maneja cambios en filtros tipo rango (between) desde el modal,
   * evitando lógica compleja en el template.
   */
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
}
