import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, shareReplay, Subject, switchMap, tap } from 'rxjs';
import { FirebaseService } from '../ai/services/firebase.service';
import { PromptService } from '../ai/services/prompt.service';
import { StoryService } from '../ai/services/story.service';
import { AudioTranscriberComponent } from '../audio-transcriber/audio-transcriber.component';
import { StoryGeneratorComponent } from '../story-generator/story-generator.component';
import { SelectedAudio } from '../types';

@Component({
  selector: 'app-audio-story',
  imports: [
    AudioTranscriberComponent,
    StoryGeneratorComponent,
  ],
  templateUrl: './audio-story.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioStoryComponent {
    selectedClip = input<SelectedAudio | undefined>(undefined);    // tra = signal('');

    private firebaseService = inject(FirebaseService);
    private storyService = inject(StoryService);
    private transcriptionService = inject(PromptService);

    transcribeTopic = new Subject<void>();

    isTranscribing = signal(false);
    #transcription$ = this.transcribeTopic
      .pipe(
        tap(() => console.log('hello')),
        filter(() => !!this.selectedClip()?.blob),
        map(() => this.selectedClip()?.blob as Blob),
        switchMap((blob) => {
          console.log('blob', blob);
          this.isTranscribing.set(true);
          return this.transcriptionService.transcribeAudio(blob)
            .then((topic) => topic)
            .finally(() => this.isTranscribing.set(false));
        }),
        shareReplay({
          bufferSize: 1,
          refCount: true,
        })
      );
    transcribedTopic = toSignal(this.#transcription$, { initialValue: '' });
    transcriptionError = this.transcriptionService.error;

    loadingImage = signal(false);
    base64ImageData = toSignal(this.#transcription$
      .pipe(
        filter((topic) => !!topic),
        switchMap((topic) =>  {
          this.loadingImage.set(true);
          return this.firebaseService.generateImage(topic)
            .then((imageData) => {
              const mimeType = imageData.mimeType;
              const base64Data = imageData.bytesBase64Encoded;
              return `data:${mimeType};base64,${base64Data}`;
            })
            .catch((err) => { 
              console.log(err);
              return '';
            })
            .finally(() => this.loadingImage.set(false))
        })
      ), { initialValue: ''});

    isGenerating = signal(false);
    
    #story$ = this.#transcription$
      .pipe(
        filter((topic) => !!topic),
        switchMap((topic) => { 
          this.isGenerating.set(true);
          return this.storyService.makeStory(topic)
            .finally(() => this.isGenerating.set(false));
        }),
      );

    story = toSignal(this.#story$, { initialValue: '' });    
    storyError = this.storyService.error;
}
