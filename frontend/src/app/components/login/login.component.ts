import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { LoginService } from '../../services/login.service';
import { Roles } from '../../models/login.dto';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FloatLabelModule, InputTextModule, ReactiveFormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  constructor(
    private router: Router,
    private messageService: MessageService,
    private servicioLogin: LoginService
  ) {}

  public formularioLogin: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  // ✅ helper: JWT base64url -> JSON
  private decodeJwtPayload(token: string): any | null {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;

      // base64url -> base64
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  public login() {
    if (!this.formularioLogin.valid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Ingrese correctamente los datos',
      });
      return;
    }

    this.servicioLogin.iniciarSesion(this.formularioLogin.value).subscribe(
      (result) => {
        if (!result?.success) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: result?.message || 'Credenciales inválidas',
          });
          return;
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Inicio sesión',
          detail: 'Inicio sesión correctamente',
        });

        const token = sessionStorage.getItem('token');
        if (!token) {
          // si por alguna razón no se guardó el token, mandamos al login
          this.router.navigateByUrl('/login');
          return;
        }

        const payload = this.decodeJwtPayload(token);
        const role = payload?.role;

        // ✅ redirección por rol
        if (role === Roles.ESTUDIANTE || role === 'ESTUDIANTE') {
          this.router.navigateByUrl('/seguimiento-egresados');
        } else {
          this.router.navigateByUrl('/menu');
        }
      }
    );
  }
}
