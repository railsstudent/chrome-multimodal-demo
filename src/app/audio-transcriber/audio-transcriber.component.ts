import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { SelectedAudio } from '../types';

@Component({
  selector: 'app-audio-transcriber',
  templateUrl: './audio-transcriber.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioTranscriberComponent {
  audioBlob = input<SelectedAudio | undefined>(undefined); // Input signal for the audio blob
  isTranscribing = input(false);
  error = input('');
  transcription = input.required<string>();

  isButtonDisabled = computed(() => !this.audioBlob() || this.isTranscribing());
  hasTranscription = computed(() => !!this.transcription() && !this.error());

  handleTranscription = output<void>();

  async transcribeAudio(): Promise<void> {
    const currentBlob = this.audioBlob(); // Get the current value of the input signal
    if (!currentBlob || !currentBlob.blob) {
      return;
    }

    this.handleTranscription.emit();
  }
}
