import { Injectable, signal, WritableSignal, effect, untracked } from '@angular/core';

export type PermissionStatus = 'prompt' | 'granted' | 'denied';

@Injectable({
  providedIn: 'root',
})
export class AudioRecorderService {
  isRecording = signal(false);
  mediaStream: WritableSignal<MediaStream | null> = signal(null);
  error = signal(''); // Changed from string | null to string, and null to ''
  permissionStatus: WritableSignal<PermissionStatus> = signal('prompt');
  
  // Signal to emit the newly recorded audio blob
  private recordedAudioBlob: WritableSignal<Blob | null> = signal(null);
  
  // Public signal for components to react to new recordings
  public readonly newClipRecorded = this.recordedAudioBlob.asReadonly();

  private mediaRecorderRef: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor() {
    this.checkPermission();

    // Effect to auto-clear error when permission becomes granted
    effect(() => {
      if (this.permissionStatus() === 'granted' && this.error() === "Microphone permission denied.") {
        this.error.set(''); // Changed from null
      }
    });
  }

  async checkPermission(): Promise<void> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.error.set("getUserMedia not supported on your browser!");
      this.permissionStatus.set('denied');
      return;
    }
    try {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      this.permissionStatus.set(permission.state as PermissionStatus);
      permission.onchange = () => {
        this.permissionStatus.set(permission.state as PermissionStatus);
        if (permission.state !== 'granted' && this.isRecording()) {
          this.stopRecording(); // Stop recording if permission is revoked
        }
      };
    } catch (err) {
      console.warn("Permissions API for microphone not fully supported or error querying:", err);
      // Fallback: If query fails, status remains 'prompt', getUserMedia will clarify.
    }
  }

  async requestPermission(): Promise<void> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.error.set("getUserMedia not supported on your browser!");
      this.permissionStatus.set('denied');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Permission granted, stop tracks immediately as startRecording will request a new stream.
      stream.getTracks().forEach(track => track.stop());
      this.permissionStatus.set('granted');
      this.error.set(''); // Changed from null
    } catch (err) {
      console.error("Error requesting microphone permission:", err);
      this.error.set("Microphone permission denied.");
      this.permissionStatus.set('denied');
    }
  }

  async startRecording(): Promise<void> {
    if (this.isRecording()) return;
    
    untracked(() => this.error.set('')); // Clear previous errors, changed from null

    if (this.permissionStatus() !== 'granted') {
      await this.requestPermission();
      // Re-check permission status after request
      if (this.permissionStatus() !== 'granted') {
        this.error.set("Microphone permission is required to record.");
        return;
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaStream.set(stream);
      this.isRecording.set(true);
      this.recordedAudioBlob.set(null); // Clear previous blob

      this.mediaRecorderRef = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorderRef.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorderRef.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.recordedAudioBlob.set(audioBlob);
        this.cleanupAfterStop();
      };
      
      this.mediaRecorderRef.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        this.error.set("Error during recording.");
        this.cleanupAfterStop(stream); // Pass stream for cleanup on error
      };

      this.mediaRecorderRef.start();
    } catch (err) {
      console.error("Error starting recording:", err);
      this.error.set("Failed to start recording. Check microphone permissions.");
      this.isRecording.set(false);
      this.mediaStream.set(null);
      if ((err as Error).name === 'NotAllowedError' || (err as Error).name === 'PermissionDeniedError') {
        this.permissionStatus.set('denied');
      }
    }
  }

  stopRecording(): void {
    if (this.mediaRecorderRef && this.mediaRecorderRef.state !== 'inactive') {
      this.mediaRecorderRef.stop(); // This will trigger onstop and subsequent cleanup
    } else {
      // If recorder wasn't active or already stopped, ensure cleanup
      this.cleanupAfterStop(this.mediaStream());
    }
  }
  
  private cleanupAfterStop(streamToStop?: MediaStream | null): void {
    const stream = streamToStop || this.mediaStream();
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    this.mediaStream.set(null);
    this.isRecording.set(false);
    this.mediaRecorderRef = null;
    // this.audioChunks = []; // Cleared on next recording or handled by onstop creating blob
  }

  // Call this method if the service itself is destroyed, though for root services it's app lifetime
  ngOnDestroy(): void {
    this.cleanupAfterStop(this.mediaStream());
  }
}