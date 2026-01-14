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

  // ─────────────────────────────────────────────
  // ✅ NUEVO: modo “ESTUDIANTE”
  // ─────────────────────────────────────────────
  esEstudiante: boolean = false; // si true: solo ve su formulario
  estudianteIdToken: number | null = null;

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
    // ✅ Detectar rol desde token (sin depender de otros servicios)
    this.detectarModoEstudianteDesdeToken();

    if (this.esEstudiante) {
      // ✅ Estudiante: solo cargar su seguimiento
      this.drawerFormulario = true; // opcional: para que se vea el formulario directo si usas sidebar
      this.cargarMiSeguimiento();
      return;
    }

    // ✅ Otros roles: mantener comportamiento actual
    this.cargarEgresados();
    this.cargarEstudiantes();
  }

  // ─────────────────────────────────────────────
  // ✅ NUEVO: token helpers (no afecta lo existente)
  // ─────────────────────────────────────────────

  private detectarModoEstudianteDesdeToken() {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return;

      const payload = this.decodeJwtPayload(token);
      const role = payload?.role;

      this.esEstudiante = role === 'ESTUDIANTE';

      // tu AuthService agrega estudianteId al token
      const estudianteId = payload?.estudianteId;
      this.estudianteIdToken =
        typeof estudianteId === 'number' ? estudianteId : null;
    } catch {
      // si falla, no bloqueamos nada
      this.esEstudiante = false;
      this.estudianteIdToken = null;
    }
  }

  private decodeJwtPayload(token: string): any | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  }

  // ✅ Cargar seguimiento del estudiante autenticado
  private cargarMiSeguimiento() {
    this.loading = true;
    this.existeSeguimiento = false;
    this.documentosExistentes = [];
    this.formulario.reset({ anioSeguimiento: 2026 });

    this.egresadosService.getMiSeguimiento().subscribe({
      next: (egresado: any) => {
        // viene directo el egresado (o {} si no existe, según tu backend)
        const eg = egresado?.data ? egresado.data : egresado;

        // Si backend retorna null o {}, lo tratamos como “no existe”
        if (!eg || Object.keys(eg).length === 0) {
          this.existeSeguimiento = false;
          this.loading = false;

          this.messageService.add({
            severity: 'info',
            summary: 'Seguimiento',
            detail:
              '📌 Aún no tienes seguimiento creado. Completa el formulario y guarda.',
          });
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

        // ✅ opcional: mostrar datos del estudiante en el dropdown (aunque el estudiante no debe elegir)
        if (eg?.Estudiante) {
          this.estudianteSeleccionado = {
            idEstudiante: this.estudianteIdToken ?? 0,
            nombreCompleto: eg.Estudiante.nombreCompleto,
            rut: eg.Estudiante.rut,
            agnioIngreso: eg.Estudiante?.agnioIngreso,
          };
          this.modoEstudiante = 'existente';
        }

        this.loading = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Datos cargados',
          detail: '✅ Tu seguimiento fue cargado correctamente.',
        });
      },
      error: (err: any) => {
        console.error('❌ ERROR MI SEGUIMIENTO:', err);
        this.loading = false;

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: '❌ No se pudo cargar tu seguimiento (token o permisos).',
        });
      },
    });
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

      telefono: [''],
      emailContacto: ['', Validators.email],

      linkedin: [''],
      direccion: [''],
      contactoAlternativo: [''],
    });
  }

  cargarEstudiantes() {
    this.estudiantesService.findAll().subscribe({
      next: (data: EstudianteDTO[]) => (this.estudiantes = data),
      error: (err: any) => console.error(err),
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
    const match = this.situaciones.find(
      (s) => s.value.toLowerCase() === limpio
    );
    return match ? match.value : null;
  }

  // ✅ AUTO-RELLENO AL SELECCIONAR ESTUDIANTE
  onEstudianteChange() {
    // ✅ si es estudiante, NO debe usar este flujo (ya usa miSeguimiento)
    if (this.esEstudiante) return;

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

    // ─────────────────────────────────────────────
    // ✅ NUEVO: flujo ESTUDIANTE (solo su propio seguimiento)
    // ─────────────────────────────────────────────
    if (this.esEstudiante) {
      if (this.formulario.invalid) {
        this.formulario.markAllAsTouched();
        return;
      }

      // si NO hay archivos -> PATCH texto
      if (this.documentosSeleccionados.length === 0) {
        const dto: UpdateEgresadoDto = {
          ...this.formulario.value,
          fechaEgreso: this.formulario.value.fechaEgreso
            ? new Date(this.formulario.value.fechaEgreso)
                .toISOString()
                .split('T')[0]
            : undefined,
        };

        this.egresadosService.updateMiSeguimiento(dto).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Guardado',
              detail: '✅ Tu seguimiento fue actualizado correctamente.',
            });
            this.limpiarInputArchivos();
            this.cargarMiSeguimiento();
          },
          error: (err: any) => {
            console.error('❌ ERROR GUARDAR MI SEGUIMIENTO:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error al guardar',
              detail:
                err?.error?.message || err?.message || '❌ No se pudo guardar.',
            });
          },
        });

        return;
      }

      // si HAY archivos -> PATCH files
      const formData = new FormData();

      const fecha = this.formulario.value.fechaEgreso;
      const fechaFormateada = fecha
        ? new Date(fecha).toISOString().split('T')[0]
        : '';

      if (fechaFormateada) {
        formData.append('fechaEgreso', fechaFormateada);
      }

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

      this.egresadosService.updateMiSeguimientoFiles(formData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Guardado',
            detail: '✅ Seguimiento actualizado + documentos agregados.',
          });
          this.limpiarInputArchivos();
          this.cargarMiSeguimiento();
        },
        error: (err: any) => {
          console.error('❌ ERROR GUARDAR MI SEGUIMIENTO FILES:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error al guardar',
            detail:
              err?.error?.message || err?.message || '❌ No se pudo guardar.',
          });
        },
      });

      return;
    }

    // ─────────────────────────────────────────────
    // ✅ FLUJO ORIGINAL (NO ESTUDIANTE): se mantiene intacto
    // ─────────────────────────────────────────────

    if (this.modoEstudiante === 'existente' && !this.estudianteSeleccionado) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Falta estudiante',
        detail: 'Debes seleccionar un estudiante.',
      });
      return;
    }

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
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
        },
        error: (err: any) => {
          console.error('❌ ERROR GUARDAR:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error al guardar',
            detail:
              err?.error?.message || err?.message || '❌ No se pudo guardar.',
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

            // ✅ si es estudiante, recarga su seguimiento; si no, recarga tabla
            if (this.esEstudiante) this.cargarMiSeguimiento();
            else this.cargarEgresados();

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
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  volverMenu() {
    // ✅ si es estudiante, no debería ir a /menu
    if (this.esEstudiante) {
      this.router.navigateByUrl('/seguimiento-egresados');
      return;
    }
    this.router.navigateByUrl('/menu');
  }

  verDocumento(doc: any) {
    const url = this.egresadosService.getDocumentoUrl(doc.url);
    window.open(url, '_blank');
  }

  descargarDocumento(doc: any) {
    const url = this.egresadosService.getDocumentoUrl(doc.url);
    window.open(url, '_blank');
  }

  eliminar(egresado: any) {
    // ✅ estudiante no debería eliminar registros completos desde frontend
    if (this.esEstudiante) return;

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
    // ✅ estudiante no debería editar desde tabla
    if (this.esEstudiante) return;

    this.estudianteSeleccionado = egresado.Estudiante;
    this.onEstudianteChange();
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
