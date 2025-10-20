import { Component, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { PhotoService } from '../services/photo.services';
import { UserPhoto } from '../services/photo.services';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {
  constructor(
    public photoService: PhotoService
  ){}

  // Preview of the last captured photo (used inside the modal)
  capturedPhoto?: UserPhoto;


  @ViewChild(IonModal) modal!: IonModal;

  message = 'Aqui puede añadir un nuevo gasto';
  name!: string;
  monto!: number;
  miembro!: string;
  participantes!: string;


  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    if (this.capturedPhoto) {
      this.photoService.attachMetadata(this.capturedPhoto, {
        name: this.name,
        monto: this.monto,
        miembro: this.miembro,
        participantes: this.participantes
      });
      this.modal.dismiss(this.capturedPhoto, 'confirm');
    } else {
      this.modal.dismiss(this.name, 'confirm');
    }
  }

  onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm') {
      this.message = `Usted Añadio,${this.name}, monto: ${this.monto}`;
    }
  }

  async addPhotoToGallery() {
    try {
      const saved = await this.photoService.addNewToGallery();
      if (saved) {
        this.capturedPhoto = saved as UserPhoto;
        this.message = 'Foto tomada y guardada';
      }
    } catch (err) {
      console.error('Error tomando la foto:', err);
      this.message = 'Error al tomar la foto';
    }
  }
}