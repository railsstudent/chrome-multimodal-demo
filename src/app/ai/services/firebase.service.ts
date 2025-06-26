import { inject, Injectable } from '@angular/core';
import { getAI, getImagenModel, GoogleAIBackend } from "firebase/ai";
import { FIREBASE_APP } from '../../core/constants/firebase.constant';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService  {
    firebaseApp = inject(FIREBASE_APP);
    
    async generateImage(topic: string) {
        if (!topic) {
            throw Error('Topic is required to generate an image.');
        }

        const imagePrompt = `Generate an image for ${topic}`;
        // Initialize the Gemini Developer API backend service
        const ai = getAI(this.firebaseApp, { backend: new GoogleAIBackend() });

        const imageModel = getImagenModel(ai, {            
            model: "imagen-3.0-generate-002",
            generationConfig: {
                numberOfImages: 1,
            }
        });

        console.log('imagePrompt', imagePrompt);
        const result = await imageModel.generateImages(imagePrompt);
        if (result?.images?.[0]) {
            return result.images[0];
        }
        throw Error('No images generated.');
    }    
}
