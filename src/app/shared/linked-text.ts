import { Component, computed, input } from '@angular/core';

interface Part {
  text: string;
  url: boolean;
}

// Solo direcciones web normales: así nunca se enlaza algo como "javascript:..."
const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

// Muestra un texto con sus direcciones web convertidas en enlaces que se abren en otra pestaña.
// Se pinta con la plantilla (sin innerHTML), así que el texto nunca se interpreta como HTML
@Component({
  selector: 'app-linked-text',
  // Cada trozo en su propio elemento: así los espacios de la plantilla no se cuelan en el texto
  template: `
    @for (part of parts(); track $index) {
      @if (part.url) {
        <a [href]="part.text" target="_blank" rel="noopener noreferrer">{{ part.text }}</a>
      } @else {
        <span>{{ part.text }}</span>
      }
    }
  `,
  styles: `
    :host {
      white-space: pre-line;
      overflow-wrap: anywhere;
    }
  `,
})
export class LinkedText {
  readonly text = input<string | null | undefined>(null);

  protected readonly parts = computed<Part[]>(() =>
    (this.text() ?? '')
      .split(URL_PATTERN)
      .filter((text) => text !== '')
      .map((text) => ({ text, url: /^https?:\/\//.test(text) })),
  );
}
