import { InjectionToken } from '@angular/core';
import { ImagenModel } from 'firebase/ai';

export const IMAGEN_MODEL = new InjectionToken<ImagenModel>('imagen_model');
