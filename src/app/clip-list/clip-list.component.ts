import { ChangeDetectionStrategy, Component, input, model, output, signal } from '@angular/core';
import { ClipItemComponent } from '../clip-item/clip-item.component';
import { AudioClip, SelectedAudio } from '../types';

@Component({
  selector: 'app-clip-list',
  imports: [ClipItemComponent],
  templateUrl: './clip-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClipListComponent {
  clips = input.required<AudioClip[]>();
  deleteClip = output<string>();
  selectedClip = model<SelectedAudio | undefined>(undefined);

  onDeleteClip(clipId: string): void {
    this.deleteClip.emit(clipId);
  }

  onSelectAudio(clip: SelectedAudio) {
    this.selectedClip.set(clip);
  }
}