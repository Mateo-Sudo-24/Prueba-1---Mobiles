import { Component, OnInit } from '@angular/core';
import { PhotoService, UserPhoto } from '../services/photo.services';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page implements OnInit {

  constructor(
    public photoService: PhotoService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit(): void {
    this.photoService.loadSavedPhotos();
  }

  // Export a simple plain-text report (one receipt per line)
  exportTxt() {
    const lines: string[] = [];
    for (const p of this.photoService.photos) {
      const name = p.name ? p.name : 'Sin descripcion';
      const monto = p.monto != null ? p.monto : '0';
      const miembro = p.miembro ? `Miembro: ${p.miembro}` : '';
      const participantes = p.participantes ? `Participantes: ${p.participantes}` : '';
      const timestamp = p.timestamp ? new Date(p.timestamp).toLocaleString() : '';
      lines.push(`Descripcion: ${name} - Monto: ${monto} - ${miembro} ${participantes} - Fecha: ${timestamp}`.trim());
    }

    const txt = lines.join('\n');
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `reporte_gastos_${new Date().toISOString()}.txt`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  async deletePhoto(photo: UserPhoto, index: number) {
    const header = photo.name ? `Eliminar "${photo.name}"` : 'Eliminar foto';
    const alert = await this.alertCtrl.create({
      header,
      message: '¿Estás seguro que deseas eliminar esta foto?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'confirm' }
      ]
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role === 'confirm') {
      try {
        const ok = await this.photoService.deletePhoto(photo, index);
        // deletion performed; UI updates because photos[] updated in the service
        // nothing else required here
      } catch (err) {
        console.error('Error deleting photo:', err);
      }
    }
  }

}
