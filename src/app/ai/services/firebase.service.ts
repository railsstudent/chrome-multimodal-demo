import { inject, Injectable } from '@angular/core';
import { IMAGEN_MODEL } from '../../core/constants/firebase.constant';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService  {
    imagenModel = inject(IMAGEN_MODEL);
    
    async generateImage(topic: string) {
        if (!topic) {
            throw Error('Topic is required to generate an image.');
        }

        const imagePrompt = `Generate an image for ${topic}`;
        
        console.log('imagePrompt', imagePrompt);
        const result = await this.imagenModel.generateImages(imagePrompt);
        if (result?.images?.[0]) {
            return result.images[0];
        }
        throw Error('No images generated.');
    }    
}
