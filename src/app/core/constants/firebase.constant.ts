import { InjectionToken } from '@angular/core';
import { FirebaseApp } from 'firebase/app';

export const FIREBASE_APP = new InjectionToken<FirebaseApp>('firebase.config');