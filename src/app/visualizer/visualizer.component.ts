

import { Component, ChangeDetectionStrategy, input, viewChild, ElementRef, effect, OnDestroy, signal, AfterViewInit, inject, DestroyRef } from '@angular/core';
import { takeWhile } from 'rxjs';
import { animationFrames } from 'rxjs'; // RxJS animationFrames
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:resize)': 'onWindowResize()'
  }
})
export class VisualizerComponent implements OnDestroy, AfterViewInit {
  mediaStream = input<MediaStream | null>();
  isRecording = input<boolean>(false);

  canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('visualizerCanvas');
  
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  
  private canvasWidth = signal(300);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const stream = this.mediaStream();
      const recording = this.isRecording();
      const canvasEl = this.canvasRef()?.nativeElement;
      const currentLogicalWidth = this.canvasWidth();

      if (!canvasEl) return;

      if (canvasEl.width !== currentLogicalWidth) {
        canvasEl.width = currentLogicalWidth;
      }
      if (canvasEl.height !== 100) { 
        canvasEl.height = 100;
      }
      
      if (!this.canvasCtx) {
        this.canvasCtx = canvasEl.getContext('2d');
      }

      if (recording && stream && this.canvasCtx) {
        this.startVisualization(stream);
      } else {
        this.stopVisualization();
      }
    });
  }

  ngAfterViewInit(): void {
    this.updateCanvasWidthSignal();
  }

  onWindowResize(): void {
    this.updateCanvasWidthSignal();
  }

  private updateCanvasWidthSignal(): void {
    const canvasEl = this.canvasRef()?.nativeElement;
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
    if (!this.canvasCtx) return;

    if (!this.audioContext || this.audioContext.state === 'closed') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }

    if (this.analyser && (!this.source || this.source.mediaStream !== stream)) {
        if (this.source) {
            this.source.disconnect();
        }
        this.source = this.audioContext.createMediaStreamSource(stream);
        this.source.connect(this.analyser);
    }
    
    if (this.analyser && this.dataArray && this.canvasCtx) {
        const analyserNode = this.analyser; 
        const dataArr = this.dataArray; 
        const ctx = this.canvasCtx; 

        animationFrames()
            .pipe(
              takeWhile(() => this.isRecording() && !!analyserNode && !!dataArr && !!ctx),
              takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(() => {
                this.drawVisualizationFrame(analyserNode, dataArr, ctx);
            });
    }
  }

  private drawVisualizationFrame(
    analyserNode: AnalyserNode,
    dataArray: Uint8Array<any>,
    canvasCtx: CanvasRenderingContext2D
  ): void {
    analyserNode.getByteTimeDomainData(dataArray);
    const canvas = canvasCtx.canvas;

    canvasCtx.fillStyle = 'rgb(31, 41, 55)'; // bg-gray-800
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(129, 140, 248)'; // indigo-400

    canvasCtx.beginPath();
    const sliceWidth = (canvas.width * 1.0) / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;
      if (i === 0) canvasCtx.moveTo(x, y);
      else canvasCtx.lineTo(x, y);
      x += sliceWidth;
    }
    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  }

  private stopVisualization(): void {    
    if (this.canvasCtx) {
      const canvas = this.canvasCtx.canvas;
      this.canvasCtx.fillStyle = 'rgb(55, 65, 81)'; // bg-gray-700
      this.canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      this.canvasCtx.fillStyle = 'rgb(156, 163, 175)'; // text-gray-400
      this.canvasCtx.textAlign = 'center';
      this.canvasCtx.font = '16px Arial';
      this.canvasCtx.fillText('Visualizer inactive', canvas.width / 2, canvas.height / 2);
    }

    this.cleanupAudioNodes();
  }
  
  private cleanupAudioNodes(): void {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(e => console.error("Error closing AudioContext:", e));
      this.audioContext = null;
    }
    if (!this.audioContext) {
        this.analyser = null;
        this.dataArray = null;
    }
  }

  ngOnDestroy(): void {
    this.cleanupAudioNodes();
  }
}