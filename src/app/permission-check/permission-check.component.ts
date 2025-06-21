import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { PermissionStatus } from '../services/audio-recorder.service';

@Component({
  selector: 'app-permission-check',
  standalone: true,
  imports: [],
  templateUrl: './permission-check.component.html',
  styleUrls: ['./permission-check.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionCheckComponent {
  permissionStatus = input.required<PermissionStatus>();
  recorderError = input.required<string>();
  requestPermission = output<void>(); // Renamed for parent binding clarity

  onRequestPermissionClick(): void {
    this.requestPermission.emit();
  }
}
