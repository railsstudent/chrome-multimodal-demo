import { ChangeDetectionStrategy, Component, input, Signal } from '@angular/core';

@Component({
  selector: 'app-audio-transcriber',
  imports: [],
  templateUrl: './audio-transcriber.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioTranscriberComponent {
  blob: Signal<Blob | undefined> = input(undefined);
  transcription: Signal<string | undefined> = input(undefined);
}
