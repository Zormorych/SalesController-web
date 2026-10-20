import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

// Guarda en el equipo un fichero recibido del backend (por ejemplo, el Excel de un lote)
@Injectable({ providedIn: 'root' })
export class FileDownloader {
  private readonly document = inject(DOCUMENT);

  save(fileName: string, content: Blob): void {
    const url = URL.createObjectURL(content);
    const link = this.document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    // Liberarlo justo después del clic puede cortar la descarga en algunos navegadores
    setTimeout(() => URL.revokeObjectURL(url));
  }
}
