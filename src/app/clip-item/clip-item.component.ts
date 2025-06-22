import { DatePipe } from '@angular/common'; // Import DatePipe
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { SafeUrlPipe } from '../safe-url.pipe'; // Import SafeUrlPipe
import { AudioClip } from '../types';

@Component({
  selector: 'app-clip-item',
  imports: [SafeUrlPipe, DatePipe], 
  templateUrl: './clip-item.component.html',
  styleUrls: ['./clip-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClipItemComponent {
  clip = input.required<AudioClip>();
  delete = output<string>();
  selectAudio = output<string>();
  isChecked = input(false);

  handleDelete(): void {
    this.delete.emit(this.clip().id);
  }

  selectThisAudio() {
    console.log('selectThisAudio', this.clip().id);
    this.selectAudio.emit(this.clip().id);
  }
}