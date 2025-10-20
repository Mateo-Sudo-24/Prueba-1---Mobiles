import { Component, OnInit } from '@angular/core';
import { PhotoService, UserPhoto, generateReportTxtFromPhotos } from '../services/photo.services';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: false,
})
export class Tab4Page implements OnInit {

  constructor(public photoService: PhotoService) { }

  ngOnInit() {
    this.photoService.loadSavedPhotos();
  }

  // total sum of monto values (coerce to number, ignore missing)
  get totalSpent(): number {
    return this.photoService.photos.reduce((acc, p) => {
      const val = p.monto != null ? Number(p.monto) : 0;
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
  }

  // most recent expenses (limit to 4)
  get recentExpenses(): UserPhoto[] {
    return this.photoService.photos.slice(0, 4);
  }

  downloadReport() {
    // Ensure latest photos are loaded
    this.photoService.loadSavedPhotos().then(() => {
      generateReportTxtFromPhotos(this.photoService.photos);
    });
  }

}
