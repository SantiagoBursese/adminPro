import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Hospital } from 'src/models/hospital.model';
import { Medico } from 'src/models/medico.model';
import { Usuario } from 'src/models/usuario.model';
import { environment} from '../../environments/environment'

const base_url = environment.base_url

@Injectable({
  providedIn: 'root'
})

export class BusquedasService {

  constructor(private http: HttpClient) { }

  get token():string{
    return localStorage.getItem('token') ||''
  }

  get headers(){
    return {
      headers:{
        'x-token' : this.token
      }
    }
  }

  private transformarUsuarios(resultados:any[]):Usuario[]{
    
    return resultados.map(
      user=> new Usuario(user.nombre,user.email,'',user.img, user.google,user.role, user.uid)
    )
  }

  private transformarHospitales(resultados:any[]):Hospital[]{
    
    return resultados.map(
      hospital=> new Hospital(hospital.nombre,hospital._id,hospital.img,hospital.user)
    )
  }

  transformarMedicos(resultados: any): Medico[] {
    return resultados.map(
      medico => new Medico(medico.nombre, medico._id, medico.img, medico.usuario, medico.hospital)
    );
  }


  buscar(tipo: 'usuarios'|'medicos'|'hospitales',
  termino: string){
    var resultados = []
    const url = `${base_url}/todo/coleccion/${tipo}/${termino}`
    return this.http.get<any[]>(url,this.headers).pipe(
      map((resp:any ) => {
        switch (tipo) {
          case 'usuarios':
            resultados = this.transformarUsuarios(resp.resultados)
            break
          case 'hospitales':
            resultados = this.transformarHospitales(resp.resultados)
            break
          case 'medicos':
            resultados = this.transformarMedicos(resp.resultados)
        }
        return resultados
      })
    )
  }

}
