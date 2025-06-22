import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WebDictaphoneComponent } from './web-dictaphone/web-dictaphone.component';

@Component({
  selector: 'app-root',
  imports: [
    WebDictaphoneComponent,
  ],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  fullYear = new Date().getFullYear();
}
