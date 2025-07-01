import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter, map, shareReplay, Subject, switchMap } from 'rxjs';
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

    audioToText = new Subject<void>();

    isTranscribing = signal(false);
    #transcription$ = this.audioToText
      .pipe(
        filter(() => !!this.selectedClip()?.blob),
        map(() => this.selectedClip()?.blob as Blob),
        switchMap((blob) => {
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
            .catch((err) => { 
              console.log(err);
              return '';
            })
            .finally(() => this.loadingImage.set(false))
        })
      ), { initialValue: ''});
    
    story = this.storyService.chunk;
    storyError = this.storyService.error;

    destroyRef$ = inject(DestroyRef);

    constructor() {
      this.#transcription$
        .pipe(
          filter((topic) => !!topic && topic.trim() !== ''),
          map((topic) => topic.trim()),
          switchMap((topic) => this.storyService.makeStoryStream(topic)),  
          takeUntilDestroyed(this.destroyRef$)
        )
      .subscribe();
    }
}
