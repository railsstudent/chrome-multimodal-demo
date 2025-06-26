import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { AudioTranscriberComponent } from '../audio-transcriber/audio-transcriber.component';
import { StoryGeneratorComponent } from '../story-generator/story-generator.component';
import { SelectedAudio } from '../types';

@Component({
  selector: 'app-audio-story',
  imports: [
    AudioTranscriberComponent,
    StoryGeneratorComponent,
  ],
  template: `
    @if (selectedClip(); as selectedClip) {
        <app-audio-transcriber [audioBlob]="selectedClip" (topicTranscribed)="handleTopicTranscribed($event)" />
        <app-story-generator [topic]="transcribedTopic()" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioStoryComponent {
    selectedClip = input<SelectedAudio | undefined>(undefined);
    transcribedTopic = signal('');

    handleTopicTranscribed(topic: string): void {
        this.transcribedTopic.set(topic);
    }
}
