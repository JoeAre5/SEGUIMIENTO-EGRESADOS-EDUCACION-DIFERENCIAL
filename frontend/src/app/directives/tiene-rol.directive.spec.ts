import { inject, TemplateRef, ViewContainerRef } from '@angular/core';
import { TieneRolDirective } from './tiene-rol.directive';
import { UsuariosService } from '../services/usuarios.service';

describe('TieneRolDirective', () => {
  it('should create an instance', () => {
    const usuarioService = inject(UsuariosService);
    const templateRef = inject(TemplateRef);
    const viewContainer = inject(ViewContainerRef);

    const directive = new TieneRolDirective(
      usuarioService,
      templateRef,
      viewContainer
    );
    expect(directive).toBeTruthy();
  });
});
