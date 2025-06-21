import { Component, effect, inject, signal } from '@angular/core';
import { ClipListComponent } from './clip-list/clip-list.component';
import { PermissionCheckComponent } from './permission-check/permission-check.component';
import { RecordControlComponent } from './record-control/record-control.component';
import { VisualizerComponent } from './visualizer/visualizer.component';
import { AudioRecorderService } from './services/audio-recorder.service';
import { AudioClip } from './types';

@Component({
  selector: 'app-root',
  imports: [
    RecordControlComponent, 
    VisualizerComponent, 
    ClipListComponent,
    PermissionCheckComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private audioRecorderService = inject(AudioRecorderService);

  audioClips = signal([] as AudioClip[]);
  
  isRecording = this.audioRecorderService.isRecording.asReadonly();
  mediaStream = this.audioRecorderService.mediaStream.asReadonly();
  recorderError = this.audioRecorderService.error.asReadonly();
  permissionStatus = this.audioRecorderService.permissionStatus.asReadonly();

  fullYear = new Date().getFullYear();

  constructor() {
    effect(() => {
      const newBlob = this.audioRecorderService.newClipRecorded();
      if (newBlob) {
        const newClip: AudioClip = {
          id: crypto.randomUUID(),
          name: `clip-${new Date().toISOString().replace(/[:.]/g, '-')}`,
          url: URL.createObjectURL(newBlob),
          blob: newBlob,
          createdAt: new Date(),
        };
        this.audioClips.update(clips => [newClip, ...clips]);
      }
    });
  }

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
    this.audioClips.update(clips =>
      clips.filter(clip => {
        if (clip.id === id) {
          URL.revokeObjectURL(clip.url); // Clean up blob URL
          return false;
        }
        return true;
      })
    );
  }

  ngOnDestroy(): void {
    // Clean up all object URLs when the app component is destroyed
    this.audioClips().forEach(clip => URL.revokeObjectURL(clip.url));
    // Service handles its own stream cleanup if needed
  }
}
