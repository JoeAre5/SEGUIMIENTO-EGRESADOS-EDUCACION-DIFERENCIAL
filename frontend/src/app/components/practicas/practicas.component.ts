import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PracticasService } from '../../services/practicas.service';
import { InfoPracticaDTO } from '../../models/practica';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-practicas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './practicas.component.html',
  styleUrl: './practicas.component.css',
})
export class PracticasComponent {
  idEstudiante: number = 1;
  buscador: String = '';
  practicas: InfoPracticaDTO[] = [] as InfoPracticaDTO[];

  constructor(private readonly practicaService: PracticasService) {}

  ngOnInit() {
    this.practicas = this.practicaService.obtenerPracticas();
  }

  // Funcion que filtra las practicas escritas en el buscador
  filteredPracticas() {
    if (!this.buscador) {
      return this.practicas;
    }
    const term = this.buscador.toLowerCase();
    return this.practicas.filter((p) => p);
  }
}
