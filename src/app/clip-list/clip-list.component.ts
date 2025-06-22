import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
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

  onDeleteClip(id: string): void {
    this.deleteClip.emit(id);
  }
}