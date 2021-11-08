import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { BusquedasService } from 'src/app/services/busquedas.service';
import { HospitalesService } from 'src/app/services/hospitales.service';
import { ModalImagenService } from 'src/app/services/modal-imagen.service';
import { Hospital } from 'src/models/hospital.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-hospitales',
  templateUrl: './hospitales.component.html',
  styles: [
  ]
})
export class HospitalesComponent implements OnInit, OnDestroy{

  public hospitales: Hospital [] = []
  public hospitalesTemp:Hospital[] = []
  public cargando : boolean = true

  public imgSubs : Subscription

  constructor(private hospitalService: HospitalesService,
            private modalImagenService: ModalImagenService, 
            private busquedaService : BusquedasService) { }


  ngOnDestroy(): void {
    this.imgSubs.unsubscribe()
  }
          
  ngOnInit(): void {
    this.cargarHospitales()
    this.imgSubs = this.modalImagenService.nuevaImagen.pipe(delay(500))
    .subscribe(img=> this.cargarHospitales())
  }

  cargarHospitales(){
    this.cargando = true
    this.hospitalService.cargarHospitales().subscribe(
      hospitales =>{
        this.cargando = false
        this.hospitales = hospitales
        if(hospitales.length != 0){

          this.hospitales = hospitales
          this.hospitalesTemp =hospitales
        }
      }
    )
  }

  guardarCambios(hospital: Hospital){
    this.hospitalService.actualizarHospital(hospital._id, hospital.nombre).
    subscribe(resp =>{
      Swal.fire('Actualizado', hospital.nombre, 'success')
    })
  }

  eliminarHospital(hospital: Hospital){
    

    Swal.fire({
      title: 'Borrar hospital?',
      text: `Esta a punto de borrar a ${hospital.nombre}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Si, borralo!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.hospitalService.borrarHospital(hospital._id).
        subscribe(resp =>{
          this.cargarHospitales()
          Swal.fire('Borrado', hospital.nombre, 'success')
        })
        }
      })
  }

  async abrirSweetAlert(){
    const {value = ''} = await Swal.fire<string>({
      title: 'Crear hospital',
      text: 'Ingrese nombre del nuevo hospital',
      input: 'text',
      inputPlaceholder: 'Nombre del hospital',
      showCancelButton: true,
    })
    if(value.trim().length > 0){
      this.hospitalService.crearHospital(value)
      .subscribe((resp: any) => {
        this.hospitales.push(resp.hospital)
        Swal.fire('Agregado', resp.hospital.nombre, 'success')
      })
    }
  }

  abrirModal(hospital: Hospital){
    this.modalImagenService.abrirModal('hospitales', hospital._id,hospital.img)
    console.log(hospital.img)
  
  }

  buscar(termino:string){
    if(termino.length == 0){
      this.hospitales = this.hospitalesTemp
    }else{
      this.busquedaService.buscar('hospitales', termino)
      .subscribe(resultados => this.hospitales = resultados)

    }
  }

}
