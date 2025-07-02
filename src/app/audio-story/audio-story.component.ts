import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, map, Subject, switchMap, tap } from 'rxjs';
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

    isTranscribing = this.transcriptionService.isTranscribing
    transcribedTopic = this.transcriptionService.chunk;
    transcriptionError = this.transcriptionService.error;

    isTranscriptionSuccessful = computed(() => !this.isTranscribing() 
      && !!this.transcribedTopic() 
      && this.transcribedTopic().trim() !== ''
    );

    trimmedTopic = computed(() => this.transcribedTopic().trim());

    loadingImage = signal(false);
    base64ImageData = toSignal(toObservable(this.isTranscriptionSuccessful)
      .pipe(
        filter((isSuccess) => !!isSuccess),
        switchMap(() =>  {
          this.loadingImage.set(true);
          return this.firebaseService.generateImage(this.trimmedTopic())
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
      this.audioToText
        .pipe(
          filter(() => !!this.selectedClip()?.blob),
          map(() => this.selectedClip()?.blob as Blob),
          switchMap((blob) => this.transcriptionService.transcribeAudioStream(blob)),
          takeUntilDestroyed(this.destroyRef$)
        )
      .subscribe();

      toObservable(this.isTranscriptionSuccessful)
        .pipe(
          filter((isSuccess) => isSuccess),
          map(() => this.trimmedTopic()),
          switchMap((topic) => this.storyService.makeStoryStream(topic)),  
          takeUntilDestroyed(this.destroyRef$)
        )
      .subscribe();
    }

    handleTranscription() {
      this.audioToText.next();
      this.transcriptionService.requestAudioToText();
    }
}
