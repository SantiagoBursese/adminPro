import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { BusquedasService } from 'src/app/services/busquedas.service';
import { MedicoService } from 'src/app/services/medico.service';
import { ModalImagenService } from 'src/app/services/modal-imagen.service';
import { Medico } from 'src/models/medico.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-medicos',
  templateUrl: './medicos.component.html',
  styles: [
  ]
})
export class MedicosComponent implements OnInit {

  public medicos: Medico [] = []
  public medicosTemp:Medico[] = []
  public cargando : boolean = true

  public imgSubs : Subscription

  constructor(private medicoService: MedicoService,
            private modalImagenService: ModalImagenService, 
            private busquedaService : BusquedasService) { }


  ngOnDestroy(): void {
    this.imgSubs.unsubscribe()
  }
          
  ngOnInit(): void {
    this.cargarMedicos()
    this.imgSubs = this.modalImagenService.nuevaImagen.pipe(delay(500))
    .subscribe(img=> this.cargarMedicos())
  }

  cargarMedicos(){
    this.cargando = true
    this.medicoService.cargarMedicos().subscribe(
      medicos =>{
        this.cargando = false
        this.medicos = medicos
        if(medicos.length != 0){

          this.medicos = medicos
          this.medicosTemp =medicos
        }
      }
    )
  }


  eliminarMedico(medico: Medico){
  
    Swal.fire({
      title: 'Borrar medico?',
      text: `Esta a punto de borrar a ${medico.nombre}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Si, borralo!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.medicoService.borrarMedico(medico._id).
        subscribe(resp =>{
          this.cargarMedicos()
          Swal.fire('Borrado', medico.nombre, 'success')
        })
        }
      })
  }

  abrirModal(medico: Medico){
    this.modalImagenService.abrirModal('medicos', medico._id,medico.img)
    console.log(medico.img)
  
  }

  buscar(termino:string){
    if(termino.length == 0){
      this.medicos = this.medicosTemp
    }else{
      this.busquedaService.buscar('medicos', termino)
      .subscribe(resultados => this.medicos = resultados)

    }
  }
}
