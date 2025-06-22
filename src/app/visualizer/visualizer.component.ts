

import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, OnDestroy, computed, effect, inject, input, linkedSignal, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { animationFrames, takeWhile } from 'rxjs';
import { VisualizationService } from '../services/visualization.service';

@Component({
  selector: 'app-visualizer',
  templateUrl: './visualizer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:resize)': 'updateCanvasWidthSignal()'
  }
})
export class VisualizerComponent implements OnDestroy, AfterViewInit {
  mediaStream = input<MediaStream | null>();
  isRecording = input(false);

  canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('visualizerCanvas');
  
  private audioContext = signal<AudioContext | undefined>(undefined);
  private analyzer = linkedSignal<AudioContext | undefined, AnalyserNode | undefined>({
    source: this.audioContext,
    computation: (audioContext, previous) => {
      if (!audioContext) {
        return previous?.value;
      }

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;

      return analyser;
    }
  });

  private dataArray = linkedSignal<AnalyserNode | undefined, Uint8Array | undefined>({
    source: this.analyzer,
    computation: (analyser, previous) => 
      analyser ? new Uint8Array(analyser.frequencyBinCount) : previous?.value
  });
  
  private canvasWidth = signal(300);
  private destroyRef = inject(DestroyRef);
  private visualizationService = inject(VisualizationService);

  private canvasEl = linkedSignal<number, HTMLCanvasElement | undefined>({
    source: this.canvasWidth,
    computation: (currentLogicalWidth, previous) => {
      const canvasEl = previous?.value || this.canvasRef()?.nativeElement;

      if (!canvasEl) {
        return canvasEl;
      }
      
      if (canvasEl.width !== currentLogicalWidth) {
        canvasEl.width = currentLogicalWidth;
      }
      
      if (canvasEl.height !== 100) { 
        canvasEl.height = 100;
      }
      return canvasEl;  
    }
  });

  private canvasCtx = computed(() => this.canvasEl()?.getContext('2d'));
  private source: MediaStreamAudioSourceNode | null = null;

  constructor() {
    effect(() => {
      const stream = this.mediaStream();      
      if (this.mediaStream() && stream && this.canvasCtx()) {
        this.startVisualization(stream);
      } else {
        this.stopVisualization();
      }
    });
  }

  ngAfterViewInit(): void {
    this.updateCanvasWidthSignal();
  }

  private updateCanvasWidthSignal(): void {
    const canvasEl = this.canvasEl();
    let newWidth = 300; 

    if (canvasEl && canvasEl.parentElement) {
        newWidth = canvasEl.parentElement.offsetWidth;
    } else if (canvasEl) {
        newWidth = canvasEl.width > 0 ? canvasEl.width : 300;
    }
    
    if (this.canvasWidth() !== newWidth && newWidth > 0) {
      this.canvasWidth.set(newWidth);
    }
  }

  private startVisualization(stream: MediaStream): void {
    if (!this.canvasCtx()) { 
      return;
    }

    if (!this.audioContext() || this.audioContext()?.state === 'closed') {
      const newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.audioContext.set(newAudioContext);
    }

    if (this.analyzer() && (!this.source || this.source.mediaStream !== stream)) {
      const analyzerNode = this.analyzer() as AnalyserNode;
      if (this.source) {
          this.source.disconnect();
      }
      if (this.audioContext()) {
          this.source = (this.audioContext() as AudioContext).createMediaStreamSource(stream);
          this.source.connect(analyzerNode);  
      }
    }

    const ctx = this.canvasCtx(); 
    if (this.analyzer() && this.dataArray() && ctx) {
      const analyzerNode = this.analyzer() as AnalyserNode; 
      const dataArr = this.dataArray() as Uint8Array; 

      animationFrames()
        .pipe(
          takeWhile(() => this.isRecording() && !!analyzerNode && !!dataArr && !!ctx),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => {
          this.visualizationService.drawVisualizationFrame(analyzerNode, dataArr, ctx);
        });
    }
  }

  private stopVisualization(): void {    
    this.visualizationService.clearCanvas();
    this.cleanupAudioNodes();
  }
  
  private cleanupAudioNodes(): void {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.audioContext() && this.audioContext()?.state !== 'closed') {
      this.audioContext()?.close()
        .catch(e => console.error("Error closing AudioContext:", e));
      this.audioContext.set(undefined);
    }
    if (!this.audioContext()) {
        this.analyzer.set(undefined);
        this.dataArray.set(undefined);
    }
  }

  ngOnDestroy(): void {
    this.cleanupAudioNodes();
  }
}