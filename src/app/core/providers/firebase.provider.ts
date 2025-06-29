import { makeEnvironmentProviders } from '@angular/core';
import { getAI, getImagenModel, GoogleAIBackend } from 'firebase/ai';
import { initializeApp } from "firebase/app";
import firebaseConfig from '../../firebase-ai.json';
import { IMAGEN_MODEL } from '../constants/firebase.constant';

export function provideFirebase() {
    return makeEnvironmentProviders([
        {
            provide: IMAGEN_MODEL,
            useFactory: () => {
                const { app, imagenModelName = 'imagen-3.0-generate-002' } = firebaseConfig;
                const firebaseApp = initializeApp(app);

                // Initialize the Gemini Developer API backend service
                const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

                return getImagenModel(ai, {            
                    model: imagenModelName,
                    generationConfig: {
                        numberOfImages: 1,
                    }
                });
            }
        }
    ]);
}
