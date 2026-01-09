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
  egresados: any[] = [];
  estudiantes: EstudianteDTO[] = [];
  loading = true;

  estudianteSeleccionado: EstudianteDTO | null = null;
  modoEstudiante: 'existente' | 'nuevo' = 'existente';

  // ✅ Formulario EDICION
  editDialogVisible = false;
  editFormulario!: FormGroup;
  egresadoEditando: any = null;

  // ✅ MODAL DOCUMENTOS
  modalDocsVisible = false;
  documentosModal: any[] = [];

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
    this.crearFormularioEdicion();
  }

  ngOnInit(): void {
    this.cargarEgresados();
    this.cargarEstudiantes();
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
    });
  }

  crearFormularioEdicion() {
    this.editFormulario = this.fb.group({
      situacionActual: [null, Validators.required],
      empresa: [''],
      cargo: [''],
      sueldo: [null],
      anioIngresoLaboral: [null],
      anioSeguimiento: [null, Validators.required],
      telefono: [''],
      emailContacto: ['', Validators.email],
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

  // ✅ ✅ ✅ AUTO-RELLENO AL SELECCIONAR ESTUDIANTE
  onEstudianteChange() {
    if (!this.estudianteSeleccionado?.idEstudiante) {
      this.formulario.reset({ anioSeguimiento: 2026 });
      return;
    }

    const id = this.estudianteSeleccionado.idEstudiante;

    this.egresadosService.findOneByEstudiante(id).subscribe({
      next: (egresado: any) => {
        if (!egresado) {
          // ✅ Si no tiene seguimiento → limpiar formulario
          this.formulario.reset({ anioSeguimiento: 2026 });
          return;
        }

        // ✅ Convertir fecha (string ISO) a Date para Calendar
        const fechaDate = egresado.fechaEgreso ? new Date(egresado.fechaEgreso) : null;

        this.formulario.patchValue({
          fechaEgreso: fechaDate,
          situacionActual: egresado.situacionActual,
          empresa: egresado.empresa,
          cargo: egresado.cargo,
          sueldo: egresado.sueldo,
          anioIngresoLaboral: egresado.anioIngresoLaboral,
          anioSeguimiento: egresado.anioSeguimiento || 2026,
          telefono: egresado.telefono,
          emailContacto: egresado.emailContacto,
        });

        this.messageService.add({
          severity: 'info',
          summary: 'Datos cargados',
          detail: '✅ Formulario rellenado automáticamente.',
        });
      },
      error: () => {
        // ✅ Si NO existe seguimiento, solo limpiar
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
          const formData = new FormData();
          formData.append('idEstudiante', estudiante.idEstudiante.toString());

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
            detail: '✅ Seguimiento guardado correctamente.',
          });
          this.resetFormulario();
          this.cargarEgresados();
          this.cargarEstudiantes();
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

  resetFormulario() {
    this.formulario.reset({ anioSeguimiento: 2026 });
    this.documentosSeleccionados = [];
    this.estudianteSeleccionado = null;
    this.intentoGuardar = false;
    this.modoEstudiante = 'existente';
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  volverMenu() {
    this.router.navigateByUrl('/menu');
  }

  abrirModalDocumentos(egresado: any) {
    this.documentosModal = egresado.documentos || [];
    this.modalDocsVisible = true;
  }

  verDocumento(doc: any) {
    const url = this.egresadosService.getDocumentoUrl(doc.url);
    window.open(url, '_blank');
  }

  descargarDocumento(doc: any) {
    const url = this.egresadosService.getDocumentoUrl(doc.url);

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo descargar');
        return response.blob();
      })
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = doc.nombre || 'documento.pdf';

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch((err) => {
        console.error('❌ Error al descargar:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: '❌ No se pudo descargar el documento.',
        });
      });
  }

  abrirEdicion(egresado: any) {
    this.egresadoEditando = egresado;

    this.editFormulario.patchValue({
      situacionActual: egresado.situacionActual,
      empresa: egresado.empresa,
      cargo: egresado.cargo,
      sueldo: egresado.sueldo,
      anioSeguimiento: egresado.anioSeguimiento,
      telefono: egresado.telefono,
      emailContacto: egresado.emailContacto,
    });

    this.editDialogVisible = true;
  }

  guardarEdicion() {
    if (this.editFormulario.invalid || !this.egresadoEditando) return;

    const dto: UpdateEgresadoDto = { ...this.editFormulario.value };
    const idEstudiante = Number(this.egresadoEditando.idEstudiante);

    this.egresadosService.updateByEstudiante(idEstudiante, dto).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Actualizado',
          detail: '✅ Seguimiento actualizado correctamente.',
        });
        this.editDialogVisible = false;
        this.cargarEgresados();
      },
      error: (err: any) => {
        console.error('ERROR PATCH:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || '❌ No se pudo actualizar.',
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
}
