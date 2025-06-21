import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-permission-check',
  templateUrl: './permission-check.component.html',
  styleUrls: ['./permission-check.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionCheckComponent {
  permissionStatus = input.required<PermissionState>();
  recorderError = input.required<string>();
  requestPermission = output<void>(); // Renamed for parent binding clarity

  onRequestPermissionClick(): void {
    this.requestPermission.emit();
  }
}
