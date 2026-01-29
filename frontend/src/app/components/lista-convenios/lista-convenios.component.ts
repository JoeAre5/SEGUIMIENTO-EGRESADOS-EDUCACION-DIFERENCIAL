import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConveniosService } from '../../services/convenios.service';
import { ConvenioLista, Convenios, Modalidad} from '../../models/convenios.dto';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CalendarModule } from 'primeng/calendar';
import { FileUploadModule } from 'primeng/fileupload';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';

// ✅ FIX para <p-dropdown [options]="...">
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-lista-convenios',
  standalone: true,
  imports: [
    PaginatorModule,
    DialogModule,
    ButtonModule,
    FloatLabelModule,
    CalendarModule,
    FileUploadModule,
    ReactiveFormsModule,
    InputTextModule,
    ToastModule,
    CommonModule,
    ProgressSpinnerModule,

    // ✅ FIX
    DropdownModule
  ],
  providers: [MessageService],
  templateUrl: './lista-convenios.component.html',
  styleUrl: './lista-convenios.component.css'
})
export class ListaConveniosComponent implements OnInit {
  constructor(private router: Router, private servicioConvenios: ConveniosService, private messageService: MessageService) { }

  ngOnInit(): void {
    this.obtenerConvenios()
  }

  public ruta: string = environment.apiUrl
  public cargando: boolean = true
  public visible: boolean = false;
  public periodo: boolean = true;
  public modalidadNueva: boolean = false;
  public modalidades:Modalidad[] = [];

  public inicioMinimo: Date = new Date(2017, 0, 1);;
  public inicioMaximo: Date = new Date();;

  public formularioConvenio: FormGroup = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    centro: new FormControl('', [Validators.required]),
    idModalidad: new FormControl('', [Validators.required]),
    inicio: new FormControl('', [Validators.required]),
    imagen: new FormControl(null),
    terminos: new FormControl(null),
    nombreModalidad: new FormControl('')
  })

  public alternarModal() {
    this.visible = !this.visible;
    if(!this.visible){
      this.formularioConvenio.reset()
      this.periodo = true;
      this.modalidadNueva = false;
    }
  }

  public alternarPeriodo() {
    this.periodo = !this.periodo;
    if (!this.periodo) {
        const año = new Date().getFullYear();

        this.formularioConvenio.patchValue({
            inicio: año.toString()
        });
    } else {
        this.formularioConvenio.patchValue({
            inicio: ''
        });
    }
  }

  public alternarModalidad() {
    if (this.modalidadNueva){
      this.modalidadNueva = false;
      this.formularioConvenio.patchValue({
        nombreModalidad: null
      });
    }
    else{
      this.modalidadNueva = true;
      this.formularioConvenio.patchValue({
        idModalidad: 0,
        nombreModalidad: ''
      });
    }
  }

  public seleccionarArchivo(event: any, tipo: string) {
    const file = event.files[0];

    if (tipo === 'imagen') {
      this.formularioConvenio.patchValue({
        imagen: file
      });
    } else if (tipo === 'terminos') {
      this.formularioConvenio.patchValue({
        terminos: file
      });
    }
  }

  public borrarArchivo(event: any, tipo: string) {
    if (tipo === 'imagen') {
      this.formularioConvenio.patchValue({
        imagen: null
      });
    } else if (tipo === 'terminos') {
      this.formularioConvenio.patchValue({
        terminos: null
      });
    }
  }

  public first: number = 0;
  public rows: number = 5;
  public totalRecords: number= 0
  public onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
    this.actualizarConveniosPaginados()
  }

  public actualizarConveniosPaginados() {
    const inicio = this.first
    const final = this.first + this.rows
    console.log(this.conveniosFiltrados)
    this.conveniosPaginados = this.conveniosFiltrados.slice(inicio, final)
  }

  public convenios: ConvenioLista[] = []
  public conveniosFiltrados: ConvenioLista[]=[]
  public conveniosPaginados: ConvenioLista[]=[]

  public verDetalle(id: number){
    this.router.navigate(['/convenio/', id])
  }

  public eliminarConvenio(id: number){
    this.servicioConvenios.eliminarConvenio(id).subscribe(respuesta=>{
      if(respuesta){
        Swal.fire(
          '¡Eliminado!',
          'El convenio ha sido eliminado.',
          'success'
        )
        this.obtenerConvenios()
        }
      })
  }

  public confirmarEliminacion(id: number){
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esta acción!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((resultado) => {
      if (resultado.isConfirmed) {
        this.eliminarConvenio(id)
      }
    })
  }

  public agregarConvenio(){
    if(this.formularioConvenio.valid){
      const formData = new FormData();

      formData.append('titulo', this.formularioConvenio.get('nombre')?.value);
      formData.append('centroPractica', this.formularioConvenio.get('centro')?.value);
      formData.append('idModalidad', this.formularioConvenio.get('idModalidad')?.value);
      formData.append('FechaInicioConvenio', this.formularioConvenio.get('inicio')?.value);

      const imagen = this.formularioConvenio.get('imagen')?.value;
      if (imagen) {
        formData.append('files', imagen);
      }

      const terminos = this.formularioConvenio.get('terminos')?.value;
      if (terminos) {
        formData.append('files', terminos);
      }

      if (this.modalidadNueva && !this.formularioConvenio.value.nombreModalidad) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Debe ingresar un nombre de modalidad.'
        });
        return;

      } else {
        formData.append('nombreModalidad', this.formularioConvenio.get('nombreModalidad')?.value);
      }

      this.servicioConvenios.nuevoConvenio(formData).subscribe(
        respuesta=>{
          if(respuesta){
            this.alternarModal()
            this.messageService.add({severity: 'success', summary: 'Guardado', detail: 'El convenio se guardó correctamente'});
            this.obtenerConvenios()
          }
        },
        error => {
          const mensaje = error.error.message
          this.messageService.add({
            severity: 'error',
            summary: 'Error al guardar',
            detail: mensaje,
          });
        }
      )
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Formulario incompleto. Por favor llene todos los campos requeridos.'
      });
    }
  }

  public obtenerConvenios(){
    this.servicioConvenios.obtenerConvenios().subscribe((convenio: Convenios)=>{
      this.convenios=convenio.listadoConvenios
      this.conveniosFiltrados=this.convenios
      this.modalidades=convenio.modalidades
      this.totalRecords=this.conveniosFiltrados.length
      console.log(this.modalidades)
      this.actualizarConveniosPaginados()
      this.cargando = false
    })
  }

  public filtrarConvenios(evento: any) {
    const query = evento.target.value.toLowerCase();
    this.conveniosFiltrados = this.convenios.filter(convenio =>
      convenio.nombreConvenio.toLowerCase().includes(query) || convenio.centroPractica.toLowerCase().includes(query)
    )
    this.totalRecords=this.conveniosFiltrados.length
    this.first=0
    this.actualizarConveniosPaginados()
  }

  public obtenerImagen(url: string ): string {
    if (url?.includes('default_convenio')) {
      return 'assets/imageDefault.jpg';
    }
    return this.ruta + url;
  }

  public volverAlMenu(){
    this.router.navigate(['menu'])
  }
}
