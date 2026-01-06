import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { NuevoEND, ResultadosEnd } from '../../models/resultadosEND.dto';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CalendarModule } from 'primeng/calendar';
import { EndService } from '../../services/end.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-lista-end',
  standalone: true,
  imports: [CardModule, PaginatorModule, ReactiveFormsModule, ToastModule, DialogModule, InputTextModule, FileUploadModule, FloatLabelModule, CalendarModule, ProgressSpinnerModule],
  providers: [MessageService],
  templateUrl: './lista-end.component.html',
  styleUrl: './lista-end.component.css'
})
export class ListaEndComponent implements OnInit {

  constructor(
    private router: Router,
    private messageService: MessageService,
    private servicioEnd: EndService
  ){}

  ngOnInit() {
    this.obtenerListado()
  }

  listaResultados: ResultadosEnd[] = [] 
  public resultadosFiltrados: ResultadosEnd[] = []
  public resultadosPaginados: ResultadosEnd[] = []
  public first: number = 0
  public rows: number = 6
  public totalRecords: number= 0

  public visible: boolean = false;
  public inicioMinimoAgnio: Date = new Date(2021, 0, 1);
  public inicioMinimoCohorte: Date = new Date(2017, 0, 1);
  public inicioMaximoAgnio: Date = new Date();
  public inicioMaximoCohorte: Date = new Date(this.inicioMaximoAgnio.getFullYear() - 4, this.inicioMaximoAgnio.getMonth(), this.inicioMaximoAgnio.getDate());

  public cargando: boolean = true

  public formularioEND: FormGroup = new FormGroup({
    agnio: new FormControl('', [Validators.required]),
    cohorte: new FormControl('', [Validators.required]),
    documento: new FormControl(null, [Validators.required]),
  })

  public seleccionarArchivo(event: any) {
    const file = event.files[0];
      this.formularioEND.patchValue({
        documento: file 
      });
  }


  public borrarArchivo(event: any) {
    this.formularioEND.patchValue({
      documento: null
    });
  }

  public agregarEND() {
    if (this.formularioEND.valid) {
      // Crear el nuevo objeto END
      const nuevoEND: NuevoEND = {
        agnoRendicion: this.formularioEND.value.agnio.getFullYear(),
        cohorteAsociado: this.formularioEND.value.cohorte.getFullYear(),
      };
  
      // Verificar si ya existe un END con el mismo año o cohorte
      const existeEND = this.listaResultados.some(
        (resultado) =>
          resultado.agnoRendicion == +nuevoEND.agnoRendicion ||
          resultado.cohorteAsociado == +nuevoEND.cohorteAsociado
      );
  
      console.log(this.listaResultados)
      console.log(nuevoEND)

      if (existeEND) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'Ya existe un resultado END con el mismo año o cohorte.',
        });
        return; // Salir si ya existe
      }
  
      // Crear FormData para el nuevo END
      const formData = new FormData();
      formData.append('agnoRendicion', nuevoEND.agnoRendicion.toString());
      formData.append('cohorteAsociado', nuevoEND.cohorteAsociado.toString());
      formData.append('files', this.formularioEND.value.documento);
  
      // Llamar al servicio para guardar el nuevo END
      this.servicioEnd.nuevoEND(formData).subscribe(
        (respuesta) => {
          if (respuesta) {
            this.alternarModal();
            this.messageService.add({
              severity: 'success',
              summary: 'Guardado',
              detail: 'El convenio se guardó correctamente.',
            });
          }
          this.obtenerListado();
        },
        (error) => {
          const mensaje = error.error.message;
          this.messageService.add({
            severity: 'error',
            summary: 'Error al guardar',
            detail: mensaje,
          });
        }
      );
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Formulario incompleto. Por favor llene todos los campos requeridos.',
      });
    }
  }
  

  public onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0
    this.rows = event.rows ?? 10 
    this.actualizarResultadosPaginados()
  }

  public actualizarResultadosPaginados() {
    const inicio = this.first
    const final = this.first + this.rows
    this.resultadosPaginados = this.resultadosFiltrados.slice(inicio, final)
  }

  public obtenerListado() {
    this.servicioEnd.obtenerEND().subscribe(respuesta =>{
      this.listaResultados = respuesta
      this.resultadosFiltrados = respuesta
      this.totalRecords = this.resultadosFiltrados.length,
      this.actualizarResultadosPaginados() 
      this.cargando = false
    })
  }

  public filtrarResultados(evento: any) {
    const query = evento.target.value.toLowerCase();
    
    // Expresiones regulares para detectar términos específicos o solo números
    const resultadoRegex = /resultados\s*(\d{1,4})/; // "resultados" seguido de hasta 4 dígitos
    const cohorteRegex = /cohorte\s*(\d{1,4})/;      // "cohorte" seguido de hasta 4 dígitos
    const soloNumeroRegex = /^\d{1,4}$/;             // Solo un número de hasta 4 dígitos
    
    let filtroPeriodo = null;
    let filtroCohorte = null;
    let buscarEnAmbos = false;
  
    // Verificar si el query coincide con algún patrón específico
    const resultadoMatch = query.match(resultadoRegex);
    const cohorteMatch = query.match(cohorteRegex);
    const soloNumeroMatch = query.match(soloNumeroRegex);
    
    if (resultadoMatch) {
      filtroPeriodo = resultadoMatch[1];
    } else if (cohorteMatch) {
      filtroCohorte = cohorteMatch[1];
    } else if (soloNumeroMatch) {
      // Si solo se ingresa un número, buscar en ambos campos
      buscarEnAmbos = true;
      filtroPeriodo = soloNumeroMatch[0];
      filtroCohorte = soloNumeroMatch[0];
    }
  
    this.resultadosFiltrados = this.listaResultados.filter(resultado => {
      const periodoMatch = filtroPeriodo ? resultado.agnoRendicion.toString().startsWith(filtroPeriodo) : true;
      const cohorteMatch = filtroCohorte ? resultado.cohorteAsociado.toString().startsWith(filtroCohorte) : true;
      
      return buscarEnAmbos ? periodoMatch || cohorteMatch : periodoMatch && cohorteMatch;
    });
  
    this.totalRecords = this.resultadosFiltrados.length;
    this.first = 0;
    this.actualizarResultadosPaginados();
  }
  
  public redirigirHacia(idDato: number) {
    this.router.navigateByUrl(`end/${idDato}`);
  }

  public alternarModal() {
    this.visible = !this.visible;
    if(!this.visible){
      this.formularioEND.reset()
    }
  }

  public volverAlMenu(){
    this.router.navigate(['menu'])
  }

}
