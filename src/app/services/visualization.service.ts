import { Injectable } from '@angular/core';

@Injectable({
providedIn: 'root',
})
export class VisualizationService {

    drawVisualizationFrame(
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

    clearCanvas(canvasCtx?: CanvasRenderingContext2D) {
        if (canvasCtx) {
          const canvas = canvasCtx.canvas;
          canvasCtx.fillStyle = 'rgb(55, 65, 81)'; // bg-gray-700
          canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
          canvasCtx.fillStyle = 'rgb(156, 163, 175)'; // text-gray-400
          canvasCtx.textAlign = 'center';
          canvasCtx.font = '16px Arial';
          canvasCtx.fillText('Visualizer inactive', canvas.width / 2, canvas.height / 2);
        }
      }
}