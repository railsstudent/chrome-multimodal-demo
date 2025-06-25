import { Component, ChangeDetectionStrategy, input, signal, computed, inject } from '@angular/core';
import { PromptService } from '../ai/services/prompt.service';
import { SelectedAudio } from '../types';

@Component({
  selector: 'app-audio-transcriber',
  templateUrl: './audio-transcriber.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioTranscriberComponent {
  audioBlob = input<SelectedAudio | undefined>(undefined); // Input signal for the audio blob

  private transcriptionService = inject(PromptService);

  transcription = signal('');
  isTranscribing = signal(false);
  error = this.transcriptionService.error;

  isButtonDisabled = computed<boolean>(() => !this.audioBlob() || this.isTranscribing());

  async transcribeAudio(): Promise<void> {
    const currentBlob = this.audioBlob(); // Get the current value of the input signal
    if (!currentBlob || !currentBlob.blob) {
      return;
    }

    this.isTranscribing.set(true);
    this.transcription.set(''); // Clear previous transcription

    try {
      const result = await this.transcriptionService.transcribeAudio(currentBlob.blob);
      this.transcription.set(result);
    } catch (err) {
      console.error('Transcription failed in component:', err);
      this.transcription.set(''); // Ensure transcription is cleared on error
    } finally {
      this.isTranscribing.set(false);
    }
  }
}
