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
    private servicioLogin: LoginService,
  ) {}

  public formularioLogin: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  public login() {
    if (this.formularioLogin.valid) {
      this.servicioLogin
        .iniciarSesion(this.formularioLogin.value)
        .subscribe((result: any) => {

          const token = result?.access_token || result?.token;

          if (token) {
            // guarda en localStorage
            localStorage.setItem('access_token', token);
          }
          const ok = (result && result.success) || !!token;

          if (ok) {
            this.messageService.add({
              severity: 'success',
              summary: 'Inicio sesión',
              detail: 'Inicio sesión correctamente',
            });

            this.router.navigateByUrl('fluxograma');
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: result?.message || 'Credenciales inválidas',
            });
          }
        });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Ingrese correctamente los datos',
      });
    }
  }
}
