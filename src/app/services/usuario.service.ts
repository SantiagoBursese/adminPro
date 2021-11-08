import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { RegisterForm } from '../interfaces/register-form.interface';
import { environment} from '../../environments/environment'
import { LoginForm } from '../interfaces/login-form.interface';

import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { Usuario } from 'src/models/usuario.model';
import { CargarUsuario } from '../interfaces/cargar-usuarios.interface';

const base_url = environment.base_url

declare const gapi:any;

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  public auth2: any
  public usuario: Usuario = new Usuario('','')

  constructor(private http: HttpClient, 
    private router: Router,
    private ngzone: NgZone) {

      this.googleInit()
     }

    get token():string{
      return localStorage.getItem('token') ||''
    }

    get uid():string{
      return this.usuario.uid || ''
    }

    get headers(){
      return {
        headers:{
          'x-token' : this.token
        }
      }
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


  validarToken() : Observable<boolean>{
    
    return this.http.get(`${base_url}/login/renew`,this.headers).pipe(
      map((resp:any) =>{
        const {email,google,img ='',nombre,role,uid} = resp.usuarioDB;
        this.usuario = new Usuario(nombre,email,'',img,google,role,uid)
        localStorage.setItem('token', resp.token)
        return true;
      }),
      catchError(error => 
        {console.log(error)
        return of(false)})
    )
  }
  crearUsuario (formData : RegisterForm){

    return this.http.post(`${base_url}/usuarios`, formData).pipe(
      tap((resp:any) =>{
        localStorage.setItem('token', resp.token)
      })
    )
  }

  actualizarPerfil(data: {email:string, nombre:string, role:string}){

    data ={
      ...data,
      role: this.usuario.role
    }
    return this.http.put(`${base_url}/usuarios/${this.uid}`, data, this.headers);
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

  cargarUsuarios(desde: number = 0){
    const url = `${base_url}/usuarios?desde=${desde}`
    return this.http.get<CargarUsuario>(url,this.headers).pipe(
      map(resp => {
        const usuarios = resp.usuarios.map( 
          user => new Usuario(user.nombre,user.email,'',user.img, user.google,user.role, user.uid))
          return {
            total: resp.total,
            usuarios
          }
      })
    )
  }

  eliminarUsuario(usuario:Usuario){
    const url = `${base_url}/usuarios/${usuario.uid}`
    return this.http.delete(url,this.headers)

  }

  guardarUsuario(usuario:Usuario){

    return this.http.put(`${base_url}/usuarios/${usuario.uid}`, usuario, this.headers);
  }
}
