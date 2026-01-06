import { Component, OnInit } from '@angular/core';
import { EndService } from '../../services/end.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { FileUploadModule } from 'primeng/fileupload';
import { ResultadosEnd } from '../../models/resultadosEND.dto';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-resultado-end',
  standalone: true,
  imports: [DialogModule, ToastModule, CalendarModule, FileUploadModule, FloatLabelModule, InputTextModule, ReactiveFormsModule, ProgressSpinnerModule],
  providers: [MessageService],
  templateUrl: './resultado-end.component.html',
  styleUrl: './resultado-end.component.css'
})
export class ResultadoEndComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private servicioEND: EndService,
    private sanitizer: DomSanitizer,
    private messageService: MessageService,
    private router: Router,
  ){}

  ngOnInit() {
    this.idEND= +this.route.snapshot.paramMap.get('idEND')!
    this.obtenerDocumento()
  }

  public idEND!: number
  public end!: ResultadosEnd;

  public ruta!: SafeResourceUrl;
  public rutaBase: string = environment.apiUrl

  public visible: boolean = false;
  public cargando: boolean = true;


  public formularioEND: FormGroup = new FormGroup({
    agnio: new FormControl({value: '', disabled: true}, [Validators.required]),
    cohorte: new FormControl({value: '', disabled: true}, [Validators.required]),
    documento: new FormControl(null, [Validators.required]),
  })
  public documentoOriginal: string = ''
 
  public obtenerDocumento(){
    this.servicioEND.obtenerENDID(this.idEND).subscribe((result:ResultadosEnd) =>{
      this.end = result
      this.formularioEND.patchValue({
        agnio: result.agnoRendicion.toString(),
        cohorte: result.cohorteAsociado.toString(),
        documento: result.rutaDocumento
      })
      const fullRuta = this.rutaBase + result.rutaDocumento;
      console.log(fullRuta);
      this.ruta = this.sanitizer.bypassSecurityTrustResourceUrl(fullRuta);
      console.log(result)
      console.log(this.ruta)

      this.documentoOriginal = result.rutaDocumento
      this.cargando = false

    })
  }

  public editarDocumento(){
    if(this.formularioEND.valid){

      //CAMBIAR ANY
      const nuevoEND: any= {
        agnio: this.formularioEND.value.agnio,
        cohorte: this.formularioEND.value.cohorte,
      }
      
      const formData = new FormData();

      // Agregar los campos del formulario
      formData.append('idDato', this.end.idDato.toString())
      formData.append('agnoRendicion', this.formularioEND.get('agnio')?.value);
      formData.append('cohorteAsociado', this.formularioEND.get('cohorte')?.value);
      formData.append('fechaSubida', this.end.fechaSubida.toString())

      const pdf = this.formularioEND.get('documento')?.value
      if(pdf && pdf != this.documentoOriginal){
        formData.append('files', this.formularioEND.value.documento);
        formData.append('rutaDocumento', '')
      } else {
        formData.append('files', '');
        formData.append('rutaDocumento', this.documentoOriginal)
      }

      formData.forEach((value, key) => {
        console.log(`${key}:`, value);
      });
      this.servicioEND.editarEND(formData).subscribe(
        respuesta=>{
          if(respuesta){
            this.alternarModal()
            this.messageService.add({severity: 'success', summary: 'Guardado', detail: 'El documento se guardó correctamente'});
          }
          this.cargando = true
          this.obtenerDocumento() 
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

  public alternarModal() {
    this.visible = !this.visible;
    if(!this.visible){
      this.formularioEND.patchValue({
        rutaDocumento: this.documentoOriginal
      })
    }
  }

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

  public volverAlListado(){
    this.router.navigate(['end'])
  }

}
