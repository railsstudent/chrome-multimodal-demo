import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { ClipItemComponent } from '../clip-item/clip-item.component';
import { AudioClip } from '../types';

@Component({
  selector: 'app-clip-list',
  imports: [ClipItemComponent],
  templateUrl: './clip-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClipListComponent {
  clips = input.required<AudioClip[]>();
  deleteClip = output<string>();
  selectedClipId = signal('');

  onDeleteClip(clipId: string): void {
    this.deleteClip.emit(clipId);
  }

  onSelectAudio(clipId: string) {
    this.selectedClipId.set(clipId);
  }
}