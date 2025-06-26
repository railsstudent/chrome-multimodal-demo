import { makeEnvironmentProviders } from '@angular/core';
import { initializeApp } from "firebase/app";
import firebaseConfig from '../../firebase-ai.json';
import { FIREBASE_APP } from '../constants/firebase.constant';

const app = initializeApp(firebaseConfig);

export function provideFirebase() {
    return makeEnvironmentProviders([
        {
            provide:  FIREBASE_APP,
            useValue: app
        }
    ]);
}
