import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';

import { ConfirmationService, MessageService } from 'primeng/api';

import {
  UsuariosAdminService,
  UsuarioAdmin,
  EgresadoSinCuenta,
  RoleDto,
} from '../../services/usuarios-admin.service';

type TagSeverity =
  | 'success'
  | 'secondary'
  | 'info'
  | 'warning'
  | 'danger'
  | 'contrast'
  | undefined;

@Component({
  selector: 'app-usuarios-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    PasswordModule,
    DropdownModule,
    InputSwitchModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './usuarios-admin.component.html',
})
export class UsuariosAdminComponent implements OnInit {
  loading = false;

  // ✅ loading específico para el modal crear desde egresado
  loadingCrearEgresado = false;

  usuarios: UsuarioAdmin[] = [];
  egresadosSinCuenta: EgresadoSinCuenta[] = [];

  egresadoOptions: Array<{
    label: string;
    value: number; // idEgresado
    rut: string;
    idEstudiante: number;
  }> = [];

  roles = [
    { label: 'Administrador', value: 'Administrador' as RoleDto },
    { label: 'JC', value: 'JC' as RoleDto },
    { label: 'Coordinador Practica', value: 'CoordinadorPractica' as RoleDto },
    { label: 'Secretario', value: 'Secretario' as RoleDto },
    { label: 'Docente', value: 'Docente' as RoleDto },
    { label: 'EGRESADO', value: 'EGRESADO' as RoleDto },
  ];

  estadoOptions = [
    { label: 'Todos', value: null as boolean | null },
    { label: 'Activos', value: true as boolean },
    { label: 'Inactivos', value: false as boolean },
  ];

  filtroRole: RoleDto | null = null;
  filtroActivo: boolean | null = null;

  showCrearManual = false;
  showCrearEgresado = false;
  showEditar = false;
  showPassword = false;

  selected: UsuarioAdmin | null = null;

  formCrearManual!: FormGroup;
  formCrearEgresado!: FormGroup;
  formEditar!: FormGroup;
  formPassword!: FormGroup;

  selectedEgresado: EgresadoSinCuenta | null = null;

  constructor(
    private fb: FormBuilder,
    private api: UsuariosAdminService,
    private msg: MessageService,
    private confirm: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.formCrearManual = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.email]],
      nombreCompleto: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['Administrador' as RoleDto, [Validators.required]],
      idEstudiante: [null],
    });

    this.formCrearEgresado = this.fb.group({
      idEgresado: [null, [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.email]], // ✅ email NO obligatorio
      nombreCompleto: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['EGRESADO' as RoleDto],
    });

    this.formEditar = this.fb.group({
      username: ['', [Validators.required]],
      role: [null as RoleDto | null, [Validators.required]],
      isActive: [true, [Validators.required]],
    });

    this.formPassword = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.reloadAll();
  }

  reloadAll() {
    this.loading = true;

    this.api.findAll().subscribe({
      next: (data: UsuarioAdmin[]) => {
        this.usuarios = data ?? [];
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.toastError(err, 'No se pudo cargar la lista de usuarios');
      },
    });

    this.api.egresadosSinCuenta().subscribe({
      next: (data: EgresadoSinCuenta[]) => {
        this.egresadosSinCuenta = data ?? [];
        this.egresadoOptions = (data ?? []).map((e) => ({
          value: e.idEgresado,
          label: e.Estudiante?.nombreCompleto ?? `Egresado ${e.idEgresado}`,
          rut: e.Estudiante?.rut ?? '',
          idEstudiante: e.idEstudiante,
        }));
      },
      error: (_err: any) => {
        this.egresadosSinCuenta = [];
        this.egresadoOptions = [];
      },
    });
  }

  onGlobalFilter(dt: Table, event: Event) {
    const input = event.target as HTMLInputElement;
    dt.filterGlobal(input.value, 'contains');
  }

  openCrearManual() {
    this.formCrearManual.reset({
      username: '',
      email: '',
      nombreCompleto: '',
      password: '',
      role: 'Administrador' as RoleDto,
      idEstudiante: null,
    });
    this.showCrearManual = true;
  }

  openCrearEgresado() {
    this.selectedEgresado = null;
    this.formCrearEgresado.reset({
      idEgresado: null,
      username: '',
      email: '',
      nombreCompleto: '',
      password: '',
      role: 'EGRESADO' as RoleDto,
    });
    this.showCrearEgresado = true;
  }

  onSelectEgresado(idEgresado: number) {
    const eg =
      this.egresadosSinCuenta.find((x) => x.idEgresado === idEgresado) ?? null;

    this.selectedEgresado = eg;

    if (!eg) return;

    const anyEg: any = eg;

    const emailCandidato =
      anyEg?.emailContacto ||
      anyEg?.email ||
      anyEg?.correo ||
      anyEg?.correoElectronico ||
      anyEg?.correoInstitucional ||
      anyEg?.Estudiante?.email ||
      anyEg?.Estudiante?.correo ||
      anyEg?.Estudiante?.correoElectronico ||
      anyEg?.Estudiante?.correoInstitucional ||
      '';

    this.formCrearEgresado.patchValue({
      nombreCompleto: eg.Estudiante?.nombreCompleto ?? '',
      email: emailCandidato ?? '',
    });

    this.formCrearEgresado.get('email')?.markAsPristine();
    this.formCrearEgresado.get('email')?.markAsUntouched();
  }

  openEditar(u: UsuarioAdmin) {
    this.selected = u;
    this.formEditar.reset({
      username: u.username,
      role: u.role,
      isActive: u.isActive,
    });
    this.showEditar = true;
  }

  openPassword(u: UsuarioAdmin) {
    this.selected = u;
    this.formPassword.reset();
    this.formPassword.get('password')?.setValue('');
    this.formPassword.markAsPristine();
    this.formPassword.markAsUntouched();
    this.showPassword = true;
  }

  closePasswordDialog() {
    this.showPassword = false;
    this.selected = null;
    this.formPassword.reset();
    this.formPassword.get('password')?.setValue('');
    this.formPassword.markAsPristine();
    this.formPassword.markAsUntouched();
  }

  crearManual() {
    if (this.formCrearManual.invalid) return;

    const dto: any = { ...this.formCrearManual.value };
    if (!dto.idEstudiante) delete dto.idEstudiante;

    this.api.create(dto).subscribe({
      next: () => {
        this.showCrearManual = false;
        this.msg.add({
          severity: 'success',
          summary: 'OK',
          detail: 'Usuario creado',
        });
        this.reloadAll();
      },
      error: (err: any) => this.toastError(err, 'No se pudo crear el usuario'),
    });
  }

  crearDesdeEgresado() {
    if (this.formCrearEgresado.invalid) return;

    const idEgresado = Number(this.formCrearEgresado.value.idEgresado);

    const rawEmail = (this.formCrearEgresado.value.email ?? '').toString().trim();

    const dto: any = {
      username: this.formCrearEgresado.value.username,
      password: this.formCrearEgresado.value.password,
      nombreCompleto: this.formCrearEgresado.value.nombreCompleto,
      role: this.formCrearEgresado.value.role,
    };

    // ✅ SOLO incluir email si realmente hay uno (evita enviar email: "")
    if (rawEmail.length > 0) dto.email = rawEmail;

    this.api.createFromEgresado(idEgresado, dto).subscribe({
      next: () => {
        this.showCrearEgresado = false;
        this.msg.add({ severity: 'success', summary: 'OK', detail: 'Usuario EGRESADO creado' });
        this.reloadAll();
      },
      error: (err: any) => this.toastError(err, 'No se pudo crear desde egresado'),
    });
  }

  guardarEdicion() {
    if (!this.selected || this.formEditar.invalid) return;

    const { username, role, isActive } = this.formEditar.value as {
      username: string;
      role: RoleDto;
      isActive: boolean;
    };

    const userId = this.selected.id;

    this.api.updateUsername(userId, username).subscribe({
      next: () => {
        this.api.updateRole(userId, role).subscribe({
          next: () => {
            this.api.setActive(userId, isActive).subscribe({
              next: () => {
                this.showEditar = false;
                this.msg.add({
                  severity: 'success',
                  summary: 'OK',
                  detail: 'Usuario actualizado',
                });
                this.reloadAll();
              },
              error: (err: any) =>
                this.toastError(err, 'No se pudo actualizar estado'),
            });
          },
          error: (err: any) => this.toastError(err, 'No se pudo actualizar rol'),
        });
      },
      error: (err: any) => this.toastError(err, 'No se pudo actualizar username'),
    });
  }

  cambiarPassword() {
    if (!this.selected || this.formPassword.invalid) return;

    const userId = this.selected.id;
    const password = this.formPassword.value.password;

    this.api.updatePassword(userId, password).subscribe({
      next: () => {
        this.closePasswordDialog();
        this.msg.add({
          severity: 'success',
          summary: 'OK',
          detail: 'Password actualizado',
        });
      },
      error: (err: any) => this.toastError(err, 'No se pudo actualizar password'),
    });
  }

  confirmarToggleActivo(u: UsuarioAdmin, nuevoValor: boolean) {
    const anterior = u.isActive;
    u.isActive = nuevoValor;

    this.confirm.confirm({
      message: `¿Seguro que deseas ${
        nuevoValor ? 'activar' : 'desactivar'
      } a "${u.username}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.api.setActive(u.id, nuevoValor).subscribe({
          next: () => {
            this.msg.add({
              severity: 'success',
              summary: 'OK',
              detail: `Usuario ${nuevoValor ? 'activado' : 'desactivado'}`,
            });
            this.reloadAll();
          },
          error: (err: any) => {
            u.isActive = anterior;
            this.toastError(err, 'No se pudo cambiar el estado');
          },
        });
      },
      reject: () => {
        u.isActive = anterior;
      },
    });
  }

  tagSeverityByRole(role: RoleDto): TagSeverity {
    switch (role) {
      case 'Administrador':
        return 'danger';
      case 'JC':
        return 'warning';
      case 'CoordinadorPractica':
        return 'info';
      case 'Secretario':
        return 'success';
      case 'Docente':
        return 'contrast';
      case 'EGRESADO':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  private toastError(err: any, fallback: string) {
    const detail =
      err?.error?.message ||
      err?.message ||
      (typeof err?.error === 'string' ? err.error : null) ||
      fallback;

    this.msg.add({ severity: 'error', summary: 'Error', detail });
  }
}
