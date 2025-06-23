import { ChangeDetectionStrategy, Component, inject, linkedSignal, OnDestroy, signal } from '@angular/core';
import { ClipListComponent } from '../clip-list/clip-list.component';
import { PermissionCheckComponent } from '../permission-check/permission-check.component';
import { RecordControlComponent } from '../record-control/record-control.component';
import { VisualizerComponent } from '../visualizer/visualizer.component';
import { AudioRecorderService } from '../services/audio-recorder.service';
import { AudioClip, SelectedAudio } from '../types';

@Component({
  selector: 'app-audio-transcriber',
  imports: [
  ],
  templateUrl: './audio-transcriber.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioTranscriberComponent {
}
