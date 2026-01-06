import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { UsuariosService } from '../services/usuarios.service';

@Directive({
  selector: '[tieneRol]',
  standalone: true,
})
export class TieneRolDirective {
  @Input() set tieneRol(role: string[]) {
    // logica basica de rol
    // si tiene rol muestra el componente al que envuelve la directiva
    if (this.usuarioService.tieneRol(role)) {
      this.contenedorComponente.createEmbeddedView(this.referenciaAlDocumento);
      // si no, no muestra y limpia el documento
    } else {
      this.contenedorComponente.clear();
    }
  }

  constructor(
    private usuarioService: UsuariosService,
    private referenciaAlDocumento: TemplateRef<any>,
    private contenedorComponente: ViewContainerRef
  ) {}
}
