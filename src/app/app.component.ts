import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { SetupComponent } from './ai/setup.component';
import { DetectAIComponent } from './detect-ai.component';

@Component({
  selector: 'app-root',
  imports: [DetectAIComponent, SetupComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  showSetup = signal(false);
  showUserAgent = signal(false);
  btnSetupText = computed(() => this.showSetup() ? 'Hide Setup' : 'Show Setup');
  btnUserAgentText = computed(() => this.showUserAgent() ? 'Hide User Agent' : 'Show User Agent');
  
  fullYear = new Date().getFullYear();
}
