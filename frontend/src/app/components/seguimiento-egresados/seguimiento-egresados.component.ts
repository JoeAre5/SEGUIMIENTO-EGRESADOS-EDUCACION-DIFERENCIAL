import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-seguimiento-egresados',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    InputNumberModule,
    ButtonModule
  ],
  templateUrl: './seguimiento-egresados.component.html',
  styleUrl: './seguimiento-egresados.component.css',
})
export class SeguimientoEgresadosComponent {

  formulario!: FormGroup;

  situaciones = [
    { label: 'Trabajando', value: 'Trabajando' },
    { label: 'Cesante', value: 'Cesante' },
    { label: 'Estudiando', value: 'Estudiando' },
    { label: 'Otro', value: 'Otro' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.crearFormulario();
  }

  crearFormulario() {
    this.formulario = this.fb.group({
      idEstudiante: [null, [Validators.required]],
      fechaEgreso: [null, [Validators.required]],
      situacionActual: [null, [Validators.required]],

      empresa: [''],
      cargo: [''],
      sueldo: [null],
      anioIngresoLaboral: [null],
      anioSeguimiento: [2026, [Validators.required]],

      telefono: [''],
      emailContacto: ['', [Validators.email]],
      direccion: [''],
      linkedin: [''],
      contactoAlternativo: [''],
    });
  }

  guardar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    console.log('✅ Datos enviados:', this.formulario.value);

    alert('✅ Datos guardados (por ahora solo en consola).');

    this.formulario.reset({
      anioSeguimiento: 2026
    });
  }

  volverMenu() {
    this.router.navigateByUrl('/menu');
  }
}
