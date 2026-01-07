import { Routes } from '@angular/router';
import { FluxogramasComponent } from './components/fluxogramas/fluxogramas.component';
import { SeguimientoEgresadosComponent } from './components/seguimiento-egresados/seguimiento-egresados.component';
import { AprobacionCursoComponent } from './components/aprobacion-curso/aprobacion-curso.component';
import { DetalleFluxogramaComponent } from './components/detalle-fluxograma/detalle-fluxograma.component';
import { EstadisticaDiagnosticoComponent } from './components/estadistica-diagnostico/estadistica-diagnostico.component';
import { PracticasComponent } from './components/practicas/practicas.component';
import { ResultadoEndComponent } from './components/resultado-end/resultado-end.component';
import { ListaConveniosComponent } from './components/lista-convenios/lista-convenios.component';
import { ConvenioComponent } from './components/convenio/convenio.component';
import { LoginComponent } from './components/login/login.component';
import { MenuComponent } from './components/menu/menu.component';
import { authGuard, hasRoleGuard, loginGuard } from './guards/auth.guard';
import { AvanceEstudianteComponent } from './components/avance-estudiante/avance-estudiante.component';
import { PracticasEstudianteComponent } from './components/practicas-estudiante/practicas-estudiante.component';
import { AsignaturasComponent } from './components/asignaturas/asignaturas.component';
import { DetalleAsignaturaComponent } from './components/detalle-asignatura/detalle-asignatura.component';
import { ListarEstudianteComponent } from './components/listar-estudiante/listar-estudiante.component';
import { MenuEstudianteComponent } from './components/menu-estudiante/menu-estudiante.component';
import { Roles } from './models/login.dto';
import { ListaEndComponent } from './components/lista-end/lista-end.component';
import { GestionarLineasComponent } from './components/gestionar-lineas/gestionar-lineas.component';
import { TendenciasAsignaturaCortePracticoComponent } from './components/tendencias-asignatura-corte-practico/tendencias-asignatura-corte-practico.component';
import { DetallePracticaComponent } from './components/detalle-practica/detalle-practica.component';
import { PracticasConvenioComponent } from './components/practicas-convenio/practicas-convenio.component';

/**
 * RUTAS                    ROLES
 * [/fluxogramas]       -> [todos]
 * [/convenios]         -> [admin, jc, secretario, coordinador]
 * [/asignaturas]       -> [admin,jc,secretario, docente, coordinador]
 * [/end]               -> [admin, jc]
 * [/avance-individual] -> [admin,jc]
 * [/ver-tendencias]    -> [administrador, jc, docente, coordinador]
 * [/seguimiento-egresados] -> [admin, jc, coordinador]
 */

export const routes: Routes = [
  { path: '', redirectTo: '/fluxogramas', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'menu', component: MenuComponent, canActivate: [authGuard] },

  // ✅ NUEVA RUTA SEGUIMIENTO EGRESADOS
  {
    path: 'seguimiento-egresados',
    component: SeguimientoEgresadosComponent,
    canActivate: [authGuard, hasRoleGuard],
    data: {
      roles: [
        Roles.ADMINISTRADOR,
        Roles.JEFA_CARRERA,
        Roles.COORDINADOR,
      ],
    },
  },

  {
    path: 'fluxogramas',
    component: FluxogramasComponent,
    canActivate: [authGuard, hasRoleGuard],
    data: {
      roles: [
        Roles.ADMINISTRADOR,
        Roles.JEFA_CARRERA,
        Roles.SECRETARIO,
        Roles.DOCENTE,
        Roles.COORDINADOR,
      ],
    },
  },

  {
    path: 'convenios',
    component: ListaConveniosComponent,
    canActivate: [authGuard, hasRoleGuard],
    data: {
      roles: [
        Roles.ADMINISTRADOR,
        Roles.JEFA_CARRERA,
        Roles.SECRETARIO,
        Roles.COORDINADOR,
      ],
    },
  },

  {
    path: 'convenio/:idConvenio',
    component: ConvenioComponent,
    canActivate: [authGuard],
  },

  {
    path: 'end',
    component: ListaEndComponent,
    canActivate: [authGuard, hasRoleGuard],
    data: {
      roles: [Roles.ADMINISTRADOR, Roles.JEFA_CARRERA],
    },
  },

  {
    path: 'aprobacion/:idFluxograma/:codigoAsignatura',
    component: AprobacionCursoComponent,
    canActivate: [authGuard],
  },

  {
    path: 'fluxograma/:idFluxograma',
    component: DetalleFluxogramaComponent,
    canActivate: [authGuard],
  },

  {
    path: 'estadisticas/:idFluxograma/:codigoAsignatura',
    component: EstadisticaDiagnosticoComponent,
    canActivate: [authGuard],
  },

  {
    path: 'practicas',
    component: PracticasComponent,
    canActivate: [authGuard, hasRoleGuard],
    data: {
      roles: [
        Roles.ADMINISTRADOR,
        Roles.JEFA_CARRERA,
        Roles.SECRETARIO,
        Roles.DOCENTE,
        Roles.COORDINADOR,
      ],
    },
  },

  {
    path: 'asignaturas',
    component: AsignaturasComponent,
    canActivate: [authGuard, hasRoleGuard],
    data: {
      roles: [
        Roles.ADMINISTRADOR,
        Roles.JEFA_CARRERA,
        Roles.SECRETARIO,
        Roles.DOCENTE,
        Roles.COORDINADOR,
      ],
    },
  },

  {
    path: 'detalle-asignatura/:codigoAsignatura',
    component: DetalleAsignaturaComponent,
    canActivate: [authGuard],
  },

  {
    path: 'avance-estudiante/:idEstudiante',
    component: AvanceEstudianteComponent,
  },

  {
    path: 'practicas-estudiante/:idEstudiante',
    component: PracticasEstudianteComponent,
  },

  {
    path: 'listar-estudiantes',
    component: ListarEstudianteComponent,
    canActivate: [authGuard, hasRoleGuard],
    data: {
      roles: [Roles.ADMINISTRADOR, Roles.JEFA_CARRERA],
    },
  },

  {
    path: 'menu-estudiante/:idEstudiante/:nombreEstudiante',
    component: MenuEstudianteComponent,
  },

  {
    path: 'ver-tendencias',
    component: TendenciasAsignaturaCortePracticoComponent,
    canActivate: [authGuard],
    data: {
      roles: [
        Roles.ADMINISTRADOR,
        Roles.JEFA_CARRERA,
        Roles.DOCENTE,
        Roles.COORDINADOR,
      ],
    },
  },

  {
    path: 'practica-detalle/:titulo',
    component: DetallePracticaComponent,
    canActivate: [authGuard],
  },

  {
    path: 'practicas-convenio/:idConvenio',
    component: PracticasConvenioComponent,
    canActivate: [authGuard],
  },

  {
    path: 'gestionar-lineas/:idPlan',
    component: GestionarLineasComponent,
    canActivate: [authGuard],
  },

  {
    path: 'end/:idEND',
    component: ResultadoEndComponent,
    canActivate: [authGuard],
  },

  { path: '**', redirectTo: '/menu' },
];
