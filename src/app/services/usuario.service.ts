import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { RegisterForm } from '../interfaces/register-form.interface';
import { environment} from '../../environments/environment'
import { LoginForm } from '../interfaces/login-form.interface';

import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';

const base_url = environment.base_url

declare const gapi:any;

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  public auth2: any

  constructor(private http: HttpClient, 
    private router: Router,
    private ngzone: NgZone) {

      this.googleInit()
     }

    googleInit(){
      return new Promise<void>(resolve =>{
        gapi.load('auth2', () =>{
          // Retrieve the singleton for the GoogleAuth library and set up the client.
          this.auth2 = gapi.auth2.init({
            client_id: '418145115043-ir83bp7fqjer673ok8r81q6s56e2aeee.apps.googleusercontent.com',
            cookiepolicy: 'single_host_origin',
            // Request scopes in addition to 'profile' and 'email'
            //scope: 'additional_scope'
          });
          resolve();
        })
      })
    }

  logout(){
    localStorage.removeItem('token')
    
    this.auth2.signOut().then( () => {
      this.ngzone.run(() =>
      this.router.navigateByUrl('/login')
    )});
  }


  validarToken(){
    const token = localStorage.getItem('token') ||''
    return this.http.get(`${base_url}/login/renew`,{
      headers:{
        'x-token' :token
      }
    }).pipe(
      tap((resp:any) =>{
        localStorage.setItem('token', resp.token)
      }),
      map(resp => true),
      catchError(error => of(false))
    )
  }
  crearUsuario (formData : RegisterForm){

    return this.http.post(`${base_url}/usuarios`, formData).pipe(
      tap((resp:any) =>{
        localStorage.setItem('token', resp.token)
      })
    )
  }

  login (formData : LoginForm){

    return this.http.post(`${base_url}/login`, formData).pipe(
      tap((resp:any) =>{
        localStorage.setItem('token', resp.token)
      })
    )
  }

  loginGoogle (token :any){

    return this.http.post(`${base_url}/login/google`, {token}).pipe(
      tap((resp:any) =>{
        localStorage.setItem('token', resp.token)
      })
    )
  }
}
