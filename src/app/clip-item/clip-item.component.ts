import { DatePipe } from '@angular/common'; // Import DatePipe
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AudioClip, SelectedAudio } from '../types';

@Component({
  selector: 'app-clip-item',
  imports: [DatePipe], 
  templateUrl: './clip-item.component.html',
  styleUrls: ['./clip-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClipItemComponent {
  sanitizer = inject(DomSanitizer);

  clip = input.required<AudioClip>();
  delete = output<string>();
  selectAudio = output<SelectedAudio>();
  isChecked = input(false);

  safeUrl = computed(() => this.sanitizer.bypassSecurityTrustUrl(this.clip().url));

  handleDelete(): void {
    this.delete.emit(this.clip().id);
  }


  selectThisAudio() {
    console.log('selectThisAudio', this.clip().id);
    this.selectAudio.emit({ 
      id: this.clip().id, 
      name: this.clip().name,
      blob: this.clip().blob,
    });
  }
}