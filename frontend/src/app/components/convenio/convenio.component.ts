import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConveniosService } from '../../services/convenios.service';
import { ActualizarConvenio, Convenio, ConvenioLista, DetalleConvenio, Modalidad } from '../../models/convenios.dto';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-convenio',
  standalone: true,
  imports: [CommonModule,ProgressSpinnerModule, DialogModule, FileUploadModule, ReactiveFormsModule, FloatLabelModule, CalendarModule, ToastModule, DropdownModule, InputTextModule],
  providers: [MessageService],
  templateUrl: './convenio.component.html',
  styleUrl: './convenio.component.css'
})
export class ConvenioComponent implements OnInit{
  
  constructor(
    private route: ActivatedRoute,
    private servicioConvenios: ConveniosService,
    private messageService: MessageService,
    private router: Router
  ){}

  ngOnInit() {
    this.idConvenio= +this.route.snapshot.paramMap.get('idConvenio')!
    this.obtenerDetalleConvenio()
    this.obtenerModalidades()
  }

  public ruta: string = environment.apiUrl
  public documento: string = ''
  public foto: string = ''

  public formularioConvenio: FormGroup = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    centro: new FormControl({value: '', disabled: true}, [Validators.required]),
    idModalidad: new FormControl('', [Validators.required]),
    inicio: new FormControl({value: '', disabled: true}, [Validators.required]),
    imagen: new FormControl(null),
    terminos: new FormControl(null),
    nombreModalidad: new FormControl('')
  })

  //CMBIAR ANY A ALGUN DTO PARA CONVENIO
  public formularioConvenioOriginal!: any
  
  public inicioMinimo: Date = new Date(2017, 0, 1);;
  public inicioMaximo: Date = new Date();;
  public modalidades: Modalidad[] = []
  public modalidadOriginal!: number

  public visible: boolean = false;
  public modalidadNueva: boolean = false;

  public idConvenio!: number
  public detalleConvenioTest!: DetalleConvenio
  public cargando: boolean = true;
 
  public camposDeshabilitados = true;


  public obtenerDetalleConvenio(){
    this.servicioConvenios.obtenerDetalleConvenios(this.idConvenio).subscribe(convenio =>{
      this.foto = this.ruta + convenio.convenio.urlFoto
      this.formularioConvenio.patchValue({
        nombre: convenio.convenio.titulo,
        centro: convenio.convenio.centroPractica,
        idModalidad: convenio.convenio.idModalidad,
        inicio: new Date(convenio.convenio.fechaInicioConvenio).getFullYear().toString(),
        imagen: convenio.convenio.urlFoto,
        terminos: convenio.convenio.documentoConvenio
      })

      this.documento = this.ruta + convenio.convenio.documentoConvenio

      this.formularioConvenioOriginal = {...this.formularioConvenio.value}
      this.detalleConvenioTest = convenio
      this.modalidadOriginal = convenio.convenio.idModalidad
      this.detalleConvenioTest.promedioPracticas = parseFloat(this.detalleConvenioTest.promedioPracticas.toFixed(2))
      this.cargando = false
      console.log(convenio)
    })
  }

  public obtenerModalidades(){
    this.servicioConvenios.obtenerConvenios().subscribe(resultado => {
      this.modalidades = resultado.modalidades
    })
  }

  public descargarArchivo() {
     // Abrir el archivo en una nueva pestaña
  const nuevaVentana = window.open(this.documento, '_blank');
  if (!nuevaVentana) {
    console.error('El navegador bloqueó la apertura de la nueva pestaña.');
  }

  // Descargar el archivo
  fetch(this.documento)
    .then(response => {
      if (!response.ok) {
        throw new Error('No se pudo descargar el archivo.');
      }
      return response.blob(); // Convierte la respuesta en un blob
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob); // Crea una URL temporal para el blob
      const link = document.createElement('a');
      link.href = url;
      link.download = `DocumentoConvenio${this.formularioConvenio.get('nombre')?.value.replace(/\s+/g, "")}.pdf`; // Nombre del archivo descargado
      link.click(); // Simula el clic para descargar
      window.URL.revokeObjectURL(url); // Libera la URL temporal
    })
    .catch(error => {
      console.error('Error al descargar el archivo:', error);
    });
  }


  public alternarModal() {
    this.visible = !this.visible;
    if(!this.visible){
      this.formularioConvenio.patchValue(this.formularioConvenioOriginal);
      this.modalidadNueva = false;
    }
  }

  public alternarModalidad() {
    if (this.modalidadNueva){
      this.modalidadNueva = false;
      this.formularioConvenio.patchValue({
        idModalidad: this.modalidadOriginal,
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
    console.log(this.formularioConvenio.value)
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

  public editarConvenio(){
    if(this.formularioConvenio.valid){
      if(JSON.stringify(this.formularioConvenio.value) !== JSON.stringify(this.formularioConvenioOriginal)){
        const inicioFormulario= this.formularioConvenio.value.inicio
        let fechaInicioConvenio: Date
        if(typeof inicioFormulario === 'string'){
          fechaInicioConvenio = new Date()
        }else if(inicioFormulario instanceof Date){
          const nuevoAño = inicioFormulario.getFullYear()
          const fechaActual = new Date()
          fechaInicioConvenio = new Date(nuevoAño, fechaActual.getMonth(), fechaActual.getDate())
        }else{
          fechaInicioConvenio = new Date()
        }
                
        const formData = new FormData();

        // Agregar los campos del formulario
        formData.append('titulo', this.formularioConvenio.get('nombre')?.value);
        formData.append('centroPractica', this.formularioConvenio.get('centro')?.value);
        formData.append('idModalidad', this.formularioConvenio.get('idModalidad')?.value);
        formData.append('FechaInicioConvenio', this.formularioConvenio.get('inicio')?.value);

        // Agregar los archivos
        const imagen = this.formularioConvenio.get('imagen')?.value;
        if (imagen && imagen != this.formularioConvenioOriginal.imagen) {
          formData.append('files', imagen); 
          formData.append('urlFoto', '')
        } else{
          formData.append('files', ''); 
          formData.append('urlFoto', this.formularioConvenioOriginal.imagen)
        }

        const terminos = this.formularioConvenio.get('terminos')?.value;
        if (terminos && terminos != this.formularioConvenioOriginal.terminos) {
          formData.append('files', terminos); 
          formData.append('documentoConvenio', '')
        } else (
          formData.append('documentoConvenio', this.formularioConvenioOriginal.terminos)
        )

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

        // formData.forEach((value, key) => {
        //   console.log(`${key}:`, value);
        // });
        this.servicioConvenios.actualizarConvenio(this.idConvenio ,formData).subscribe(
          respuesta=>{
            if(respuesta){
              this.alternarModal()
              this.messageService.add({severity: 'success', summary: 'Guardado', detail: 'El convenio se editó correctamente'});
            }
            this.cargando = true
            this.obtenerDetalleConvenio()
            this.obtenerModalidades()
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
          detail: 'No se han realizado cambios en el convenio.'
        });
      }
    } else {
      this.messageService.add({
        severity: 'error', 
        summary: 'Error', 
        detail: 'Formulario incompleto. Por favor llene todos los campos requeridos.'
      });
    }
  }

  public volverAlListado(){
    this.router.navigate(['convenios'])
  }

  public verPracticas(){
    this.router.navigate(['/practicas-convenio', this.idConvenio])
  }

  public obtenerImagen(url: string ): string {
    if (url?.includes('default_convenio')) {
      return 'assets/imageDefault.jpg';
    }
    return this.ruta + url;
  }
}