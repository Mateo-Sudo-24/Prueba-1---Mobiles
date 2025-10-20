import { Injectable } from '@angular/core';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo as CameraPhoto,
} from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = 'photos';

  async addNewToGallery(): Promise<UserPhoto | null> {
    try {
      const capturedPhoto = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 90
      });

      const savedImageFile = await this.savePicture(capturedPhoto);
      this.photos.unshift(savedImageFile);
      await this.savePhotosList();

      return savedImageFile;
    } catch (error) {
      console.error('Error al tomar la foto:', error);
      return null;
    }
  }

  async deletePhoto(photo: UserPhoto, position: number): Promise<boolean> {
    try {
      await Filesystem.deleteFile({
        path: photo.filepath,
        directory: Directory.Data
      });

      this.photos.splice(position, 1);
      await this.savePhotosList();

      return true;
    } catch (error) {
      console.error('Error eliminando foto:', error);
      return false;
    }
  }

  private async savePicture(photo: CameraPhoto): Promise<UserPhoto> {
    const base64DataWithPrefix = await this.readAsBase64(photo);
    const base64Data = base64DataWithPrefix.split(',')[1];
    const fileName = `photo_${Date.now()}.jpeg`;

    if (Capacitor.isNativePlatform()) {
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Data
      });

      return {
        filepath: fileName,
        webviewPath: `data:image/jpeg;base64,${base64Data}`,
        savedUri: savedFile.uri,
        timestamp: new Date()
      };
    } else {
      return {
        filepath: fileName,
        webviewPath: `data:image/jpeg;base64,${base64Data}`,
        timestamp: new Date()
      };
    }
  }

  async loadSavedPhotos(): Promise<void> {
    const photoList = await Preferences.get({ key: this.PHOTO_STORAGE });
    const photos = photoList.value ? JSON.parse(photoList.value) : [];

    if (!photos || photos.length === 0) return;

    for (let photo of photos) {
      try {
        if (Capacitor.isNativePlatform()) {
          const readFile = await Filesystem.readFile({
            path: photo.filepath,
            directory: Directory.Data
          });
          photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
        }

        if (!photo.location) {
          photo.location = {
            latitude: 0,
            longitude: 0,
            accuracy: 0,
            timestamp: photo.timestamp || Date.now()
          };
        }
      } catch (error) {
        console.error(`Error cargando foto ${photo.filepath}:`, error);
      }
    }

    this.photos = photos;
  }

  private async savePhotosList(): Promise<void> {
    await Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos)
    });
  }

  // Attach metadata to a saved photo and persist the list
  async attachMetadata(photo: UserPhoto, meta: PhotoMetadata): Promise<void> {
    const idx = this.photos.findIndex(p => p.filepath === photo.filepath);
    if (idx > -1) {
      this.photos[idx] = { ...this.photos[idx], ...meta };
      await this.savePhotosList();
    } else {
      // If not found, attach to the provided object and push
      const newPhoto = { ...photo, ...meta } as UserPhoto;
      this.photos.unshift(newPhoto);
      await this.savePhotosList();
    }
  }

  private async readAsBase64(photo: CameraPhoto): Promise<string> {
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();
    return await this.convertBlobToBase64(blob) as string;
  }

  private convertBlobToBase64 = (blob: Blob): Promise<string | ArrayBuffer | null> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
}

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
  savedUri?: string;
  timestamp?: Date;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  };
  // Optional metadata for receipts
  name?: string;
  monto?: number;
  miembro?: string;
  participantes?: string;
}

export interface PhotoMetadata {
  name?: string;
  monto?: number;
  miembro?: string;
  participantes?: string;
}

  // Generate a plain text report from current photos and trigger download
  
export async function _unused() { /* keep exports grouped */ }

// Add a helper reachable from components to generate a TXT report and trigger download
export function generateReportTxtFromPhotos(photos: UserPhoto[]) {
  const lines: string[] = [];
  for (const p of photos) {
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

// Add method to attach metadata to an existing saved photo and persist
export async function _noop() { /* placeholder to keep exports grouped */ }
