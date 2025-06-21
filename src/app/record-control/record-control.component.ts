import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
// import { CommonModule } from '@angular/common'; // CommonModule removed

@Component({
  selector: 'app-record-control',
  standalone: true,
  imports: [/* CommonModule removed */],
  templateUrl: './record-control.component.html',
  styleUrls: ['./record-control.component.css'],
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