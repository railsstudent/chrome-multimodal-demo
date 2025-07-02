import { ChangeDetectionStrategy, Component, inject, linkedSignal, OnDestroy, signal } from '@angular/core';
import { PromptService } from '../ai/services/prompt.service';
import { AudioStoryComponent } from '../audio-story/audio-story.component';
import { ClipListComponent } from '../clip-list/clip-list.component';
import { PermissionCheckComponent } from '../permission-check/permission-check.component';
import { RecordControlComponent } from '../record-control/record-control.component';
import { AudioRecorderService } from '../services/audio-recorder.service';
import { AudioClip, SelectedAudio } from '../types';
import { VisualizerComponent } from '../visualizer/visualizer.component';

@Component({
  selector: 'app-web-dictaphone',
  imports: [
    RecordControlComponent, 
    VisualizerComponent, 
    ClipListComponent,
    PermissionCheckComponent,
    AudioStoryComponent,
  ],
  templateUrl: './web-dictaphone.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebDictaphoneComponent implements OnDestroy {
  private audioRecorderService = inject(AudioRecorderService);
  private promptService = inject(PromptService);

  isRecording = this.audioRecorderService.isRecording;
  mediaStream = this.audioRecorderService.mediaStream;
  recorderError = this.audioRecorderService.error;
  permissionStatus = this.audioRecorderService.permissionStatus;

  fullYear = new Date().getFullYear();

  audioClips = linkedSignal<Blob | null, AudioClip[]>({
    source: this.audioRecorderService.newClipRecorded,
    computation: (newBlob, previous) => {
      const numCopiesToKeep = 3;
      const previousClips = previous?.value || [];
      if (newBlob) {
        const id = crypto.randomUUID();
        const newClip: AudioClip = {
          id,
          name: `clip-${id}`,
          url: URL.createObjectURL(newBlob),
          blob: newBlob,
          createdAt: new Date(),
        };
        return [newClip, ...previousClips].slice(0, numCopiesToKeep);
      }
      return previousClips;
    }
  });

  selectedClip = signal<SelectedAudio | undefined>(undefined);

  requestAudioPermission(): void {
    this.audioRecorderService.requestPermission();
  }

  startRecording(): void {
    this.audioRecorderService.startRecording();
  }

  stopRecording(): void {
    this.audioRecorderService.stopRecording();
  }

  deleteClip(id: string): void {
    const idx = this.audioClips().findIndex((clip) => clip.id === id);
    const clip = idx >= 0 ? this.audioClips()[idx] : undefined;    
    this.audioClips.update(clips => clips.filter(clip => clip.id !== id));
    if (clip) {
      URL.revokeObjectURL(clip.url); // Clean up blob URL
    }
  }

  ngOnDestroy(): void {
    this.audioClips().forEach(clip => URL.revokeObjectURL(clip.url));
  }
}
