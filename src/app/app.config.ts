import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideFirebase } from './core/providers/firebase.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideFirebase(),
  ]
};
