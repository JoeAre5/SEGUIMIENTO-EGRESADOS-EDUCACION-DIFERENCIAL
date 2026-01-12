import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
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
import { SidebarModule } from 'primeng/sidebar'; // ✅ NUEVO

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

// ✅ ✅ NUEVO: INTERFAZ PLAN
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
    SidebarModule, // ✅ NUEVO
  ],
  templateUrl: './seguimiento-egresados.component.html',
  styleUrl: './seguimiento-egresados.component.css',
})
export class SeguimientoEgresadosComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  formulario!: FormGroup;

  documentosSeleccionados: File[] = [];

  // ✅ Documentos existentes del egresado seleccionado
  documentosExistentes: any[] = [];

  egresados: any[] = [];
  estudiantes: EstudianteDTO[] = [];
  loading = true;

  estudianteSeleccionado: EstudianteDTO | null = null;
  modoEstudiante: 'existente' | 'nuevo' = 'existente';

  // ✅ saber si ya existe seguimiento → evita duplicar
  existeSeguimiento: boolean = false;

  // ✅ MODAL DOCUMENTOS
  modalDocsVisible = false;
  documentosModal: any[] = [];

  // ✅ Drawer / Sidebar
  drawerFormulario: boolean = false;

  // ✅ ✅ NUEVO: PLANES DISPONIBLES
  planes: PlanDTO[] = [];

  // ✅ ✅ NUEVO: OPCIONES PARA DROPDOWN (PrimeNG)
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

  // ✅✅✅ VALIDACIONES (sin afectar tu UI)
  // ✅ Teléfono: permite prefijo +CC (1–3 dígitos) opcional y luego EXACTO 8 dígitos
  private readonly PHONE_8_REGEX = /^(\+?\d{1,3}\s?)?\d{8}$/;

  // Email simple/robusto
  private readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // LinkedIn perfil o empresa
  private readonly LINKEDIN_REGEX =
    /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[A-Za-z0-9-_%]+\/?(\?.*)?$/i;

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
    this.cargarPlanes(); // ✅ ✅ NUEVO
  }

  // ✅✅✅ Helpers para tus mensajes en HTML (los que agregamos)
  isInvalid(controlName: string): boolean {
    const c = this.formulario.get(controlName);
    return !!(c && c.invalid && (c.dirty || c.touched || this.intentoGuardar));
  }

  getError(controlName: string): any {
    return this.formulario.get(controlName)?.errors;
  }

  crearFormulario() {
    this.formulario = this.fb.group({
      fechaEgreso: [null, Validators.required],
      situacionActual: [null, Validators.required],
      empresa: [''],
      cargo: [''],
      sueldo: [null],
      anioIngresoLaboral: [null],
      anioSeguimiento: [2026, Validators.required],

      // ✅✅✅ VALIDACIONES CONTACTO (solo valida si escriben algo)
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
    });
  }

  // ✅✅✅ Teléfono: solo 8 dígitos + código país opcional (+CC)
  // Se usa con (input)="onTelefonoInput()" en el HTML
  onTelefonoInput() {
    const c = this.formulario.get('telefono');
    if (!c) return;

    let v = (c.value ?? '').toString();

    // Permitir + solo al inicio y dígitos
    v = v.replace(/[^\d+]/g, '');

    // Si hay +, solo permitir uno al inicio
    if (v.includes('+')) {
      v = '+' + v.replace(/\+/g, '');
    }

    if (v.startsWith('+')) {
      const digits = v.slice(1).replace(/\D/g, '');
      const prefijo = digits.slice(0, 3); // hasta 3 dígitos de país
      const local = digits.slice(3).slice(0, 8); // EXACTO máx 8
      v = '+' + prefijo + (local.length ? ' ' + local : '');
    } else {
      v = v.replace(/\D/g, '').slice(0, 8);
    }

    c.setValue(v, { emitEvent: false });
  }

  // ✅✅✅ RUT: cuerpo solo números (máx 8), DV 1 solo (0-9 o K). Formatea con . y -
  private formatearRutControlado(raw: string): string {
    let s = (raw ?? '').toString().toUpperCase();

    // Solo dejamos dígitos y K (todo lo demás fuera)
    s = s.replace(/[^0-9K]/g, '');

    // Si quedó solo "K" (sin cuerpo), no es válido como entrada
    if (s === 'K') return '';

    // Tomar DV como el ÚLTIMO caracter si es dígito o K
    const last = s.slice(-1);
    const tieneDV = /^[0-9K]$/.test(last) && s.length >= 2;

    let dv = '';
    let cuerpoDigits = '';

    if (tieneDV) {
      dv = last;
      // cuerpo = todo menos el DV, PERO solo dígitos
      const sinDv = s.slice(0, -1);
      cuerpoDigits = sinDv.replace(/\D/g, '');
    } else {
      // aún no hay DV: solo cuerpo numérico
      cuerpoDigits = s.replace(/\D/g, '');
    }

    // Cuerpo máximo 8 dígitos
    cuerpoDigits = cuerpoDigits.slice(0, 8);

    if (!cuerpoDigits) return '';

    // Formato con puntos
    const cuerpoConPuntos = cuerpoDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Si hay DV, se muestra (uno solo)
    if (dv) {
      // Si el usuario puso dv pero el cuerpo es muy corto, igual se deja, el validador real decide
      return `${cuerpoConPuntos}-${dv}`;
    }

    return cuerpoConPuntos;
  }

  onRutInputExistente() {
    if (!this.estudianteSeleccionado) return;
    this.estudianteSeleccionado.rut = this.formatearRutControlado(
      (this.estudianteSeleccionado.rut as any) ?? ''
    );
  }

  onRutInputNuevo() {
    this.nuevoEstudiante.rut = this.formatearRutControlado(
      (this.nuevoEstudiante.rut as any) ?? ''
    );
  }

  // ✅✅✅ Validación real de RUT (módulo 11) con DV numérico o K.
  isRutValido(rutFormateado: string): boolean {
    if (!rutFormateado) return false;

    const limpio = rutFormateado
      .toString()
      .toUpperCase()
      .replace(/[^0-9K]/g, '');

    if (limpio.length < 2) return false;

    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);

    // cuerpo solo dígitos y largo típico (7 u 8)
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

  // ✅ ✅ ✅ NUEVO: CARGAR PLANES DESDE BACKEND
  cargarPlanes() {
    this.egresadosService.getPlanesEstudio().subscribe({
      next: (data: any[]) => {
        this.planes = data as PlanDTO[];

        // ✅ crea options para PrimeNG dropdown
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

  // ✅ ✅ ✅ NUEVAS FUNCIONES DRAWER (CORRECTAS)
  abrirDrawerFormulario() {
    this.drawerFormulario = true;
  }

  cerrarDrawerFormulario() {
    this.drawerFormulario = false;
  }

  // ✅ ✅ ✅ NUEVO: ABRIR DRAWER COMO "NUEVO"
  nuevoSeguimiento() {
    this.resetFormulario();
    this.drawerFormulario = true;
  }

  // ✅ ✅ ✅ ✅ ✅ NUEVO (NO AFECTA NADA): abrir desde botón "Nuevo / Editar" LIMPIO
  abrirFormularioNuevo() {
    this.resetFormulario(); // limpia todo (incluye estudianteSeleccionado)
    this.modoEstudiante = 'existente';
    this.drawerFormulario = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ✅ ✅ ✅ ✅ ✅ NUEVO (NO AFECTA NADA): al click "Crear Estudiante Nuevo" limpia selección anterior
  cambiarAModoNuevo() {
    // Limpia lo que estaba seleccionado antes
    this.estudianteSeleccionado = null;
    this.existeSeguimiento = false;
    this.documentosExistentes = [];
    this.documentosSeleccionados = [];
    this.intentoGuardar = false;

    // Limpia el form (mantiene año seguimiento)
    this.formulario.reset({ anioSeguimiento: 2026 });

    // Limpia el formulario de nuevo estudiante
    this.nuevoEstudiante = {
      rut: '',
      nombre: '',
      apellido: '',
      nombreSocial: '',
      agnioIngreso: undefined,
      idPlan: undefined,
    };

    // Cambia modo
    this.modoEstudiante = 'nuevo';
  }

  // ✅ ✅ ✅ NUEVO: al editar, asegurar selección real del dropdown + rellenar
  private seleccionarEstudianteParaEdicion(egresado: any) {
    const id =
      egresado?.Estudiante?.idEstudiante ??
      egresado?.idEstudiante ??
      null;

    if (!id) {
      this.estudianteSeleccionado = egresado?.Estudiante ?? null;
      setTimeout(() => this.onEstudianteChange(), 0);
      return;
    }

    const encontrado = this.estudiantes?.find((e) => e.idEstudiante === id);

    if (encontrado) {
      this.estudianteSeleccionado = encontrado;
      setTimeout(() => this.onEstudianteChange(), 0);
      return;
    }

    this.estudiantesService.findAll().subscribe({
      next: (data: EstudianteDTO[]) => {
        this.estudiantes = data;
        const found2 = this.estudiantes.find((e) => e.idEstudiante === id);
        this.estudianteSeleccionado = found2 ?? (egresado?.Estudiante ?? null);
        setTimeout(() => this.onEstudianteChange(), 0);
      },
      error: (err: any) => {
        console.error(err);
        this.estudianteSeleccionado = egresado?.Estudiante ?? null;
        setTimeout(() => this.onEstudianteChange(), 0);
      },
    });
  }

  // ✅ AUTO-RELLENO AL SELECCIONAR ESTUDIANTE
  onEstudianteChange() {
    this.existeSeguimiento = false;
    this.documentosExistentes = [];

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

  // ✅ Guardar sin duplicar y con archivos en PATCH
  guardar() {
    this.intentoGuardar = true;

    this.formulario.markAllAsTouched();

    const rutActual =
      this.modoEstudiante === 'existente'
        ? (this.estudianteSeleccionado?.rut ?? '')
        : (this.nuevoEstudiante?.rut ?? '');

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

    if (this.formulario.invalid) {
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

          if (this.existeSeguimiento) {
            if (this.documentosSeleccionados.length === 0) {
              const dto: UpdateEgresadoDto = {
                ...this.formulario.value,
                fechaEgreso: this.formulario.value.fechaEgreso
                  ? new Date(this.formulario.value.fechaEgreso)
                      .toISOString()
                      .split('T')[0]
                  : undefined,
              };

              return this.egresadosService.updateByEstudiante(idEstudiante, dto);
            }

            const formData = new FormData();

            const fecha = this.formulario.value.fechaEgreso;
            const fechaFormateada = new Date(fecha).toISOString().split('T')[0];
            formData.append('fechaEgreso', fechaFormateada);

            Object.entries(this.formulario.value).forEach(([key, value]) => {
              if (
                key !== 'fechaEgreso' &&
                value !== null &&
                value !== undefined &&
                value !== ''
              ) {
                formData.append(key, value.toString());
              }
            });

            this.documentosSeleccionados.forEach((file) =>
              formData.append('documentos', file)
            );

            return this.egresadosService.updateWithFilesByEstudiante(
              idEstudiante,
              formData
            );
          }

          const formData = new FormData();
          formData.append('idEstudiante', idEstudiante.toString());

          const fecha = this.formulario.value.fechaEgreso;
          const fechaFormateada = new Date(fecha).toISOString().split('T')[0];
          formData.append('fechaEgreso', fechaFormateada);

          Object.entries(this.formulario.value).forEach(([key, value]) => {
            if (
              key !== 'fechaEgreso' &&
              value !== null &&
              value !== undefined &&
              value !== ''
            ) {
              formData.append(key, value.toString());
            }
          });

          this.documentosSeleccionados.forEach((file) =>
            formData.append('documentos', file)
          );

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

  // ✅ ELIMINAR DOCUMENTO INDIVIDUAL
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
      a.download = filename; // fuerza descarga
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
}
