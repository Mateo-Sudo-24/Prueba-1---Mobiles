import { Component } from '@angular/core';
import { PhotoService, UserPhoto, generateReportTxtFromPhotos } from '../services/photo.services';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  constructor(public photoService: PhotoService) {}

  ngOnInit(): void {
    this.photoService.loadSavedPhotos();
  }

  get totalSpent(): number {
    return this.photoService.photos.reduce((acc, p) => {
      const val = p.monto != null ? Number(p.monto) : 0;
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
  }

  get recentExpenses(): UserPhoto[] {
    return this.photoService.photos.slice(0, 4);
  }

  downloadReport() {
    generateReportTxtFromPhotos(this.photoService.photos);
  }

}
