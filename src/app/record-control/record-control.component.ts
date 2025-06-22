import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-record-control',
  templateUrl: './record-control.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordControlComponent {
  isRecording = input.required<boolean>();
  start = output<void>();
  stop = output<void>();

  handleClick(): void {
    if (this.isRecording()) {
      this.stop.emit();
    } else {
      this.start.emit();
    }
  }
}